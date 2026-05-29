import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromCookies } from '@/lib/admin-auth'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { base, color, stamp, ...data } = body

  const combination = await prisma.shirtCombination.update({
    where: { id: params.id },
    data,
    include: {
      base: { select: { id: true, name: true, type: true } },
      color: { select: { id: true, name: true, hex: true } },
      stamp: { select: { id: true, name: true, slug: true } },
    },
  })

  return NextResponse.json(combination)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.shirtCombination.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
