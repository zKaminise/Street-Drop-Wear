import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromCookies } from '@/lib/admin-auth'

export async function GET() {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const bases = await prisma.shirtBase.findMany({
    include: {
      colors: { include: { stock: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(bases)
}

export async function POST(req: NextRequest) {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { colors, ...data } = body

  const base = await prisma.shirtBase.create({
    data: {
      ...data,
      ...(colors ? {
        colors: {
          create: colors.map((c: { name: string; hex: string }) => ({
            name: c.name,
            hex: c.hex,
            active: true,
          })),
        },
      } : {}),
    },
    include: { colors: { include: { stock: true } } },
  })
  return NextResponse.json(base)
}
