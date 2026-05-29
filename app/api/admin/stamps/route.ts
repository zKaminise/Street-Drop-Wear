import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromCookies } from '@/lib/admin-auth'

export async function GET() {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const stamps = await prisma.stamp.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(stamps)
}

export async function POST(req: NextRequest) {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const data = await req.json()
  const stamp = await prisma.stamp.create({ data })
  return NextResponse.json(stamp)
}
