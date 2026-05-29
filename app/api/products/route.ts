import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')
  const search = searchParams.get('search')
  const slug = searchParams.get('slug')
  const flashSale = searchParams.get('flashSale') === 'true'

  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined

  const products = await prisma.product.findMany({
    where: {
      active: true,
      ...(type ? { type } : {}),
      ...(search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      } : {}),
      ...(slug ? { slug } : {}),
      ...(flashSale ? { isFlashSale: true } : {}),
    },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      variants: { where: { active: true } },
    },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    ...(limit ? { take: limit } : {}),
  })

  return NextResponse.json(products)
}
