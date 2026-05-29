import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signCustomerToken, CUSTOMER_COOKIE_NAME } from '@/lib/customer-auth'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, phone, cpf } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Nome, e-mail e senha são obrigatórios.' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'A senha deve ter no mínimo 6 caracteres.' }, { status: 400 })
    }

    const existing = await prisma.customer.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Este e-mail já está cadastrado.' }, { status: 409 })
    }

    const hashed = await bcrypt.hash(password, 12)

    const customer = await prisma.customer.create({
      data: { name, email, password: hashed, phone: phone || null, cpf: cpf || null },
    })

    const token = signCustomerToken({ id: customer.id, email: customer.email, name: customer.name })

    const cookieStore = cookies()
    cookieStore.set(CUSTOMER_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return NextResponse.json({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      createdAt: customer.createdAt,
    })
  } catch (err) {
    console.error('[register]', err)
    return NextResponse.json({ error: 'Erro ao criar conta.' }, { status: 500 })
  }
}
