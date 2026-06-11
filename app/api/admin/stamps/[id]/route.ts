import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromCookies } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { stampCategory, categoryId, ...rest } = await req.json()
  const stamp = await prisma.stamp.update({
    where: { id: params.id },
    data: {
      ...rest,
      categoryId: categoryId || null,
    },
    include: { stampCategory: { select: { id: true, name: true, slug: true } } },
  })
  return NextResponse.json(stamp)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.stamp.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
