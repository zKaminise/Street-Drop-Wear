import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromCookies } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const db = prisma as any

export async function GET(req: NextRequest) {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const productType = searchParams.get('productType')
  const gender = searchParams.get('gender')
  const category = searchParams.get('category')

  const where: Record<string, unknown> = {}
  if (productType) where.productType = productType
  if (gender) where.gender = gender
  if (category !== null) where.category = category === '' ? null : category

  const tables = await db.sizeTable.findMany({
    where,
    include: { rows: { orderBy: { sortOrder: 'asc' } } },
    orderBy: [{ productType: 'asc' }, { sortOrder: 'asc' }],
  })

  return NextResponse.json(tables)
}

export async function POST(req: NextRequest) {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, productType, gender, category, columns, active, sortOrder, rows } = await req.json()
  if (!name || !productType) {
    return NextResponse.json({ error: 'name e productType são obrigatórios' }, { status: 400 })
  }

  const table = await db.sizeTable.create({
    data: {
      name,
      productType,
      gender: gender || null,
      category: category || null,
      columns: JSON.stringify(columns ?? []),
      active: active ?? true,
      sortOrder: sortOrder ?? 0,
    },
  })

  if (Array.isArray(rows) && rows.length > 0) {
    await db.sizeTableRow.createMany({
      data: rows.map((r: { size: string; values: string[] }, i: number) => ({
        tableId: table.id,
        size: r.size,
        values: JSON.stringify(r.values ?? []),
        sortOrder: i,
      })),
    })
  }

  const full = await db.sizeTable.findUnique({
    where: { id: table.id },
    include: { rows: { orderBy: { sortOrder: 'asc' } } },
  })
  return NextResponse.json(full, { status: 201 })
}
