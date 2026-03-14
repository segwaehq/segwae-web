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
      <section className="relative bg-[#080B14] overflow-hidden px-6 py-24 md:py-32">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] rounded-full bg-mainPurple/15 blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto">
          <p className="font-spaceGrotesk text-xs font-semibold text-mainPurple uppercase tracking-[0.2em] mb-6">
            Segwae Store
          </p>
          <h1 className="font-satoshi font-black text-5xl md:text-7xl text-white leading-[1.0] mb-6">
            NFC Business Cards
          </h1>
          <p className="font-openSans text-white/50 text-lg md:text-xl leading-relaxed max-w-xl">
            Premium cards that connect your physical presence to your digital profile. One tap to share everything.
          </p>
        </div>
      </section>

      {/* ── Products ────────────────────────────────────────────── */}
      <section className="px-6 py-20 md:py-28 bg-[#F4F3F1]">
        <div className="max-w-6xl mx-auto">
          {products.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-spaceGrotesk text-grey2 text-lg">
                No products available at the moment. Check back soon.
              </p>
            </div>
          ) : (
            <StoreClient products={products} />
          )}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────── */}
      <section className="relative bg-[#080B14] overflow-hidden px-6 py-24">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] rounded-full bg-mainPurple/20 blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto flex flex-col md:flex-row md:items-end md:justify-between gap-10">
          <div>
            <h2 className="font-satoshi font-black text-4xl md:text-5xl text-white leading-tight mb-4">
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
              className="px-7 py-3.5 bg-mainPurple text-white rounded-xl font-spaceGrotesk font-semibold text-sm hover:bg-[#7D0FC9] transition-colors text-center"
            >
              Download App
            </a>
            <Link
              href="/contact"
              className="px-7 py-3.5 border border-white/20 text-white/70 rounded-xl font-spaceGrotesk font-semibold text-sm hover:border-white/40 hover:text-white transition-colors text-center"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
