import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromCookies } from '@/lib/admin-auth'

export async function GET() {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const kits = await prisma.kit.findMany({
    include: { items: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  })
  return NextResponse.json(kits)
}

export async function POST(req: NextRequest) {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { items, ...data } = await req.json()
  const kit = await prisma.kit.create({
    data: {
      ...data,
      ...(items ? { items: { create: items.map((label: string) => ({ label })) } } : {}),
    },
    include: { items: true },
  })
  return NextResponse.json(kit)
}
