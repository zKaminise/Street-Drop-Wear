import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const SECRET = process.env.CUSTOMER_JWT_SECRET || 'streetdrop-customer-secret-2024'
const COOKIE_NAME = 'sdw-customer-token'
const EXPIRES_IN = '7d'

export type CustomerTokenPayload = {
  id: string
  email: string
  name: string
}

export function signCustomerToken(payload: CustomerTokenPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN })
}

export function verifyCustomerToken(token: string): CustomerTokenPayload | null {
  try {
    return jwt.verify(token, SECRET) as CustomerTokenPayload
  } catch {
    return null
  }
}

export async function getCustomerFromCookies(): Promise<CustomerTokenPayload | null> {
  const cookieStore = cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyCustomerToken(token)
}

export { COOKIE_NAME as CUSTOMER_COOKIE_NAME }
