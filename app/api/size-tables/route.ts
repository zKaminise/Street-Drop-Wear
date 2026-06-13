import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const db = prisma as any

// GET /api/size-tables?productType=OVERSIZED&gender=MASCULINO&category=regata
// Returns the best-matching active size table(s)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const productType = searchParams.get('productType') ?? ''
  const gender = searchParams.get('gender') ?? null
  const category = searchParams.get('category') ?? null

  if (!productType) return NextResponse.json([], { status: 200 })

  // Try exact match first (productType + gender + category)
  const where: Record<string, unknown> = { productType, active: true }
  if (gender) where.gender = gender
  if (category) where.category = category

  let tables = await db.sizeTable.findMany({
    where,
    include: { rows: { orderBy: { sortOrder: 'asc' } } },
    orderBy: { sortOrder: 'asc' },
  })

  // Fallback 1: same productType + gender, no category filter
  if (tables.length === 0 && category) {
    const fallbackWhere: Record<string, unknown> = { productType, active: true, category: null }
    if (gender) fallbackWhere.gender = gender
    tables = await db.sizeTable.findMany({
      where: fallbackWhere,
      include: { rows: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { sortOrder: 'asc' },
    })
  }

  // Fallback 2: productType only
  if (tables.length === 0) {
    tables = await db.sizeTable.findMany({
      where: { productType, active: true, gender: null, category: null },
      include: { rows: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { sortOrder: 'asc' },
    })
  }

  return NextResponse.json(tables)
}
