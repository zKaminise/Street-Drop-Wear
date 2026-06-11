import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromCookies } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const cats = await prisma.stampCategory.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    include: { _count: { select: { stamps: true } } },
  })
  return NextResponse.json(cats)
}

export async function POST(req: NextRequest) {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, slug, active, sortOrder } = await req.json()
  if (!name || !slug) return NextResponse.json({ error: 'name e slug obrigatorios' }, { status: 400 })

  const cat = await prisma.stampCategory.create({
    data: { name, slug, active: active ?? true, sortOrder: sortOrder ?? 0 },
  })
  return NextResponse.json(cat)
}
