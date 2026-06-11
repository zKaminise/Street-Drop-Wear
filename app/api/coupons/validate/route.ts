import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET /api/coupons/validate?code=CUPOM
export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get('code')?.trim().toUpperCase()
    if (!code) return NextResponse.json({ valid: false, message: 'Código não informado.' }, { status: 400 })

    const coupon = await (prisma as any).discountCoupon.findUnique({
      where: { code },
    })

    if (!coupon) {
      return NextResponse.json({ valid: false, message: 'Cupom não encontrado.' })
    }
    if (!coupon.active) {
      return NextResponse.json({ valid: false, message: 'Este cupom está inativo.' })
    }
    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ valid: false, message: 'Este cupom atingiu o limite de usos.' })
    }

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discount: coupon.discount,
      freeShipping: coupon.freeShipping ?? false,
      description: coupon.description,
    })
  } catch (err: any) {
    console.error('[GET /api/coupons/validate]', err)
    return NextResponse.json({ valid: false, message: 'Erro interno ao validar cupom.' }, { status: 500 })
  }
}
