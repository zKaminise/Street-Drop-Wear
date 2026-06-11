import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromCookies } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// POST — create a product variant (used for Geek/3D products with no variants)
export async function POST(req: NextRequest) {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { productId, color, colorHex, size, stock } = await req.json()

  if (!productId) return NextResponse.json({ error: 'productId required' }, { status: 400 })

  // If a variant with the same color/size already exists, just update its stock
  const existing = await prisma.productVariant.findFirst({
    where: { productId, color: color ?? null, size: size ?? null },
  })

  if (existing) {
    const updated = await prisma.productVariant.update({
      where: { id: existing.id },
      data: { stock: Math.max(0, parseInt(stock) || 0) },
    })
    return NextResponse.json(updated)
  }

  const variant = await prisma.productVariant.create({
    data: {
      productId,
      color: color ?? null,
      colorHex: colorHex ?? null,
      size: size ?? null,
      stock: Math.max(0, parseInt(stock) || 0),
      active: true,
    },
  })
  return NextResponse.json(variant, { status: 201 })
}
