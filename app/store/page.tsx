import Link from 'next/link'
import { getProducts } from '@/lib/supabase'
import StoreClient from './StoreClient'

export const metadata = {
  title: 'Store — Segwae',
  description: 'Browse our collection of premium NFC business cards that link to your digital profile.',
}

export default async function StorePage() {
  const products = await getProducts()

  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="relative bg-[#111827] overflow-hidden px-6 py-24 md:py-32">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto">
          <p className="font-satoshi text-[11px] font-semibold text-mainPurple uppercase tracking-[0.22em] mb-6">
            Segwae Store
          </p>
          <h1 className="font-dmSerif text-5xl md:text-7xl text-white leading-[1.05] mb-6">
            NFC Business Cards
          </h1>
          <p className="font-openSans text-white/50 text-lg md:text-xl leading-relaxed max-w-xl">
            Premium cards that connect your physical presence to your digital profile. One tap to share everything.
          </p>
        </div>
      </section>

      {/* ── Products ────────────────────────────────────────────── */}
      <section className="px-6 py-20 md:py-28 bg-grey6">
        <div className="max-w-6xl mx-auto">
          {products.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-satoshi text-grey2 text-lg">
                No products available at the moment. Check back soon.
              </p>
            </div>
          ) : (
            <StoreClient products={products} />
          )}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────── */}
      <section className="relative bg-[#111827] overflow-hidden px-6 py-24">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto flex flex-col md:flex-row md:items-end md:justify-between gap-10">
          <div>
            <h2 className="font-satoshi font-bold text-4xl md:text-5xl text-white leading-tight mb-4">
              Ready to order?
            </h2>
            <p className="font-openSans text-white/40 text-base max-w-md">
              Download the Segwae app to create your profile and place your order for a custom NFC card.
            </p>
          </div>
          <div className="shrink-0 flex flex-col sm:flex-row gap-3">
            <a
              href="https://play.google.com/store/apps/details?id=com.segwae.app"
              target="_blank"
              rel="noopener noreferrer"
              className="px-7 py-3.5 bg-mainPurple text-white rounded-lg font-satoshi font-semibold text-sm hover:bg-[#4338CA] transition-colors text-center"
            >
              Download App
            </a>
            <Link
              href="/contact"
              className="px-7 py-3.5 border border-white/20 text-white/70 rounded-lg font-satoshi font-semibold text-sm hover:border-white/40 hover:text-white transition-colors text-center"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
