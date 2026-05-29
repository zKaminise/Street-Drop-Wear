import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') // OVERSIZED | CAMISETA

  const combinations = await prisma.shirtCombination.findMany({
    where: {
      active: true,
      ...(type ? { base: { type } } : {}),
    },
    select: {
      id: true,
      baseId: true,
      colorId: true,
      stampId: true,
      imageFront: true,
      imageBack: true,
    },
  })

  return NextResponse.json(combinations)
}
