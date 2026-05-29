import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromCookies } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const db = prisma as any

export async function GET() {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let cfg = await db.shippingConfig.findFirst()
  if (!cfg) {
    cfg = await db.shippingConfig.create({
      data: {
        originZipCode: '01001000',
        fixedShippingEnabled: true,
        fixedShippingValue: 19.9,
        freeShippingAbove: 199.9,
        productionDaysStd: 7,
        productionDaysCustom: 12,
      },
    })
  }
  return NextResponse.json(cfg)
}

export async function PUT(req: NextRequest) {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const {
    originZipCode, fixedShippingEnabled, fixedShippingValue,
    freeShippingAbove, productionDaysStd, productionDaysCustom,
  } = body

  let cfg = await db.shippingConfig.findFirst()

  if (cfg) {
    cfg = await db.shippingConfig.update({
      where: { id: cfg.id },
      data: {
        ...(originZipCode !== undefined ? { originZipCode } : {}),
        ...(fixedShippingEnabled !== undefined ? { fixedShippingEnabled } : {}),
        ...(fixedShippingValue !== undefined ? { fixedShippingValue: Number(fixedShippingValue) } : {}),
        ...(freeShippingAbove !== undefined ? { freeShippingAbove: Number(freeShippingAbove) } : {}),
        ...(productionDaysStd !== undefined ? { productionDaysStd: Number(productionDaysStd) } : {}),
        ...(productionDaysCustom !== undefined ? { productionDaysCustom: Number(productionDaysCustom) } : {}),
      },
    })
  } else {
    cfg = await db.shippingConfig.create({ data: body })
  }

  return NextResponse.json(cfg)
}
