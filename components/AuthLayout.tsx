import Image from 'next/image'
import Link from 'next/link'

interface AuthLayoutProps {
  children: React.ReactNode
  step?: number
  totalSteps?: number
  justify?: string
}

export default function AuthLayout({ children, step, totalSteps, justify }: AuthLayoutProps) {
  return (
    // <div className="min-h-screen flex">
    <div className="max-h-screen flex">

      {/* ── Left panel ─────────────────────────────────────────────────── */}
      <div className="hidden h-screen lg:flex lg:w-[42%] bg-[#111827] flex-col justify-between p-12 relative overflow-hidden">
        {/* Subtle line grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            opacity: 0.025,
          }}
        />

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
          <h2 className="font-dmSerif text-[2.75rem] text-white leading-[1.08]">
            Your career,<br />one platform.
          </h2>
          <p className="font-openSans text-white/40 text-base leading-relaxed max-w-xs">
            Find great roles, build a standout digital profile, and connect with the people who matter — all in one place.
          </p>
        </div>

        {/* Footer */}
        <p className="relative z-10 font-openSans text-white/20 text-xs">
          © 2025 Segwae Technologies
        </p>
      </div>

      {/* ── Right panel ────────────────────────────────────────────────── */}
      <div className={`flex-1 flex flex-col items-center overflow-y-auto ${justify} p-6 sm:p-10 bg-white dark:bg-surface min-h-screen`}>

        {/* Mobile logo */}
        <div className="lg:hidden mb-8 self-start">
          <Link href="/">
            <Image
              src="/wordmark_svg.svg"
              alt="Segwae"
              width={0}
              height={0}
              sizes="100vw"
              className="h-7 w-auto! dark:hidden"
            />
            <Image
              src="/wordmark_white.png"
              alt="Segwae"
              width={0}
              height={0}
              sizes="100vw"
              className="h-7 w-auto! hidden dark:block"
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
                    className={`h-0.5 flex-1 rounded-full transition-all duration-300 ${
                      i < step ? 'bg-mainPurple' : 'bg-grey4 dark:bg-line'
                    }`}
                  />
                ))}
              </div>
              <p className="font-satoshi text-xs text-grey3 dark:text-content-subtle">
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
