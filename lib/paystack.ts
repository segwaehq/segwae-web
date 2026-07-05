/**
 * Minimal Paystack helpers — initialize a transaction and verify one by reference.
 * Verify-on-callback flow: we never rely on the dashboard webhook (it belongs to
 * another project). Server-only; uses PAYSTACK_SECRET_KEY.
 */

const PAYSTACK_BASE = 'https://api.paystack.co'

function secretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY
  if (!key) throw new Error('PAYSTACK_SECRET_KEY is not set in the environment (.env.local)')
  return key
}

export type InitResult = { authorizationUrl: string; reference: string }

export async function initializeTransaction(params: {
  email: string
  amountKobo: number
  callbackUrl: string
  metadata: Record<string, unknown>
}): Promise<InitResult> {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: params.email,
      amount: params.amountKobo,
      callback_url: params.callbackUrl,
      metadata: params.metadata,
    }),
  })
  const json = await res.json()
  if (!res.ok || !json?.status || !json?.data?.authorization_url) {
    throw new Error(json?.message || 'Could not start the payment')
  }
  return { authorizationUrl: json.data.authorization_url, reference: json.data.reference }
}

export type VerifyResult = {
  success: boolean
  amountKobo: number
  currency: string
  reference: string
}

export async function verifyTransaction(reference: string): Promise<VerifyResult> {
  const res = await fetch(
    `${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${secretKey()}` } },
  )
  const json = await res.json()
  if (!res.ok || !json?.status) {
    throw new Error(json?.message || 'Could not verify the payment')
  }
  return {
    success: json.data?.status === 'success',
    amountKobo: json.data?.amount ?? 0,
    currency: json.data?.currency ?? '',
    reference: json.data?.reference ?? reference,
  }
}
