import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromCookies } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { images: true, variants: true },
  })
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(product)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { colorVariants, galleryImages, variants: _v, images: _i, id: _id, createdAt: _c, updatedAt: _u, gender, ...productData } = body

  // Update basic product fields (gender excluded — handled via raw SQL below)
  await prisma.product.update({
    where: { id: params.id },
    data: productData,
  })

  // gender column was added after client generation — update via raw SQL to bypass stale types
  if (gender !== undefined) {
    await prisma.$executeRaw`UPDATE "Product" SET "gender" = ${gender} WHERE "id" = ${params.id}`
  }

  // If colorVariants or galleryImages were sent, replace all images
  if (colorVariants !== undefined || galleryImages !== undefined) {
    // Delete all existing images
    await prisma.productImage.deleteMany({ where: { productId: params.id } })

    // Recreate gallery images
    if (Array.isArray(galleryImages) && galleryImages.length > 0) {
      await prisma.productImage.createMany({
        data: galleryImages.map((url: string, i: number) => ({
          productId: params.id,
          url,
          colorName: null,
          isPrimary: i === 0,
          sortOrder: i,
        })),
      })
    }

    // Delete variants for colors that are no longer in the list
    if (Array.isArray(colorVariants)) {
      const newColorNames = colorVariants.map((cv: any) => cv.name).filter(Boolean) as string[]
      const existingVariants = await prisma.productVariant.findMany({
        where: { productId: params.id },
        select: { id: true, color: true },
      })
      const toDelete = existingVariants
        .filter(v => v.color !== null && !newColorNames.includes(v.color as string))
        .map(v => v.id)
      if (toDelete.length > 0) {
        await prisma.productVariant.deleteMany({ where: { id: { in: toDelete } } })
      }
    }

    // Recreate color-specific images + upsert variants
    if (Array.isArray(colorVariants) && colorVariants.length > 0) {
      for (const cv of colorVariants) {
        // Upsert variant for this color
        const existing = await prisma.productVariant.findFirst({
          where: { productId: params.id, color: cv.name },
        })
        if (!existing) {
          await prisma.productVariant.create({
            data: { productId: params.id, color: cv.name, colorHex: cv.hex, stock: 0, active: true },
          })
        } else {
          await prisma.productVariant.update({
            where: { id: existing.id },
            data: { colorHex: cv.hex },
          })
        }

        // Create color images
        if (Array.isArray(cv.images) && cv.images.length > 0) {
          await prisma.productImage.createMany({
            data: cv.images.map((url: string, i: number) => ({
              productId: params.id,
              url,
              colorName: cv.name,
              isPrimary: i === 0,
              sortOrder: i,
            })),
          })
        }
      }
    }
  }

  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { images: true, variants: true },
  })
  return NextResponse.json(product)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.product.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
