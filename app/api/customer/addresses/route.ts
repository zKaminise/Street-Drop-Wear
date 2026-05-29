import { NextRequest, NextResponse } from 'next/server'
import { getCustomerFromCookies } from '@/lib/customer-auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const payload = await getCustomerFromCookies()
  if (!payload) return NextResponse.json({ error: 'NÃ£o autenticado' }, { status: 401 })

  const addresses = await prisma.address.findMany({
    where: { customerId: payload.id },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  })
  return NextResponse.json(addresses)
}

export async function POST(req: NextRequest) {
  const payload = await getCustomerFromCookies()
  if (!payload) return NextResponse.json({ error: 'NÃ£o autenticado' }, { status: 401 })

  const { label, zipCode, street, number, complement, district, city, state, isDefault } = await req.json()

  if (!zipCode || !street || !number || !district || !city || !state) {
    return NextResponse.json({ error: 'Campos obrigatÃ³rios faltando.' }, { status: 400 })
  }

  // If setting as default, unset others first
  if (isDefault) {
    await prisma.address.updateMany({
      where: { customerId: payload.id },
      data: { isDefault: false },
    })
  }

  const address = await prisma.address.create({
    data: {
      customerId: payload.id,
      label: label || 'Casa',
      zipCode,
      street,
      number,
      complement: complement || null,
      district,
      city,
      state,
      isDefault: isDefault ?? false,
    },
  })

  return NextResponse.json(address, { status: 201 })
}
