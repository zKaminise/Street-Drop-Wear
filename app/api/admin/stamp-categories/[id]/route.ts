import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromCookies } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, slug, active, sortOrder } = await req.json()
  const cat = await prisma.stampCategory.update({
    where: { id: params.id },
    data: { name, slug, active, sortOrder },
  })
  return NextResponse.json(cat)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Unlink stamps from this category before deleting
  await prisma.stamp.updateMany({
    where: { categoryId: params.id },
    data: { categoryId: null },
  })
  await prisma.stampCategory.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
