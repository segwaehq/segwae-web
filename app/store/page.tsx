import Link from 'next/link'
import { getProducts } from '@/lib/supabase'
import StoreClient from './StoreClient'

export const metadata = {
  title: 'Store — Segwae',
  description: 'Premium NFC cards that share your Segwae profile with a single tap. No app needed on their end.',
}

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.segwae.app'

// NFC "tap" wave — matches the mockup's card glyph.
function NfcWave({ className, stroke = 'currentColor' }: { className?: string; stroke?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" className={className}>
      <path d="M5 9a9 9 0 0114 0M8 12a5 5 0 018 0M11 15a1.5 1.5 0 012 0" />
    </svg>
  )
}

export default async function StorePage() {
  const products = await getProducts()

  return (
    <div className="min-h-screen bg-[#F7F7F9]">

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#0F1115] px-6 pt-28 pb-20 md:pt-32 md:pb-28">
        {/* dot grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)',
            backgroundSize: '26px 26px',
          }}
        />
        {/* brand glow */}
        <div className="absolute -top-28 -right-20 w-[460px] h-[460px] rounded-full bg-brand-gradient opacity-20 blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto grid lg:grid-cols-[1.05fr_0.95fr] gap-14 items-center">

          {/* Left — copy */}
          <div>
            <span className="inline-flex items-center gap-2 px-[13px] py-1.5 rounded-full bg-white/6 border border-white/12 mb-6">
              <span className="w-[7px] h-[7px] rounded-full bg-brand-gradient" />
              <span className="font-satoshi text-xs font-bold tracking-[0.14em] uppercase text-[#C9BCF2]">
                Segwae Store
              </span>
            </span>

            <h1 className="font-satoshi font-black tracking-[-0.035em] leading-[1.04] text-white text-[clamp(2.6rem,5vw,4.2rem)]">
              Your profile,<br />in your pocket.
            </h1>

            <p className="text-white/55 text-lg leading-relaxed font-medium max-w-[440px] mt-5">
              Premium NFC cards that share your Segwae profile with a single tap. One card connects your physical presence to everything you do online.
            </p>

            <div className="flex flex-wrap gap-3 mt-8">
              <a
                href={PLAY_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-brand-gradient text-white px-6 py-3.5 rounded-xl font-satoshi font-bold text-sm shadow-[0_10px_24px_-6px_rgba(74,55,216,0.45)] hover:-translate-y-0.5 transition-transform"
              >
                Get the app
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center px-6 py-3.5 rounded-xl font-satoshi font-bold text-sm border border-white/15 text-white/80 hover:border-white/35 hover:text-white transition-colors"
              >
                Contact sales
              </Link>
            </div>

            <div className="flex items-center gap-2.5 mt-9 text-[13px] font-medium text-white/45">
              <NfcWave className="w-4 h-4 shrink-0" stroke="#C9BCF2" />
              Tap any phone to share your profile — no app needed on their end.
            </div>
          </div>

          {/* Right — card visual */}
          <div className="hidden lg:flex justify-center">
            <div className="relative w-[360px] h-[226px] rounded-[20px] p-6 flex flex-col justify-between bg-brand-gradient shadow-[0_34px_70px_-22px_rgba(0,0,0,0.6)] -rotate-6 hover:rotate-0 transition-transform duration-500">
              {/* sheen */}
              <div
                className="absolute inset-0 rounded-[20px] pointer-events-none"
                style={{ background: 'linear-gradient(125deg,rgba(255,255,255,0.22) 0%,transparent 38%,transparent 62%,rgba(255,255,255,0.10) 100%)' }}
              />
              <div className="relative z-10 flex items-center justify-between">
                <span className="font-satoshi font-black text-[19px] tracking-[-0.045em] text-white">segwae</span>
                <NfcWave className="w-[22px] h-[22px] opacity-80" stroke="#ffffff" />
              </div>
              <div className="relative z-10">
                <div className="text-[20px] font-satoshi font-extrabold tracking-[-0.01em] text-white">Maya Chen</div>
                <div className="text-[13px] font-medium text-white/70 mt-0.5">Product Designer</div>
                <div className="text-[11.5px] font-semibold text-white/55 mt-2.5 tracking-[0.02em]">segwae.com/maya</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Products ────────────────────────────────────────────── */}
      <section id="collection" className="px-6 py-20 md:py-24 scroll-mt-24">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-xl mb-12">
            <p className="font-satoshi text-[12px] font-bold tracking-[0.14em] uppercase text-[#5A2DD4] mb-3">
              The collection
            </p>
            <h2 className="font-satoshi font-black text-[#15131C] tracking-[-0.03em] leading-[1.1] text-[clamp(1.9rem,3.5vw,2.4rem)]">
              Pick your card.
            </h2>
            <p className="text-[#6B6478] text-base leading-relaxed font-medium mt-3">
              Every card links straight to your Segwae profile. Choose a style and order it right here — we&apos;ll reach out to confirm the details and delivery.
            </p>
          </div>

          {products.length === 0 ? (
            <div className="bg-white border border-[#E8E8EF] rounded-[20px] text-center py-20 px-6">
              <p className="font-satoshi font-bold text-[#15131C] text-lg mb-1">
                Nothing in the store just yet
              </p>
              <p className="text-[#9098A3] text-sm font-medium">
                New cards are on the way — check back soon.
              </p>
            </div>
          ) : (
            <StoreClient products={products} />
          )}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────── */}
      <section className="px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="relative overflow-hidden rounded-[28px] bg-brand-gradient px-8 py-14 md:px-14">
            <div
              className="absolute inset-0 pointer-events-none opacity-50"
              style={{
                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.10) 1px, transparent 1px)',
                backgroundSize: '26px 26px',
              }}
            />
            <div className="relative z-10 flex flex-col md:flex-row md:items-end md:justify-between gap-10">
              <div>
                <h2 className="font-satoshi font-black text-white tracking-[-0.03em] leading-[1.1] text-[clamp(1.9rem,3.5vw,2.5rem)]">
                  Ready to order?
                </h2>
                <p className="text-white/75 text-base font-medium max-w-md mt-3">
                  Pick a card above and place your order in under a minute — no app needed to buy. Need a hand or ordering in bulk? Talk to us.
                </p>
              </div>
              <div className="shrink-0 flex flex-col sm:flex-row gap-3">
                <a
                  href="#collection"
                  className="inline-flex items-center justify-center px-7 py-3.5 bg-white text-[#15131C] rounded-xl font-satoshi font-bold text-sm hover:-translate-y-0.5 transition-transform"
                >
                  Browse the cards
                </a>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-7 py-3.5 border border-white/30 text-white rounded-xl font-satoshi font-bold text-sm hover:bg-white/10 transition-colors"
                >
                  Contact sales
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
