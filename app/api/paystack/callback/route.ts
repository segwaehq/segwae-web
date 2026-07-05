import { NextResponse } from 'next/server'
import { settleReference } from '@/lib/ai/payments'

export const runtime = 'nodejs'

// Paystack redirects the buyer here (?reference=…&trxref=…) after checkout.
export async function GET(request: Request) {
  const url = new URL(request.url)
  const reference = url.searchParams.get('reference') || url.searchParams.get('trxref')
  const dest = new URL('/dashboard/ai-tools', url.origin)

  if (!reference) {
    dest.searchParams.set('payment', 'error')
    return NextResponse.redirect(dest)
  }

  try {
    const result = await settleReference(reference)
    dest.searchParams.set(
      'payment',
      result === 'granted' || result === 'already' ? 'success' : 'failed',
    )
  } catch {
    dest.searchParams.set('payment', 'error')
  }

  return NextResponse.redirect(dest)
}
