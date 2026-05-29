import { NextResponse } from 'next/server'
import { getCustomerFromCookies } from '@/lib/customer-auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  const payload = await getCustomerFromCookies()
  if (!payload) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  try {
    const customer = await prisma.customer.findUnique({
      where: { id: payload.id },
      select: { id: true, name: true, email: true, phone: true, cpf: true, createdAt: true, active: true },
    })
    if (!customer || !customer.active) {
      return NextResponse.json({ error: 'Conta não encontrada' }, { status: 404 })
    }
    return NextResponse.json(customer)
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
