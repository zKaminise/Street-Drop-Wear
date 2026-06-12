import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromCookies } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const STOCK_SIZES = ['PP', 'P', 'M', 'G', 'GG', 'XGG']

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { colors, ...data } = await req.json()

  // 1. Update base fields
  await prisma.shirtBase.update({ where: { id: params.id }, data })

  // 2. Sync colors: delete removed, update existing, create new
  if (Array.isArray(colors)) {
    const existing = await prisma.baseColor.findMany({ where: { baseId: params.id } })
    const incomingIds = (colors as Array<{ id?: string }>).filter(c => c.id).map(c => c.id!)

    // Delete colors that are no longer in the list
    const toDelete = existing.filter(c => !incomingIds.includes(c.id))
    for (const c of toDelete) {
      await prisma.baseColor.delete({ where: { id: c.id } })
    }

    // Update / create
    for (const c of colors as Array<{ id?: string; name: string; hex: string; active?: boolean }>) {
      if (c.id) {
        await prisma.baseColor.update({
          where: { id: c.id },
          data: { name: c.name, hex: c.hex, active: c.active ?? true },
        })
      } else {
        // New color — create and auto-generate StockItems for all sizes
        const newColor = await prisma.baseColor.create({
          data: { baseId: params.id, name: c.name, hex: c.hex, active: true },
        })
        await prisma.stockItem.createMany({
          data: STOCK_SIZES.map(size => ({ colorId: newColor.id, size, quantity: 0 })),
          skipDuplicates: true,
        })
      }
    }
  }

  const updated = await prisma.shirtBase.findUnique({
    where: { id: params.id },
    include: { colors: { include: { stock: true } } },
  })
  return NextResponse.json(updated)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.shirtBase.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
