import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromCookies } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const db = prisma as any

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const table = await db.sizeTable.findUnique({
    where: { id: params.id },
    include: { rows: { orderBy: { sortOrder: 'asc' } } },
  })
  if (!table) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(table)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, productType, gender, category, columns, active, sortOrder, rows } = await req.json()

  await db.sizeTable.update({
    where: { id: params.id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(productType !== undefined ? { productType } : {}),
      ...(gender !== undefined ? { gender: gender || null } : {}),
      ...(category !== undefined ? { category: category || null } : {}),
      ...(columns !== undefined ? { columns: JSON.stringify(columns) } : {}),
      ...(active !== undefined ? { active } : {}),
      ...(sortOrder !== undefined ? { sortOrder } : {}),
    },
  })

  // Replace all rows if provided
  if (Array.isArray(rows)) {
    await db.sizeTableRow.deleteMany({ where: { tableId: params.id } })
    if (rows.length > 0) {
      await db.sizeTableRow.createMany({
        data: rows.map((r: { size: string; values: string[] }, i: number) => ({
          tableId: params.id,
          size: r.size,
          values: JSON.stringify(r.values ?? []),
          sortOrder: i,
        })),
      })
    }
  }

  const updated = await db.sizeTable.findUnique({
    where: { id: params.id },
    include: { rows: { orderBy: { sortOrder: 'asc' } } },
  })
  return NextResponse.json(updated)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await db.sizeTable.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
