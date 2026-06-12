import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromCookies } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const STOCK_SIZES = ['PP', 'P', 'M', 'G', 'GG', 'XGG']

export async function GET() {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const bases = await prisma.shirtBase.findMany({
    include: {
      colors: { include: { stock: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(bases)
}

export async function POST(req: NextRequest) {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { colors, ...data } = body

  const base = await prisma.shirtBase.create({
    data: {
      ...data,
      ...(colors ? {
        colors: {
          create: colors.map((c: { name: string; hex: string }) => ({
            name: c.name,
            hex: c.hex,
            active: true,
          })),
        },
      } : {}),
    },
    include: { colors: { include: { stock: true } } },
  })

  // Auto-create StockItems (quantity 0) for every size on every new color
  for (const color of base.colors) {
    await prisma.stockItem.createMany({
      data: STOCK_SIZES.map(size => ({ colorId: color.id, size, quantity: 0 })),
      skipDuplicates: true,
    })
  }

  return NextResponse.json(base)
}
