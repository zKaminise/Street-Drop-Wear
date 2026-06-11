import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromCookies } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// PUT /api/admin/product-variants/[id] — update stock for a single ProductVariant
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { stock } = await req.json()

  const variant = await prisma.productVariant.update({
    where: { id: params.id },
    data: { stock: Math.max(0, parseInt(stock) || 0) },
  })

  return NextResponse.json(variant)
}
