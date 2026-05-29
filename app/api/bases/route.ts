import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') // OVERSIZED | CAMISETA

  const bases = await prisma.shirtBase.findMany({
    where: {
      active: true,
      ...(type ? { type } : {}),
    },
    include: {
      colors: {
        where: { active: true },
        include: {
          stock: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(bases)
}
