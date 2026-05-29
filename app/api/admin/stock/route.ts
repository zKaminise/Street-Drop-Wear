import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromCookies } from '@/lib/admin-auth'

export async function GET() {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const stock = await prisma.stockItem.findMany({
    include: { color: { include: { base: true } } },
    orderBy: [{ color: { base: { name: 'asc' } } }, { color: { name: 'asc' } }, { size: 'asc' }],
  })
  return NextResponse.json(stock)
}

export async function PUT(req: NextRequest) {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, quantity } = await req.json()
  const item = await prisma.stockItem.update({
    where: { id },
    data: { quantity },
    include: { color: { include: { base: true } } },
  })
  return NextResponse.json(item)
}
