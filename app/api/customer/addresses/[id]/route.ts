import { NextRequest, NextResponse } from 'next/server'
import { getCustomerFromCookies } from '@/lib/customer-auth'
import { prisma } from '@/lib/prisma'

async function guardAddress(id: string, customerId: string) {
  const addr = await prisma.address.findFirst({ where: { id, customerId } })
  return addr
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const payload = await getCustomerFromCookies()
  if (!payload) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const addr = await guardAddress(params.id, payload.id)
  if (!addr) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

  const { label, zipCode, street, number, complement, district, city, state, isDefault } = await req.json()

  if (isDefault) {
    await prisma.address.updateMany({
      where: { customerId: payload.id },
      data: { isDefault: false },
    })
  }

  const updated = await prisma.address.update({
    where: { id: params.id },
    data: {
      ...(label !== undefined ? { label } : {}),
      ...(zipCode !== undefined ? { zipCode } : {}),
      ...(street !== undefined ? { street } : {}),
      ...(number !== undefined ? { number } : {}),
      ...(complement !== undefined ? { complement } : {}),
      ...(district !== undefined ? { district } : {}),
      ...(city !== undefined ? { city } : {}),
      ...(state !== undefined ? { state } : {}),
      ...(isDefault !== undefined ? { isDefault } : {}),
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const payload = await getCustomerFromCookies()
  if (!payload) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const addr = await guardAddress(params.id, payload.id)
  if (!addr) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

  await prisma.address.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
