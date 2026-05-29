import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCustomerFromCookies } from '@/lib/customer-auth'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any

// ─── GET: list orders for a customer ───────────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const customerId = searchParams.get('customerId')
  const orderNumber = searchParams.get('orderNumber')

  if (!customerId && !orderNumber) {
    return NextResponse.json({ error: 'customerId or orderNumber required' }, { status: 400 })
  }

  const orders = await prisma.order.findMany({
    where: {
      ...(customerId ? { customerId } : {}),
      ...(orderNumber ? { orderNumber } : {}),
    },
    include: { items: true, address: true },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(orders)
}

// ─── POST: create a new order ──────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      items,
      subtotal,
      shippingCost,
      discount = 0,
      total,
      notes,
      addressId,
      // guest fields
      guestName, guestEmail, guestPhone, guestCpf,
      guestZipCode, guestStreet, guestNumber, guestComplement,
      guestDistrict, guestCity, guestState,
    } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Carrinho vazio.' }, { status: 400 })
    }
    if (typeof subtotal !== 'number' || typeof total !== 'number') {
      return NextResponse.json({ error: 'Valores inválidos.' }, { status: 400 })
    }

    // Identify customer (logged in or guest)
    const payload = await getCustomerFromCookies()
    const customerId = payload?.id ?? null

    // Require address info
    const hasGuestAddress = guestZipCode && guestStreet && guestNumber && guestCity && guestState
    if (!addressId && !hasGuestAddress) {
      return NextResponse.json({ error: 'Endereço de entrega obrigatório.' }, { status: 400 })
    }
    if (!customerId && !guestName && !guestEmail) {
      return NextResponse.json({ error: 'Dados do comprador obrigatórios.' }, { status: 400 })
    }

    const orderNumber = `SDW${new Date().getFullYear()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    const order = await db.order.create({
      data: {
        orderNumber,
        customerId,
        addressId: addressId || null,
        status: 'CREATED',
        paymentStatus: 'PENDING',
        subtotal,
        shippingCost: shippingCost ?? 0,
        discount,
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
          create: items.map((item: {
            productId?: string
            variantId?: string
            shirtBaseId?: string
            shirtBaseName?: string
            stampId?: string
            stampName?: string
            stampSlug?: string
            isCustomShirt?: boolean
            previewImage?: string
            colorHex?: string
            colorName?: string
            size?: string
            quantity: number
            unitPrice: number
            totalPrice: number
            productName: string
            productImage?: string
          }) => ({
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
            status: 'CREATED',
            note: 'Pedido recebido',
            createdBy: customerId ? 'customer' : 'guest',
          }],
        },
      },
      include: { items: true },
    })

    return NextResponse.json({ id: order.id, orderNumber: order.orderNumber }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/orders]', err)
    return NextResponse.json({ error: 'Erro ao criar pedido.' }, { status: 500 })
  }
}
