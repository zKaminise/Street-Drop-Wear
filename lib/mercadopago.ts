/**
 * Mercado Pago utilities
 * - O Access Token NUNCA é exposto no frontend
 * - Webhook validado com HMAC-SHA256 via x-signature
 */

import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'
import crypto from 'crypto'

// ─── MP Client singleton ─────────────────────────────────────────────────────

let _client: MercadoPagoConfig | null = null

function getMPClient(): MercadoPagoConfig {
  if (!_client) {
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN
    if (!accessToken) throw new Error('MERCADO_PAGO_ACCESS_TOKEN não configurado')
    _client = new MercadoPagoConfig({ accessToken, options: { timeout: 10000 } })
  }
  return _client
}

export function getPreferenceClient() {
  return new Preference(getMPClient())
}

export function getPaymentClient() {
  return new Payment(getMPClient())
}

// ─── Webhook signature validation ────────────────────────────────────────────
// Ref: https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks
// x-signature: "ts=TIMESTAMP,v1=SIGNATURE"
// payload to sign: "id:{data.id};request-id:{x-request-id};ts:{ts};"

export function validateWebhookSignature(params: {
  xSignature: string
  xRequestId: string
  dataId: string
  secret: string
}): boolean {
  const { xSignature, xRequestId, dataId, secret } = params

  try {
    const parts = Object.fromEntries(
      xSignature.split(',').map(p => p.split('=')).map(([k, v]) => [k.trim(), v.trim()])
    )
    const ts = parts['ts']
    const v1 = parts['v1']
    if (!ts || !v1) return false

    const message = `id:${dataId};request-id:${xRequestId};ts:${ts};`
    const expected = crypto.createHmac('sha256', secret).update(message).digest('hex')

    // Constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(v1, 'hex'))
  } catch {
    return false
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function isSandbox(): boolean {
  return (process.env.MERCADO_PAGO_MODE ?? 'sandbox') === 'sandbox'
}

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
}

export function getNotificationUrl(): string {
  return process.env.MERCADO_PAGO_NOTIFICATION_URL ?? `${getSiteUrl()}/api/webhooks/mercadopago`
}
