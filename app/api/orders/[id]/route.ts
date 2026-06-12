import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCustomerFromCookies } from '@/lib/customer-auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const db = prisma as any

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const payload = await getCustomerFromCookies()

  const include = {
    items: true,
    address: true,
    statusHistory: { orderBy: { createdAt: 'asc' } },
    payment: {
      select: {
        mpPaymentId: true, status: true,
        paymentMethodId: true, paymentTypeId: true, approvedAt: true,
      },
    },
  }

  // Aceita tanto o id interno (cuid) quanto o orderNumber (SDW...)
  let order = await db.order.findUnique({ where: { id: params.id }, include })
  if (!order) {
    order = await db.order.findFirst({ where: { orderNumber: params.id }, include })
  }

  if (!order) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

  if (payload && order.customerId && order.customerId !== payload.id) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  return NextResponse.json(order)
}
