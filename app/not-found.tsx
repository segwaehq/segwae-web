import Link from 'next/link'
import Image from 'next/image'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Logo */}
      <header className="px-8 py-7 border-b border-grey4">
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
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <p className="font-satoshi text-[11px] font-semibold text-mainPurple uppercase tracking-[0.18em] mb-4">
          Error 404
        </p>
        <h1 className="font-dmSerif text-[7rem] md:text-[10rem] text-grey1 leading-none mb-4">
          404
        </h1>
        <p className="font-openSans text-grey3 text-base md:text-lg max-w-sm leading-relaxed mb-10">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="px-6 py-3 bg-mainPurple text-white rounded-lg font-satoshi font-semibold text-sm hover:bg-[#4338CA] transition-colors"
          >
            Back to Home
          </Link>
          <Link
            href="/contact"
            className="px-6 py-3 border border-grey4 text-grey2 rounded-lg font-satoshi font-semibold text-sm hover:border-grey3 hover:text-grey1 transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  )
}
