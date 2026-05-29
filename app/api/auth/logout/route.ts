import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { CUSTOMER_COOKIE_NAME } from '@/lib/customer-auth'

export async function POST() {
  const cookieStore = cookies()
  cookieStore.set(CUSTOMER_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
  return NextResponse.json({ ok: true })
}
