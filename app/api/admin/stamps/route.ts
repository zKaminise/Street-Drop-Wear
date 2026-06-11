import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromCookies } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const stamps = await prisma.stamp.findMany({
    orderBy: { createdAt: 'desc' },
    include: { stampCategory: { select: { id: true, name: true, slug: true } } },
  })
  return NextResponse.json(stamps)
}

export async function POST(req: NextRequest) {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { categoryId, stampCategory, ...rest } = await req.json()
  const stamp = await prisma.stamp.create({
    data: {
      ...rest,
      ...(categoryId ? { categoryId } : {}),
    },
    include: { stampCategory: { select: { id: true, name: true, slug: true } } },
  })
  return NextResponse.json(stamp)
}
