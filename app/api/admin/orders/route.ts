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
  const search = searchParams.get('search')

  const orders = await (prisma as any).order.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(search ? {
        OR: [
          { orderNumber: { contains: search } },
          { guestEmail: { contains: search } },
          { customer: { name: { contains: search } } },
        ],
      } : {}),
    },
    include: {
      items: true,
      customer: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })
  return NextResponse.json(orders)
}
