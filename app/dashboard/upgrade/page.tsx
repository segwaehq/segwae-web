'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  FaBolt,
  FaRocket,
  FaPlus,
  FaCheck,
  FaArrowRight,
  FaWandMagicSparkles,
  FaShieldHalved,
} from 'react-icons/fa6'

type PlanKey = 'sprint' | 'job_hunt' | 'topup'

type Plan = {
  key: PlanKey
  name: string
  price: string
  period: string
  perTailor: string
  tagline: string
  icon: typeof FaBolt
  features: string[]
  highlight?: boolean
  badge?: string
}

const PLANS: Plan[] = [
  {
    key: 'sprint',
    name: 'Sprint Pass',
    price: '₦2,500',
    period: 'for 7 days',
    perTailor: '≈ ₦313 per tailor',
    tagline: 'For “I have an interview this week.”',
    icon: FaBolt,
    features: [
      '8 AI generations — tailor a resume or prep for an interview',
      'Cover letters + PDF export in the Segwae template',
      'Unlimited match scores (always free)',
      'Active for 7 days',
    ],
  },
  {
    key: 'job_hunt',
    name: 'Job-Hunt Pass',
    price: '₦5,000',
    period: 'for 30 days',
    perTailor: '≈ ₦278 per tailor — best value',
    tagline: 'A full month of serious applying.',
    icon: FaRocket,
    features: [
      '18 AI generations — tailor a resume or prep for an interview',
      'Cover letters + PDF export in the Segwae template',
      'Unlimited match scores (always free)',
      'Active for 30 days',
    ],
    highlight: true,
    badge: 'Best value',
  },
  {
    key: 'topup',
    name: 'Top-up',
    price: '₦1,500',
    period: 'never expires',
    perTailor: '≈ ₦300 per tailor',
    tagline: 'Out of generations mid-hunt? Add 5 more.',
    icon: FaPlus,
    features: [
      '5 more AI generations',
      'Stacks on top of any active pass',
      'No expiry — use them whenever',
    ],
  },
]

type Entitlement = {
  remaining: number
  hasPaidPass: boolean
  canTailor: boolean
  passExpiresAt?: string | null
}

export default function UpgradePage() {
  const [entitlement, setEntitlement] = useState<Entitlement | null>(null)
  const [paymentMsg, setPaymentMsg] = useState<{ tone: 'ok' | 'err'; text: string } | null>(null)
  const [buying, setBuying] = useState<PlanKey | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const paid = params.get('payment')
    if (paid === 'success')
      setPaymentMsg({ tone: 'ok', text: 'Payment received — your pass is active.' })
    else if (paid === 'failed')
      setPaymentMsg({ tone: 'err', text: 'That payment did not go through.' })
    else if (paid === 'error')
      setPaymentMsg({
        tone: 'err',
        text: 'We could not confirm that payment. If you were charged, reload in a minute.',
      })

    // Safety-net for redirects that missed the callback verify.
    fetch('/api/paystack/reconcile', { method: 'POST' })
      .catch(() => {})
      .finally(refreshEntitlement)
  }, [])

  function refreshEntitlement() {
    fetch('/api/ai/entitlements')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setEntitlement(d?.status ?? null))
      .catch(() => {})
  }

  async function buyPass(plan: PlanKey) {
    setError(null)
    setBuying(plan)
    try {
      const res = await fetch('/api/paystack/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (!res.ok || !data?.authorizationUrl)
        throw new Error(data?.error || 'Could not start payment')
      window.location.href = data.authorizationUrl
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start payment')
      setBuying(null)
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-7 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#F1ECFD] dark:bg-[#221b36] px-3.5 py-1.5 mb-3">
          <FaWandMagicSparkles className="w-3.5 h-3.5 text-[#5A2DD4] dark:text-[#b9a4f7]" />
          <span className="font-satoshi text-[13px] font-bold text-[#5A2DD4] dark:text-[#b9a4f7]">
            Segwae AI · Job-hunt passes
          </span>
        </div>
        <h1 className="font-satoshi font-black text-[28px] leading-tight tracking-[-0.02em] text-[#15131C] dark:text-content">
          Land the interview, faster.
        </h1>
        <p className="font-openSans text-sm text-[#9098A3] dark:text-content-subtle mt-2 max-w-xl mx-auto">
          Browsing and applying to jobs is always free. A pass unlocks the AI tools — the Resume
          Tailor (resume + cover letter rewritten per role) and Interview Prep (likely questions with
          answers from your resume). No subscription; a pass just covers your hunt.
        </p>
      </header>

      {/* Current status */}
      {entitlement && (
        <div className="mb-6 rounded-[18px] border border-[#E8E8EF] dark:border-line bg-white dark:bg-surface-raised px-5 py-4 flex flex-wrap items-center justify-between gap-3">
          <p className="font-openSans text-sm text-[#4B4658] dark:text-content-muted">
            {entitlement.remaining > 0 ? (
              <>
                <span className="font-satoshi font-bold text-[#15131C] dark:text-content">
                  {entitlement.remaining} tailor{entitlement.remaining === 1 ? '' : 's'} left
                </span>{' '}
                {entitlement.hasPaidPass ? '· pass active' : '· on the free tier'}
              </>
            ) : (
              "You've used your free tailor — grab a pass below to keep going."
            )}
          </p>
          <Link
            href="/dashboard/ai-tools"
            className="inline-flex items-center gap-1.5 font-satoshi text-sm font-bold text-[#5A2DD4] dark:text-[#b9a4f7] hover:gap-2.5 transition-all"
          >
            Open Resume Tailor <FaArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      {paymentMsg && (
        <p
          className={`mb-6 rounded-[13px] px-4 py-3 font-openSans text-sm ${
            paymentMsg.tone === 'ok'
              ? 'bg-[#E7F6EF] text-[#16895E] dark:bg-[#12271e] dark:text-[#4ade9e]'
              : 'bg-[#FDECEC] text-[#C0392B] dark:bg-[#2a1512] dark:text-[#f2857b]'
          }`}
        >
          {paymentMsg.text}
        </p>
      )}

      {/* Plans */}
      <div className="grid gap-5 md:grid-cols-3 items-start">
        {PLANS.map((plan) => {
          const Icon = plan.icon
          const isBuying = buying === plan.key
          return (
            <div
              key={plan.key}
              className={`relative rounded-[20px] bg-white dark:bg-surface-raised p-6 flex flex-col ${
                plan.highlight
                  ? 'border-[1.5px] border-[#5A2DD4] shadow-[0_20px_50px_-24px_rgba(74,55,216,0.5)] md:-mt-2'
                  : 'border border-[#E8E8EF] dark:border-line'
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-gradient px-3 py-1 font-satoshi text-[11px] font-bold uppercase tracking-wide text-white shadow-[0_8px_20px_-8px_rgba(74,55,216,0.6)]">
                  {plan.badge}
                </span>
              )}

              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                  plan.highlight ? 'bg-brand-gradient' : 'bg-[#F1ECFD] dark:bg-[#221b36]'
                }`}
              >
                <Icon className={`w-5 h-5 ${plan.highlight ? 'text-white' : 'text-[#5A2DD4] dark:text-[#b9a4f7]'}`} />
              </div>

              <h2 className="mt-4 font-satoshi font-black text-lg text-[#15131C] dark:text-content">{plan.name}</h2>
              <p className="font-openSans text-[13px] text-[#9098A3] dark:text-content-subtle mt-0.5 min-h-[38px]">
                {plan.tagline}
              </p>

              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="font-satoshi font-black text-[30px] tracking-[-0.02em] text-[#15131C] dark:text-content">
                  {plan.price}
                </span>
                <span className="font-openSans text-[13px] text-[#9098A3] dark:text-content-subtle">{plan.period}</span>
              </div>
              <p className="font-openSans text-xs text-[#A8A2B4] dark:text-content-subtle mt-0.5">{plan.perTailor}</p>

              <ul className="mt-5 space-y-2.5 flex-1">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#EAF6F0] dark:bg-[#12271e]">
                      <FaCheck className="w-2.5 h-2.5 text-[#16895E] dark:text-[#4ade9e]" />
                    </span>
                    <span className="font-openSans text-sm text-[#4B4658] dark:text-content-muted">{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => buyPass(plan.key)}
                disabled={buying !== null}
                className={`mt-6 inline-flex items-center justify-center gap-2 rounded-[13px] px-5 py-3 font-satoshi text-sm font-bold transition-transform disabled:opacity-50 ${
                  plan.highlight
                    ? 'bg-brand-gradient text-white shadow-[0_10px_24px_-6px_rgba(74,55,216,0.45)] hover:-translate-y-px disabled:hover:translate-y-0'
                    : 'border border-[#E2E1EA] dark:border-line text-[#15131C] dark:text-content hover:bg-[#FAFAFB] dark:hover:bg-white/[0.04]'
                }`}
              >
                {isBuying ? 'Starting…' : `Get ${plan.name}`}
                {!isBuying && <FaArrowRight className="w-3 h-3" />}
              </button>
            </div>
          )
        })}
      </div>

      {error && (
        <p className="mt-5 rounded-[13px] bg-[#FDECEC] dark:bg-[#2a1512] px-4 py-3 font-openSans text-sm text-[#C0392B] dark:text-[#f2857b]">
          {error}
        </p>
      )}

      {/* Trust footer */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-x-6 gap-y-2 text-center">
        <span className="inline-flex items-center gap-2 font-openSans text-[13px] text-[#9098A3] dark:text-content-subtle">
          <FaShieldHalved className="w-3.5 h-3.5 text-[#5A2DD4] dark:text-[#b9a4f7]" />
          Secured by Paystack
        </span>
        <span className="font-openSans text-[13px] text-[#9098A3] dark:text-content-subtle">
          Prices in Naira · No auto-renewal · Passes cover the AI tools, not job access
        </span>
      </div>
    </div>
  )
}
