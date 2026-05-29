import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signAdminToken, ADMIN_COOKIE_NAME } from '@/lib/admin-auth'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  const admin = await prisma.adminUser.findUnique({ where: { email } })
  if (!admin || !admin.active) {
    return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 })
  }

  const valid = await bcrypt.compare(password, admin.password)
  if (!valid) {
    return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 })
  }

  const token = signAdminToken({ id: admin.id, email: admin.email, name: admin.name, role: admin.role })

  const res = NextResponse.json({ ok: true, name: admin.name, role: admin.role })
  res.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8,
    path: '/',
  })
  return res
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.delete(ADMIN_COOKIE_NAME)
  return res
}
