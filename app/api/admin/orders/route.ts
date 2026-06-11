import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromCookies } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const paymentStatusParam = searchParams.get('paymentStatus') // e.g. "APPROVED" or "PENDING,IN_PROCESS"
  const search = searchParams.get('search')

  // Support comma-separated payment statuses
  const paymentStatusFilter = paymentStatusParam
    ? paymentStatusParam.includes(',')
      ? { in: paymentStatusParam.split(',') }
      : paymentStatusParam
    : undefined

  const orders = await (prisma as any).order.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(paymentStatusFilter
        ? typeof paymentStatusFilter === 'string'
          ? { paymentStatus: paymentStatusFilter }
          : { paymentStatus: paymentStatusFilter }
        : {}),
      ...(search ? {
        OR: [
          { orderNumber: { contains: search } },
          { guestEmail: { contains: search } },
          { customer: { name: { contains: search } } },
          { guestName: { contains: search } },
        ],
      } : {}),
    },
    include: {
      items: true,
      customer: { select: { name: true, email: true } },
      payment: {
        select: {
          mpPaymentId: true, mpPreferenceId: true, status: true,
          paymentMethodId: true, paymentTypeId: true, amount: true, approvedAt: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })
  return NextResponse.json(orders)
}
