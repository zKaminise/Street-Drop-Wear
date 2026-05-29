import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const SECRET = process.env.ADMIN_JWT_SECRET || 'streetdrop-admin-secret'
const COOKIE_NAME = 'sdw-admin-token'

export type AdminTokenPayload = {
  id: string
  email: string
  name: string
  role: string
}

export function signAdminToken(payload: AdminTokenPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: '8h' })
}

export function verifyAdminToken(token: string): AdminTokenPayload | null {
  try {
    return jwt.verify(token, SECRET) as AdminTokenPayload
  } catch {
    return null
  }
}

export async function getAdminFromCookies(): Promise<AdminTokenPayload | null> {
  const cookieStore = cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyAdminToken(token)
}

export { COOKIE_NAME as ADMIN_COOKIE_NAME }
