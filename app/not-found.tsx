import Link from 'next/link'
import Image from 'next/image'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#080B14] flex flex-col overflow-hidden relative">
      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      {/* Purple glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-mainPurple/20 blur-[120px] pointer-events-none" />

      {/* Logo */}
      <header className="relative z-10 px-8 py-7">
        <Link href="/">
          <Image
            src="/wordmark_white.png"
            alt="Segwae"
            width={0}
            height={0}
            sizes="100vw"
            className="h-7 w-auto!"
          />
        </Link>
      </header>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
        <p className="font-spaceGrotesk text-xs font-semibold text-mainPurple uppercase tracking-[0.2em] mb-4">
          Error 404
        </p>
        <h1 className="font-satoshi font-black text-7xl md:text-9xl text-white leading-none mb-6">
          404
        </h1>
        <p className="font-openSans text-white/40 text-base md:text-lg max-w-sm leading-relaxed mb-10">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="px-7 py-3.5 bg-mainPurple text-white rounded-xl font-spaceGrotesk font-semibold text-sm hover:bg-[#7D0FC9] transition-colors"
          >
            Back to Home
          </Link>
          <Link
            href="/contact"
            className="px-7 py-3.5 border border-white/20 text-white/70 rounded-xl font-spaceGrotesk font-semibold text-sm hover:border-white/40 hover:text-white transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  )
}
