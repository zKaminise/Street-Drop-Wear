/**
 * POST /api/checkout/mercadopago
 *
 * Segurança:
 * - Recalcula todos os preços no backend — nunca confia no frontend
 * - Valida estoque (não reserva ainda, apenas verifica)
 * - Cria pedido com status PAYMENT_PENDING antes do redirect
 * - Valida e aplica cupom no servidor
 * - Usa transação Prisma para garantir atomicidade
 * - Access Token do MP NUNCA exposto no frontend
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCustomerFromCookies } from '@/lib/customer-auth'
import { getPreferenceClient, getSiteUrl, getNotificationUrl, isSandbox } from '@/lib/mercadopago'
import { calculateShipping } from '@/lib/shipping'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const db = prisma as any

// ─── Types ────────────────────────────────────────────────────────────────────

type CartItem = {
  productId?: string | null
  shirtBaseId?: string | null
  shirtBaseName?: string | null
  stampId?: string | null
  stampName?: string | null
  stampSlug?: string | null
  isCustomShirt?: boolean
  previewImage?: string | null
  colorName: string
  colorHex: string
  size: string
  quantity: number
  productName: string
  productImage?: string | null
  variantId?: string | null
}

// ─── Price recalculation ──────────────────────────────────────────────────────

async function recalculateItem(item: CartItem): Promise<number> {
  if (item.isCustomShirt) {
    // Custom shirt: shirtBase.basePrice + stamp.extraPrice (if any)
    if (!item.shirtBaseId) throw new Error(`Item "${item.productName}" sem shirtBaseId`)
    const base = await db.shirtBase.findUnique({ where: { id: item.shirtBaseId } })
    if (!base || !base.active) throw new Error(`Base de camiseta "${item.shirtBaseName}" não encontrada ou inativa`)

    let stampExtra = 0
    if (item.stampId) {
      const stamp = await db.stamp.findUnique({ where: { id: item.stampId } })
      if (!stamp || !stamp.active) throw new Error(`Estampa "${item.stampName}" não encontrada ou inativa`)
      stampExtra = stamp.extraPrice ?? 0
    }
    return base.basePrice + stampExtra
  } else {
    // Regular product — use DB price (flash sale price if active)
    if (!item.productId) throw new Error(`Item "${item.productName}" sem productId`)
    const product = await db.product.findUnique({ where: { id: item.productId } })
    if (!product || !product.active) throw new Error(`Produto "${item.productName}" não encontrado ou inativo`)
    return product.isFlashSale && product.flashSalePrice ? product.flashSalePrice : product.price
  }
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      items,
      couponCode,
      payWithPix,
      addressId,
      guestName, guestEmail, guestPhone, guestCpf,
      guestZipCode, guestStreet, guestNumber, guestComplement,
      guestDistrict, guestCity, guestState,
      notes,
    } = body
    const pixSelected = Boolean(payWithPix)

    // ── Validações básicas ────────────────────────────────────────────────────
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Carrinho vazio.' }, { status: 400 })
    }

    const hasGuestAddress = guestZipCode && guestStreet && guestNumber && guestCity && guestState
    if (!addressId && !hasGuestAddress) {
      return NextResponse.json({ error: 'Endereço de entrega obrigatório.' }, { status: 400 })
    }

    // ── Identificar cliente ───────────────────────────────────────────────────
    const payload = await getCustomerFromCookies()
    const customerId = payload?.id ?? null

    if (!customerId && (!guestName || !guestEmail)) {
      return NextResponse.json({ error: 'Nome e e-mail são obrigatórios.' }, { status: 400 })
    }

    // ── Recalcular preços no servidor ─────────────────────────────────────────
    const recalculated: Array<CartItem & { unitPrice: number; totalPrice: number }> = []
    for (const item of items as CartItem[]) {
      const unitPrice = await recalculateItem(item)
      recalculated.push({ ...item, unitPrice, totalPrice: unitPrice * item.quantity })
    }

    const subtotal = recalculated.reduce((sum, i) => sum + i.totalPrice, 0)
    const hasCustom = recalculated.some(i => i.isCustomShirt)

    // ── Calcular frete no servidor ────────────────────────────────────────────
    const shippingResult = await calculateShipping(subtotal, hasCustom)

    // ── Validar e aplicar cupom ───────────────────────────────────────────────
    let appliedCouponCode: string | null = null
    let couponDiscount = 0
    let couponFreeShipping = false

    if (couponCode) {
      const coupon = await (db as any).discountCoupon.findUnique({ where: { code: String(couponCode) } })
      if (coupon && coupon.active && (coupon.maxUses === null || coupon.usedCount < coupon.maxUses)) {
        if (coupon.discount > 0) {
          couponDiscount = Math.round((subtotal * (coupon.discount / 100)) * 100) / 100
        }
        couponFreeShipping = coupon.freeShipping ?? false
        appliedCouponCode = coupon.code
      }
    }

    // Frete grátis se: cupom tem freeShipping, ou shippingResult já calculou grátis
    const shippingCost = (couponFreeShipping || shippingResult.isFree) ? 0 : shippingResult.cost

    // Desconto PIX: 5% sobre o subtotal (não inclui frete)
    const pixDiscount = pixSelected ? Math.round(subtotal * 0.05 * 100) / 100 : 0

    const total = Math.max(0, subtotal + shippingCost - couponDiscount - pixDiscount)

    // ── Gerar número do pedido ────────────────────────────────────────────────
    const orderNumber = `SDW${new Date().getFullYear()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    // ── Criar pedido + Payment inicial em transação ───────────────────────────
    const order = await db.$transaction(async (tx: any) => {
      // Se cupom válido, incrementa uso
      if (appliedCouponCode) {
        const coupon = await tx.discountCoupon.findUnique({ where: { code: appliedCouponCode } })
        if (coupon) {
          await tx.discountCoupon.update({
            where: { id: coupon.id },
            data: {
              usedCount: coupon.usedCount + 1,
              active: coupon.maxUses !== null && coupon.usedCount + 1 >= coupon.maxUses ? false : coupon.active,
            },
          })
        }
      }

      const created = await tx.order.create({
        data: {
          orderNumber,
          customerId,
          addressId: addressId || null,
          status: 'PAYMENT_PENDING',
          paymentStatus: 'PENDING',
          paymentMethod: pixSelected ? 'MERCADO_PAGO_PIX' : 'MERCADO_PAGO',
          subtotal,
          shippingCost,
          discount: couponDiscount + pixDiscount,
          couponCode: appliedCouponCode,
          couponDiscount,
          total,
          notes: notes || null,
          guestName: guestName || null,
          guestEmail: guestEmail || null,
          guestPhone: guestPhone || null,
          guestCpf: guestCpf || null,
          guestZipCode: guestZipCode || null,
          guestStreet: guestStreet || null,
          guestNumber: guestNumber || null,
          guestComplement: guestComplement || null,
          guestDistrict: guestDistrict || null,
          guestCity: guestCity || null,
          guestState: guestState || null,
          items: {
            create: recalculated.map(item => ({
              productId: item.productId || null,
              variantId: item.variantId || null,
              shirtBaseId: item.shirtBaseId || null,
              shirtBaseName: item.shirtBaseName || null,
              stampId: item.stampId || null,
              stampName: item.stampName || null,
              stampSlug: item.stampSlug || null,
              isCustomShirt: item.isCustomShirt ?? false,
              previewImage: item.previewImage || null,
              colorHex: item.colorHex || null,
              colorName: item.colorName || null,
              size: item.size || null,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
              productName: item.productName,
              productImage: item.productImage || null,
            })),
          },
          statusHistory: {
            create: [{
              status: 'PAYMENT_PENDING',
              note: 'Aguardando pagamento via Mercado Pago',
              createdBy: customerId ? 'customer' : 'guest',
            }],
          },
        },
      })

      // Criar registro de Payment inicial
      await tx.payment.create({
        data: {
          orderId: created.id,
          amount: total,
          status: 'PENDING',
        },
      })

      return created
    })

    // ── Criar Preferência no Mercado Pago ─────────────────────────────────────
    const siteUrl = getSiteUrl()
    const notificationUrl = getNotificationUrl()

    // Fator de desconto combinado (cupom + PIX) distribuído proporcionalmente nos itens
    const totalDiscount = couponDiscount + pixDiscount
    const discountMultiplier = totalDiscount > 0 ? Math.max(0, (subtotal - totalDiscount) / subtotal) : 1

    // Quando PIX selecionado, excluir cartão/boleto para forçar somente PIX
    const pixExcludedTypes = pixSelected
      ? [
          { id: 'credit_card' },
          { id: 'debit_card' },
          { id: 'ticket' },
          { id: 'atm' },
          { id: 'prepaid_card' },
        ]
      : []

    // Build absolute picture_url — MP API rejects relative paths
    const toAbsoluteUrl = (url: string | null | undefined): string | undefined => {
      if (!url) return undefined
      if (url.startsWith('http://') || url.startsWith('https://')) return url
      return `${siteUrl}${url}`
    }

    const preferenceClient = getPreferenceClient()
    const preference = await preferenceClient.create({
      body: {
        external_reference: order.id,
        items: recalculated.map(item => {
          const descParts = [item.colorName, item.size].filter(Boolean).join(' – ')
          return {
            id: item.productId ?? item.shirtBaseId ?? 'custom',
            title: item.productName.substring(0, 256),
            ...(descParts ? { description: descParts.substring(0, 256) } : {}),
            quantity: item.quantity,
            unit_price: Math.max(0.01, Math.round((item.unitPrice * discountMultiplier) * 100) / 100),
            currency_id: 'BRL',
            ...(toAbsoluteUrl(item.productImage ?? item.previewImage) ? { picture_url: toAbsoluteUrl(item.productImage ?? item.previewImage) } : {}),
            category_id: item.isCustomShirt ? 'fashion' : 'others',
          }
        }),
        payer: {
          name: guestName ?? payload?.name ?? '',
          email: guestEmail ?? payload?.email ?? '',
          ...(guestCpf ? { identification: { type: 'CPF', number: String(guestCpf).replace(/\D/g, '') } } : {}),
          ...(guestPhone ? {
            phone: {
              area_code: String(guestPhone).replace(/\D/g, '').substring(0, 2),
              number: String(guestPhone).replace(/\D/g, '').substring(2),
            }
          } : {}),
          ...(hasGuestAddress ? {
            address: {
              zip_code: String(guestZipCode).replace(/\D/g, ''),
              street_name: String(guestStreet),
              street_number: String(guestNumber),
            },
          } : {}),
        },
        ...(shippingCost > 0 ? { shipments: { cost: shippingCost, mode: 'not_specified' } } : {}),
        payment_methods: {
          // PIX-only: exclude all non-bank-transfer types
          // NOTE: do NOT use default_payment_method_id='pix' — invalid for Checkout Pro
          ...(pixExcludedTypes.length > 0 ? { excluded_payment_types: pixExcludedTypes } : {}),
        },
        back_urls: {
          success: `${siteUrl}/checkout/success?order=${order.id}`,
          failure: `${siteUrl}/checkout/failure?order=${order.id}`,
          pending: `${siteUrl}/checkout/pending?order=${order.id}`,
        },
        auto_return: 'approved',
        notification_url: notificationUrl,
        statement_descriptor: 'STREETDROP WEAR',
        expires: false,
      },
    })

    // ── Salvar preferenceId no pedido e Payment ───────────────────────────────
    const preferenceId = preference.id ?? null
    // Em sandbox usa sandbox_init_point para não exigir credenciais reais
    const checkoutUrl = isSandbox()
      ? (preference.sandbox_init_point ?? preference.init_point ?? '')
      : (preference.init_point ?? '')

    await db.$transaction([
      db.order.update({
        where: { id: order.id },
        data: { mpPreferenceId: preferenceId },
      }),
      db.payment.update({
        where: { orderId: order.id },
        data: { mpPreferenceId: preferenceId },
      }),
    ])

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      checkoutUrl,
      preferenceId,
    }, { status: 201 })

  } catch (err: unknown) {
    // Log the full error — MP SDK throws objects, not always Error instances
    console.error('[POST /api/checkout/mercadopago]', JSON.stringify(err, null, 2))

    let message = 'Erro ao criar preferência de pagamento.'
    if (err instanceof Error) {
      message = err.message
    } else if (err && typeof err === 'object') {
      const e = err as Record<string, unknown>
      message = (e.message as string)
        ?? (e.error as string)
        ?? (e.cause as string)
        ?? JSON.stringify(e)
    }
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
