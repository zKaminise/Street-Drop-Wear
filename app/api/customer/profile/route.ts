import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getCustomerFromCookies } from '@/lib/customer-auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const payload = await getCustomerFromCookies()
  if (!payload) return NextResponse.json({ error: 'NÃ£o autenticado' }, { status: 401 })

  const customer = await prisma.customer.findUnique({
    where: { id: payload.id },
    select: { id: true, name: true, email: true, phone: true, cpf: true, createdAt: true },
  })
  if (!customer) return NextResponse.json({ error: 'NÃ£o encontrado' }, { status: 404 })
  return NextResponse.json(customer)
}

export async function PUT(req: NextRequest) {
  const payload = await getCustomerFromCookies()
  if (!payload) return NextResponse.json({ error: 'NÃ£o autenticado' }, { status: 401 })

  const { name, phone, cpf, currentPassword, newPassword } = await req.json()

  const updateData: Record<string, string> = {}
  if (name) updateData.name = name
  if (phone !== undefined) updateData.phone = phone
  if (cpf !== undefined) updateData.cpf = cpf

  // Password change
  if (newPassword) {
    if (!currentPassword) {
      return NextResponse.json({ error: 'Informe a senha atual.' }, { status: 400 })
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Nova senha deve ter no mÃ­nimo 6 caracteres.' }, { status: 400 })
    }
    const customer = await prisma.customer.findUnique({ where: { id: payload.id } })
    if (!customer) return NextResponse.json({ error: 'NÃ£o encontrado' }, { status: 404 })
    const valid = await bcrypt.compare(currentPassword, customer.password)
    if (!valid) return NextResponse.json({ error: 'Senha atual incorreta.' }, { status: 400 })
    updateData.password = await bcrypt.hash(newPassword, 12)
  }

  const updated = await prisma.customer.update({
    where: { id: payload.id },
    data: updateData,
    select: { id: true, name: true, email: true, phone: true, cpf: true, createdAt: true },
  })

  return NextResponse.json(updated)
}
