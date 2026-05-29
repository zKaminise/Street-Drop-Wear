import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromCookies } from '@/lib/admin-auth'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { items, ...data } = await req.json()
  const kit = await prisma.kit.update({
    where: { id: params.id },
    data: {
      ...data,
      ...(items ? {
        items: {
          deleteMany: {},
          create: items.map((label: string) => ({ label })),
        },
      } : {}),
    },
    include: { items: true },
  })
  return NextResponse.json(kit)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.kit.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
