import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')
  const search = searchParams.get('search')
  const slug = searchParams.get('slug')
  const flashSale = searchParams.get('flashSale') === 'true'

  const products = await prisma.product.findMany({
    where: {
      active: true,
      ...(type ? { type } : {}),
      ...(search ? { name: { contains: search } } : {}),
      ...(slug ? { slug } : {}),
      ...(flashSale ? { isFlashSale: true } : {}),
    },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      variants: { where: { active: true } },
    },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  })

  return NextResponse.json(products)
}
