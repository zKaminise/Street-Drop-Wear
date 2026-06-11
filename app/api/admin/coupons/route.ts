import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromCookies } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    const admin = await getAdminFromCookies()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const coupons = await (prisma as any).discountCoupon.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(coupons)
  } catch (err: any) {
    console.error('[GET /api/admin/coupons]', err)
    return NextResponse.json({ error: err?.message ?? 'Erro interno' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminFromCookies()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { code, description, discount, maxUses, active } = await req.json()

    if (!code || typeof discount !== 'number') {
      return NextResponse.json({ error: 'code e discount são obrigatórios.' }, { status: 400 })
    }

    const normalized = String(code).trim().toUpperCase()

    // Check uniqueness
    const existing = await (prisma as any).discountCoupon.findUnique({ where: { code: normalized } })
    if (existing) {
      return NextResponse.json({ error: `Cupom "${normalized}" já existe.` }, { status: 400 })
    }

    const coupon = await (prisma as any).discountCoupon.create({
      data: {
        code: normalized,
        description: description || null,
        discount,
        maxUses: maxUses ?? null,
        active: active ?? true,
      },
    })
    return NextResponse.json(coupon, { status: 201 })
  } catch (err: any) {
    console.error('[POST /api/admin/coupons]', err)
    return NextResponse.json({ error: err?.message ?? 'Erro interno' }, { status: 500 })
  }
}
