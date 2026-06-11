import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') // OVERSIZED | CAMISETA

  const stamps = await prisma.stamp.findMany({
    where: {
      active: true,
      ...(type ? {
        OR: [{ allowedFor: type }, { allowedFor: 'BOTH' }],
      } : {}),
    },
    orderBy: [{ name: 'asc' }],
    include: {
      stampCategory: { select: { id: true, name: true, slug: true, sortOrder: true } },
    },
  })

  // Shape response: flatten stampCategory into top-level fields for easier frontend use
  const response = stamps.map(s => ({
    ...s,
    categoryId:   s.stampCategory?.id   ?? null,
    categoryName: s.stampCategory?.name ?? s.category ?? null,
    categorySortOrder: s.stampCategory?.sortOrder ?? 999,
  }))

  // Sort: by category sortOrder, then by name
  response.sort((a, b) => {
    if (a.categorySortOrder !== b.categorySortOrder) return a.categorySortOrder - b.categorySortOrder
    return a.name.localeCompare(b.name)
  })

  return NextResponse.json(response)
}
