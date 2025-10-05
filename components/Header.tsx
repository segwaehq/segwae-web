import Link from 'next/link'
import Image from 'next/image'

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-grey4">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image
            //   src="/wordmark.png"
              src="/wordmark_svg.svg"
              alt="Segwae Logo"
            //   width={40}
            //   height={40}
            // fill
            //   className="w-10 h-10"
            //   className=" object-contain"
            width={0}
  height={0}
  sizes="100vw"
  className="h-8 !w-auto"
            />
            {/* <span className="font-satoshi font-black text-2xl text-black">
              Segwae
            </span> */}
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/#features"
              className="font-spaceGrotesk text-grey2 hover:text-mainPurple transition-colors"
            >
              Features
            </Link>
            <Link
              href="/#how-it-works"
              className="font-spaceGrotesk text-grey2 hover:text-mainPurple transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="/#pricing"
              className="font-spaceGrotesk text-grey2 hover:text-mainPurple transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/contact"
              className="font-spaceGrotesk text-grey2 hover:text-mainPurple transition-colors"
            >
              Contact
            </Link>
          </div>

          {/* CTA Button */}
          <div className="flex items-center space-x-4">
            <button className="bg-mainPurple text-white px-6 py-2 rounded-full font-spaceGrotesk font-semibold hover:bg-opacity-90 transition-all">
              Coming Soon
            </button>
          </div>
        </div>
      </nav>
    </header>
  )
}