import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromCookies } from '@/lib/admin-auth'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const order = await db.order.findUnique({
    where: { id: params.id },
    include: {
      items: true,
      customer: true,
      address: true,
      statusHistory: { orderBy: { createdAt: 'asc' } },
    },
  })
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(order)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const {
    status,
    paymentStatus,
    trackingCode,
    carrier,
    estimatedDelivery,
    notes,
    internalNotes,
    statusNote,
  } = await req.json()

  const existing = await prisma.order.findUnique({ where: { id: params.id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const order = await prisma.order.update({
    where: { id: params.id },
    data: {
      ...(status ? { status } : {}),
      ...(paymentStatus ? { paymentStatus } : {}),
      ...(trackingCode !== undefined ? { trackingCode } : {}),
      ...(carrier !== undefined ? { carrier } : {}),
      ...(estimatedDelivery !== undefined ? { estimatedDelivery } : {}),
      ...(notes !== undefined ? { notes } : {}),
      ...(internalNotes !== undefined ? { internalNotes } : {}),
    },
  })

  // Add status history entry when status changes
  if (status && status !== existing.status) {
    await db.orderStatusHistory.create({
      data: {
        orderId: params.id,
        status,
        note: statusNote || null,
        createdBy: 'admin',
      },
    })
  }

  // Return full order with history
  const full = await db.order.findUnique({
    where: { id: params.id },
    include: {
      items: true,
      customer: true,
      address: true,
      statusHistory: { orderBy: { createdAt: 'asc' } },
    },
  })

  return NextResponse.json(full ?? order)
}
