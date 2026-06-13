import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromCookies } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const type = new URL(req.url).searchParams.get('type')
  const rows = await (prisma as any).productSubcategory.findMany({
    where: { ...(type ? { productType: type } : {}), active: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  })
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { productType, name } = await req.json()
  if (!productType || !name?.trim()) {
    return NextResponse.json({ error: 'productType e name são obrigatórios' }, { status: 400 })
  }

  const existing = await (prisma as any).productSubcategory.findFirst({
    where: { productType, name: name.trim() },
  })
  if (existing) {
    return NextResponse.json({ error: 'Categoria já existe' }, { status: 409 })
  }

  const count = await (prisma as any).productSubcategory.count({ where: { productType } })
  const row = await (prisma as any).productSubcategory.create({
    data: { productType, name: name.trim(), sortOrder: count },
  })
  return NextResponse.json(row, { status: 201 })
}
