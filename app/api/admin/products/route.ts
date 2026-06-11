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
  const { colorVariants, galleryImages, variants: _v, images: _i, ...productData } = body

  // Create product with basic fields
  const product = await prisma.product.create({
    data: productData,
    include: { images: true, variants: true },
  })

  // Create gallery images (no color association)
  if (Array.isArray(galleryImages) && galleryImages.length > 0) {
    await prisma.productImage.createMany({
      data: galleryImages.map((url: string, i: number) => ({
        productId: product.id,
        url,
        colorName: null,
        isPrimary: i === 0,
        sortOrder: i,
      })),
    })
  }

  // Create color-specific images + ensure variants exist
  if (Array.isArray(colorVariants) && colorVariants.length > 0) {
    for (const cv of colorVariants) {
      // Ensure at least one variant for this color
      const existing = await prisma.productVariant.findFirst({
        where: { productId: product.id, color: cv.name },
      })
      if (!existing) {
        await prisma.productVariant.create({
          data: { productId: product.id, color: cv.name, colorHex: cv.hex, stock: 0, active: true },
        })
      }

      // Create images for this color
      if (Array.isArray(cv.images) && cv.images.length > 0) {
        await prisma.productImage.createMany({
          data: cv.images.map((url: string, i: number) => ({
            productId: product.id,
            url,
            colorName: cv.name,
            isPrimary: i === 0,
            sortOrder: i,
          })),
        })
      }
    }
  }

  const full = await prisma.product.findUnique({
    where: { id: product.id },
    include: { images: true, variants: true },
  })

  return NextResponse.json(full)
}
