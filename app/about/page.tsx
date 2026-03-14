import Link from 'next/link'

export const metadata = {
  title: 'About — Segwae',
  description: 'Learn about Segwae, the professional networking platform that makes connections effortless.',
}

const VALUES = [
  {
    number: '01',
    title: 'Innovation',
    body: 'We push the boundaries of what professional networking looks like — building tools that keep up with how people actually work and connect today.',
  },
  {
    number: '02',
    title: 'Connection',
    body: 'Every interaction has the potential to become something meaningful. We build for depth, not just volume.',
  },
  {
    number: '03',
    title: 'Privacy',
    body: 'Your information is yours. You decide what to share, with whom, and when — no surprises.',
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="relative bg-[#080B14] overflow-hidden px-6 py-24 md:py-32">
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        {/* Glow */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] rounded-full bg-mainPurple/15 blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <p className="font-spaceGrotesk text-xs font-semibold text-mainPurple uppercase tracking-[0.2em] mb-6">
            About Segwae
          </p>
          <h1 className="font-satoshi font-black text-5xl md:text-7xl text-white leading-[1.0] mb-8">
            Turning small talk<br className="hidden md:block" /> into big deals.
          </h1>
          <p className="font-openSans text-white/50 text-lg md:text-xl leading-relaxed max-w-xl">
            A professional networking platform built for the way people actually connect — fast, digital, and effortless.
          </p>
        </div>
      </section>

      {/* ── Mission ─────────────────────────────────────────────── */}
      <section className="px-6 py-20 md:py-28">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-[1fr_2fr] gap-12 md:gap-20 items-start">
            <div>
              <p className="font-spaceGrotesk text-xs font-semibold text-mainPurple uppercase tracking-[0.2em]">
                Our Mission
              </p>
            </div>
            <div className="space-y-6">
              <p className="font-satoshi font-bold text-2xl md:text-3xl text-grey1 leading-snug">
                We believe every conversation has the potential to become a valuable connection — and we&apos;re here to make sure you never miss one.
              </p>
              <p className="font-openSans text-grey3 text-base leading-relaxed">
                Segwae combines digital profiles with NFC-powered smart cards, giving professionals, entrepreneurs, and businesses across Nigeria and beyond a single, always-up-to-date identity they can share in seconds.
              </p>
              <p className="font-openSans text-grey3 text-base leading-relaxed">
                No more outdated paper cards. No more manually typing in contact details. One tap, one scan — and you&apos;re connected.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ──────────────────────────────────────────────── */}
      <section className="px-6 py-20 md:py-28 bg-[#F4F3F1]">
        <div className="max-w-4xl mx-auto">
          <div className="mb-14">
            <p className="font-spaceGrotesk text-xs font-semibold text-mainPurple uppercase tracking-[0.2em] mb-3">
              What We Stand For
            </p>
            <h2 className="font-satoshi font-black text-4xl md:text-5xl text-grey1">
              Our values
            </h2>
          </div>

          <div className="space-y-0 divide-y divide-grey4/60">
            {VALUES.map(({ number, title, body }) => (
              <div key={number} className="grid md:grid-cols-[80px_1fr_2fr] gap-6 md:gap-12 py-10 items-start">
                <span className="font-spaceGrotesk text-xs font-semibold text-grey3 tabular-nums pt-1">
                  {number}
                </span>
                <h3 className="font-satoshi font-black text-2xl text-grey1">{title}</h3>
                <p className="font-openSans text-grey3 text-base leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
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

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col md:flex-row md:items-end md:justify-between gap-10">
          <div>
            <h2 className="font-satoshi font-black text-4xl md:text-5xl text-white leading-tight mb-4">
              Ready to build your<br className="hidden md:block" /> digital identity?
            </h2>
            <p className="font-openSans text-white/40 text-base max-w-md">
              Join professionals across Nigeria using Segwae to make their first impression count.
            </p>
          </div>
          <div className="shrink-0 flex flex-col sm:flex-row gap-3">
            <Link
              href="/signup"
              className="px-7 py-3.5 bg-mainPurple text-white rounded-xl font-spaceGrotesk font-semibold text-sm hover:bg-[#7D0FC9] transition-colors text-center"
            >
              Get Started
            </Link>
            <Link
              href="/contact"
              className="px-7 py-3.5 border border-white/20 text-white/70 rounded-xl font-spaceGrotesk font-semibold text-sm hover:border-white/40 hover:text-white transition-colors text-center"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
