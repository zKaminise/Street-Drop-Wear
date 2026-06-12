/**
 * POST /api/orders/[id]/sync
 *
 * Consulta o Mercado Pago diretamente e atualiza o status do pedido no banco.
 * Funciona mesmo se o webhook falhar (secret errado, timeout, etc.).
 * Usado pelo polling da página /checkout/pending.
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getPaymentClient } from '@/lib/mercadopago'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const db = prisma as any

const MP_MAP: Record<string, { paymentStatus: string; orderStatus?: string }> = {
  approved:     { paymentStatus: 'APPROVED',   orderStatus: 'PAYMENT_APPROVED' },
  in_process:   { paymentStatus: 'IN_PROCESS' },
  pending:      { paymentStatus: 'PENDING' },
  rejected:     { paymentStatus: 'REJECTED',   orderStatus: 'CANCELLED' },
  cancelled:    { paymentStatus: 'CANCELLED',  orderStatus: 'CANCELLED' },
  refunded:     { paymentStatus: 'REFUNDED' },
  charged_back: { paymentStatus: 'CHARGED_BACK' },
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json().catch(() => ({}))
    const hintPaymentId: string | null = body.paymentId ?? null

    // Aceita tanto o id interno (cuid) quanto o orderNumber (SDW...)
    let order = await db.order.findUnique({
      where: { id: params.id },
      include: { payment: true },
    })
    if (!order) {
      order = await db.order.findFirst({
        where: { orderNumber: params.id },
        include: { payment: true },
      })
    }

    if (!order) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

    // Já aprovado — nada a fazer
    if (order.paymentStatus === 'APPROVED') {
      return NextResponse.json({ synced: false, order })
    }

    const paymentClient = getPaymentClient() as any
    let mpPayment: any = null

    // 1. Tentar pelo payment_id que o MP pode ter passado na URL de redirect
    const candidateIds = [
      hintPaymentId,
      order.payment?.mpPaymentId,
      order.paymentId,
    ].filter(Boolean)

    for (const pid of candidateIds) {
      try {
        const result = await paymentClient.get({ id: pid })
        if (result?.id) { mpPayment = result; break }
      } catch { /* tenta próximo */ }
    }

    // 2. Buscar via external_reference (= order.id cuid) na API de search do MP
    if (!mpPayment?.id) {
      try {
        const searchResult = await paymentClient.search({
          options: {
            external_reference: order.id,  // sempre o cuid, independente do que veio na URL
            sort: 'date_created',
            criteria: 'desc',
            limit: 1,
          },
        })
        const payments = searchResult?.results ?? searchResult?.elements ?? []
        if (payments.length > 0) mpPayment = payments[0]
      } catch { /* pagamento ainda não existe no MP */ }
    }

    if (!mpPayment?.id) {
      // Pagamento ainda não encontrado — retorna status atual sem atualizar
      return NextResponse.json({ synced: false, order })
    }

    const mpStatus: string = mpPayment.status ?? 'pending'
    const mapping = MP_MAP[mpStatus]
    const internalStatus = mapping?.paymentStatus ?? 'PENDING'

    // Status não mudou — nada a fazer
    if (order.paymentStatus === internalStatus) {
      return NextResponse.json({ synced: false, order })
    }

    const paymentApprovedAt = mpStatus === 'approved'
      ? (mpPayment.date_approved ? new Date(mpPayment.date_approved) : new Date())
      : null

    await db.$transaction(async (tx: any) => {
      const orderUpdate: Record<string, unknown> = {
        paymentStatus: internalStatus,
        paymentId: String(mpPayment.id),
      }
      if (mapping?.orderStatus) orderUpdate.status = mapping.orderStatus
      if (paymentApprovedAt) orderUpdate.paymentApprovedAt = paymentApprovedAt
      await tx.order.update({ where: { id: order.id }, data: orderUpdate })

      const paymentData = {
        mpPaymentId: String(mpPayment.id),
        status: internalStatus,
        paymentMethodId: mpPayment.payment_method_id ?? null,
        paymentTypeId: mpPayment.payment_type_id ?? null,
        amount: mpPayment.transaction_amount ?? order.total,
        ...(paymentApprovedAt ? { approvedAt: paymentApprovedAt } : {}),
        rawData: JSON.stringify({
          id: mpPayment.id,
          status: mpPayment.status,
          status_detail: mpPayment.status_detail,
          transaction_amount: mpPayment.transaction_amount,
          date_approved: mpPayment.date_approved,
        }),
      }

      if (order.payment) {
        await tx.payment.update({ where: { orderId: order.id }, data: paymentData })
      } else {
        await tx.payment.create({ data: { orderId: order.id, ...paymentData } })
      }

      if (mapping?.orderStatus && mapping.orderStatus !== order.status) {
        await tx.orderStatusHistory.create({
          data: {
            orderId: order.id,
            status: mapping.orderStatus,
            note: `Pagamento confirmado via sync direto com MP (PIX/fallback). ID: ${mpPayment.id}`,
            createdBy: 'system',
          },
        })
      }
    })

    const updated = await db.order.findUnique({ where: { id: order.id } })
    return NextResponse.json({ synced: true, order: updated })

  } catch (err) {
    console.error('[POST /api/orders/sync]', err)
    return NextResponse.json({ error: 'Erro ao sincronizar' }, { status: 500 })
  }
}
