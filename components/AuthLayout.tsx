import Image from 'next/image'
import Link from 'next/link'

interface AuthLayoutProps {
  children: React.ReactNode
  step?: number
  totalSteps?: number
}

export default function AuthLayout({ children, step, totalSteps }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">

      {/* ── Left panel ─────────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[42%] bg-[#080B14] flex-col justify-between p-12 relative overflow-hidden">
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />
        {/* Purple glow — bottom-left */}
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-mainPurple/20 blur-3xl rounded-full pointer-events-none" />

        {/* Logo */}
        <Link href="/" className="relative z-10">
          <Image
            src="/wordmark_white.png"
            alt="Segwae"
            width={0}
            height={0}
            sizes="100vw"
            className="h-7 w-auto!"
          />
        </Link>

        {/* Headline */}
        <div className="relative z-10 space-y-4">
          <h2 className="font-satoshi font-black text-[2.6rem] text-white leading-[1.08]">
            Your identity.<br />One tap away.
          </h2>
          <p className="font-openSans text-[#8E8E9A] text-base leading-relaxed max-w-xs">
            Create your digital profile and share your contact details instantly — no app download required.
          </p>
        </div>

        {/* Footer */}
        <p className="relative z-10 font-openSans text-[#3A3A4A] text-xs">
          © 2025 Segwae Technologies
        </p>
      </div>

      {/* ── Right panel ────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 bg-white min-h-screen">

        {/* Mobile logo */}
        <div className="lg:hidden mb-8 self-start">
          <Link href="/">
            <Image
              src="/wordmark_svg.svg"
              alt="Segwae"
              width={0}
              height={0}
              sizes="100vw"
              className="h-7 w-auto!"
            />
          </Link>
        </div>

        <div className="w-full max-w-[420px]">
          {/* Step progress */}
          {step && totalSteps && (
            <div className="mb-8">
              <div className="flex gap-1.5 mb-2">
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      i < step ? 'bg-mainPurple' : 'bg-grey4'
                    }`}
                  />
                ))}
              </div>
              <p className="font-spaceGrotesk text-xs text-grey3">
                Step {step} of {totalSteps}
              </p>
            </div>
          )}

          {children}
        </div>
      </div>
    </div>
  )
}
