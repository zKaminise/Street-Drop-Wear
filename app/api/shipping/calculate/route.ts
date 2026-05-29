import { NextRequest, NextResponse } from 'next/server'
import { calculateShipping } from '@/lib/shipping'

export async function POST(req: NextRequest) {
  try {
    const { subtotal, hasCustomItem } = await req.json()
    if (typeof subtotal !== 'number') {
      return NextResponse.json({ error: 'subtotal required' }, { status: 400 })
    }
    const result = await calculateShipping(subtotal, hasCustomItem ?? false)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'Erro ao calcular frete' }, { status: 500 })
  }
}
