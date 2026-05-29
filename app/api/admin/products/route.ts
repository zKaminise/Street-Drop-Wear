import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromCookies } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')
  const search = searchParams.get('search')

  const products = await prisma.product.findMany({
    where: {
      ...(type ? { type } : {}),
      ...(search ? { name: { contains: search } } : {}),
    },
    include: { images: true, variants: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  })

  return NextResponse.json(products)
}

export async function POST(req: NextRequest) {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { variants, images, ...data } = body

  const product = await prisma.product.create({
    data: {
      ...data,
      ...(variants ? { variants: { create: variants } } : {}),
      ...(images ? { images: { create: images } } : {}),
    },
    include: { images: true, variants: true },
  })

  return NextResponse.json(product)
}
