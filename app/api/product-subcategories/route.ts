import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const type = new URL(req.url).searchParams.get('type')
  if (!type) return NextResponse.json([])

  const rows = await (prisma as any).productSubcategory.findMany({
    where: { productType: type, active: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    select: { id: true, name: true },
  })
  return NextResponse.json(rows)
}
