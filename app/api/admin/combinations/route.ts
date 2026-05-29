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

  const combinations = await prisma.shirtCombination.findMany({
    where: type ? { base: { type } } : {},
    include: {
      base: { select: { id: true, name: true, type: true } },
      color: { select: { id: true, name: true, hex: true } },
      stamp: { select: { id: true, name: true, slug: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(combinations)
}

export async function POST(req: NextRequest) {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const combination = await prisma.shirtCombination.create({
    data: body,
    include: {
      base: { select: { id: true, name: true, type: true } },
      color: { select: { id: true, name: true, hex: true } },
      stamp: { select: { id: true, name: true, slug: true } },
    },
  })

  return NextResponse.json(combination)
}
