import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCustomerFromCookies } from '@/lib/customer-auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const db = prisma as any

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const payload = await getCustomerFromCookies()

  const order = await db.order.findUnique({
    where: { id: params.id },
    include: {
      items: true,
      address: true,
      statusHistory: { orderBy: { createdAt: 'asc' } },
      payment: {
        select: {
          mpPaymentId: true, status: true,
          paymentMethodId: true, paymentTypeId: true, approvedAt: true,
        },
      },
    },
  })

  if (!order) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

  if (payload && order.customerId && order.customerId !== payload.id) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  return NextResponse.json(order)
}
