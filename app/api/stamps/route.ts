import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') // OVERSIZED | CAMISETA

  const stamps = await prisma.stamp.findMany({
    where: {
      active: true,
      ...(type ? {
        OR: [{ allowedFor: type }, { allowedFor: 'BOTH' }],
      } : {}),
    },
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  })

  return NextResponse.json(stamps)
}
