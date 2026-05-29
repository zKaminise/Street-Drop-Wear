import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromCookies } from '@/lib/admin-auth'

export async function GET() {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [totalOrders, pendingOrders, totalProducts, totalBases, totalStamps, recentOrders] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: { in: ['CREATED', 'PAYMENT_PENDING', 'IN_PREPARATION'] } } }),
    prisma.product.count({ where: { active: true } }),
    prisma.shirtBase.count({ where: { active: true } }),
    prisma.stamp.count({ where: { active: true } }),
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    }),
  ])

  const totalRevenue = await prisma.order.aggregate({
    _sum: { total: true },
    where: { paymentStatus: 'APPROVED' },
  })

  const lowStock = await prisma.stockItem.findMany({
    where: { quantity: { lte: 5 } },
    include: { color: { include: { base: true } } },
    take: 10,
  })

  return NextResponse.json({
    totalOrders,
    pendingOrders,
    totalProducts,
    totalBases,
    totalStamps,
    totalRevenue: totalRevenue._sum.total ?? 0,
    recentOrders,
    lowStock,
  })
}
