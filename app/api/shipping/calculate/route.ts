import { NextRequest, NextResponse } from 'next/server'
import { calculateShipping } from '@/lib/shipping'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

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

// GET: retorna config pública de frete (sem cálculo)
export async function GET() {
  try {
    const result = await calculateShipping(0, false)
    return NextResponse.json({
      freeShippingAbove: result.freeShippingAbove,
      globalFreeShipping: result.globalFreeShipping,
      fixedValue: result.globalFreeShipping ? 0 : result.cost,
    })
  } catch {
    return NextResponse.json({ freeShippingAbove: 199.9, globalFreeShipping: false, fixedValue: 19.9 })
  }
}
