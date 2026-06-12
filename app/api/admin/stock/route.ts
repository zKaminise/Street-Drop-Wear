import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromCookies } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const SIZES = ['PP', 'P', 'M', 'G', 'GG', 'XGG']

export async function GET() {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Self-heal: create StockItems for any color/size combo that is missing
  const colors = await prisma.baseColor.findMany({ include: { stock: true } })
  for (const color of colors) {
    const existingSizes = new Set(color.stock.map(s => s.size))
    const missing = SIZES.filter(s => !existingSizes.has(s))
    if (missing.length > 0) {
      await prisma.stockItem.createMany({
        data: missing.map(size => ({ colorId: color.id, size, quantity: 0 })),
        skipDuplicates: true,
      })
    }
  }

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
