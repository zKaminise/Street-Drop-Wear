import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signCustomerToken, CUSTOMER_COOKIE_NAME } from '@/lib/customer-auth'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'E-mail e senha são obrigatórios.' }, { status: 400 })
    }

    const customer = await prisma.customer.findUnique({ where: { email } })
    if (!customer || !customer.active) {
      return NextResponse.json({ error: 'E-mail ou senha incorretos.' }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, customer.password)
    if (!valid) {
      return NextResponse.json({ error: 'E-mail ou senha incorretos.' }, { status: 401 })
    }

    const token = signCustomerToken({ id: customer.id, email: customer.email, name: customer.name })

    const cookieStore = cookies()
    cookieStore.set(CUSTOMER_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return NextResponse.json({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      cpf: customer.cpf,
      createdAt: customer.createdAt,
    })
  } catch (err) {
    console.error('[login]', err)
    return NextResponse.json({ error: 'Erro ao fazer login.' }, { status: 500 })
  }
}
