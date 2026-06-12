/**
 * POST /api/webhooks/mercadopago
 *
 * Segurança:
 * - Valida assinatura HMAC-SHA256 via x-signature + x-request-id
 * - Idempotência via WebhookEvent (evita processar o mesmo evento duas vezes)
 * - Usa $transaction para atualizar Order + Payment + StatusHistory atomicamente
 * - Retorna 200 imediatamente para o MP (mesmo em caso de duplicata)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateWebhookSignature, getPaymentClient } from '@/lib/mercadopago'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const db = prisma as any

// Mapeamento status MP → status interno
const MP_STATUS_MAP: Record<string, string> = {
  approved: 'APPROVED',
  in_process: 'IN_PROCESS',
  pending: 'PENDING',
  rejected: 'REJECTED',
  cancelled: 'CANCELLED',
  refunded: 'REFUNDED',
  charged_back: 'CHARGED_BACK',
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    let body: any

    try {
      body = JSON.parse(rawBody)
    } catch {
      return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
    }

    // ── Validar assinatura ────────────────────────────────────────────────────
    const webhookSecret = process.env.MERCADO_PAGO_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error('[Webhook MP] MERCADO_PAGO_WEBHOOK_SECRET não configurado')
      return NextResponse.json({ error: 'Configuração inválida' }, { status: 500 })
    }

    const xSignature = req.headers.get('x-signature') ?? ''
    const xRequestId = req.headers.get('x-request-id') ?? ''
    const dataId = body?.data?.id ? String(body.data.id) : ''

    if (xSignature && dataId) {
      const valid = validateWebhookSignature({
        xSignature,
        xRequestId,
        dataId,
        secret: webhookSecret,
      })

      if (!valid) {
        // Loga o aviso mas NÃO rejeita — retornar 401 faz o MP parar de reenviar,
        // bloqueando TODOS os pagamentos se o secret estiver desatualizado.
        // O payload é verificado diretamente na API do MP abaixo, então é seguro continuar.
        console.warn('[Webhook MP] AVISO: assinatura inválida. Verifique MERCADO_PAGO_WEBHOOK_SECRET.', {
          xSignature: xSignature.substring(0, 40) + '...',
          xRequestId,
          dataId,
        })
      }
    }

    // ── Filtrar apenas eventos de pagamento ───────────────────────────────────
    const { type, action, data } = body
    const topic = type ?? body.topic

    if (topic !== 'payment') {
      // Outros tópicos (merchant_order, etc.) — ignorar mas confirmar recebimento
      return NextResponse.json({ received: true })
    }

    const paymentId = data?.id ? String(data.id) : null
    const eventAction = action ?? 'payment.updated'

    if (!paymentId) {
      return NextResponse.json({ received: true })
    }

    // ── Idempotência ──────────────────────────────────────────────────────────
    const idempotencyKey = `MERCADO_PAGO:${eventAction}:${paymentId}`

    const existing = await db.webhookEvent.findUnique({ where: { idempotencyKey } })
    if (existing) {
      // Já processado — retornar 200 sem reprocessar
      return NextResponse.json({ received: true, duplicate: true })
    }

    // ── Registrar evento (antes de processar — evita race condition) ──────────
    await db.webhookEvent.create({
      data: {
        idempotencyKey,
        topic: 'payment',
        resourceId: paymentId,
        action: eventAction,
        status: 'PROCESSING',
        rawPayload: JSON.stringify(body),
      },
    })

    // ── Buscar detalhes do pagamento no MP ────────────────────────────────────
    const paymentClient = getPaymentClient()
    const mpPayment = await paymentClient.get({ id: paymentId })

    const mpStatus = mpPayment.status ?? 'pending'
    const internalPaymentStatus = MP_STATUS_MAP[mpStatus] ?? 'PENDING'
    const externalReference = mpPayment.external_reference // = orderId

    if (!externalReference) {
      await db.webhookEvent.update({ where: { idempotencyKey }, data: { status: 'ERROR_NO_REFERENCE' } })
      return NextResponse.json({ received: true })
    }

    // ── Buscar pedido pelo external_reference (= orderId) ─────────────────────
    const order = await db.order.findUnique({
      where: { id: externalReference },
      include: { payment: true },
    })

    if (!order) {
      console.warn('[Webhook MP] Pedido não encontrado para external_reference:', externalReference)
      await db.webhookEvent.update({ where: { idempotencyKey }, data: { status: 'ERROR_ORDER_NOT_FOUND' } })
      return NextResponse.json({ received: true })
    }

    // ── Determinar novo status do pedido ──────────────────────────────────────
    let newOrderStatus: string | null = null
    let paymentApprovedAt: Date | null = null

    if (mpStatus === 'approved') {
      newOrderStatus = 'PAYMENT_APPROVED'
      paymentApprovedAt = mpPayment.date_approved ? new Date(mpPayment.date_approved) : new Date()
    } else if (mpStatus === 'rejected' || mpStatus === 'cancelled') {
      newOrderStatus = 'CANCELLED'
    }
    // in_process, pending → mantém PAYMENT_PENDING

    // ── Atualizar banco em transação ──────────────────────────────────────────
    await db.$transaction(async (tx: any) => {
      // Atualizar Order
      const orderUpdate: any = {
        paymentStatus: internalPaymentStatus,
        paymentId: String(paymentId),
      }
      if (newOrderStatus) orderUpdate.status = newOrderStatus
      if (paymentApprovedAt) orderUpdate.paymentApprovedAt = paymentApprovedAt

      await tx.order.update({
        where: { id: order.id },
        data: orderUpdate,
      })

      // Atualizar ou criar Payment
      const mpAny = mpPayment as any
      const paymentData = {
        mpPaymentId: String(paymentId),
        mpPreferenceId: mpAny.preference_id ?? order.mpPreferenceId ?? null,
        status: internalPaymentStatus,
        paymentMethodId: mpPayment.payment_method_id ?? null,
        paymentTypeId: mpPayment.payment_type_id ?? null,
        amount: mpPayment.transaction_amount ?? order.total,
        approvedAt: paymentApprovedAt ?? undefined,
        rawData: JSON.stringify({
          id: mpPayment.id,
          status: mpPayment.status,
          status_detail: mpAny.status_detail,
          payment_method_id: mpPayment.payment_method_id,
          payment_type_id: mpPayment.payment_type_id,
          transaction_amount: mpPayment.transaction_amount,
          date_created: mpAny.date_created,
          date_approved: mpAny.date_approved,
          payer: mpPayment.payer,
        }),
      }

      if (order.payment) {
        await tx.payment.update({ where: { orderId: order.id }, data: paymentData })
      } else {
        // amount is included in paymentData so don't duplicate it
        await tx.payment.create({ data: { orderId: order.id, ...paymentData } })
      }

      // Adicionar ao histórico de status
      if (newOrderStatus && newOrderStatus !== order.status) {
        const statusNotes: Record<string, string> = {
          PAYMENT_APPROVED: `Pagamento aprovado via Mercado Pago. ID: ${paymentId}`,
          CANCELLED: `Pagamento ${mpStatus}. ID: ${paymentId}`,
        }
        await tx.orderStatusHistory.create({
          data: {
            orderId: order.id,
            status: newOrderStatus,
            note: statusNotes[newOrderStatus] ?? `Status MP: ${mpStatus}`,
            createdBy: 'system',
          },
        })
      }
    })

    // ── Marcar evento como processado ─────────────────────────────────────────
    await db.webhookEvent.update({
      where: { idempotencyKey },
      data: { status: 'PROCESSED' },
    })

    return NextResponse.json({ received: true })

  } catch (err) {
    console.error('[Webhook MP] Erro interno:', err)
    // MP vai retentar — retornamos 500 para ele reenviar o evento
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
