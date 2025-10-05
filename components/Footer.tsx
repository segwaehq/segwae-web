import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-secondaryBlack text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            {/* <h3 className="font-satoshi font-black text-2xl mb-4">Segwae</h3> */}
            <Link href="/" className="flex items-center space-x-2">
              <Image
                // src="/wordmark_svg.svg"
                src="/wordmark_white.png"
                alt="Segwae Logo"
                width={0}
                height={0}
                sizes="100vw"
                className="h-8 !w-auto"
              />
            </Link>
            <p className="font-openSans text-grey3 text-sm">
              Professional networking made simple. Connect, share, and grow your
              network.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-spaceGrotesk font-semibold mb-4">Product</h4>
            <ul className="space-y-2 font-openSans text-grey3 text-sm">
              <li>
                <Link
                  href="/#features"
                  className="hover:text-mainPurple transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="/#pricing"
                  className="hover:text-mainPurple transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/#how-it-works"
                  className="hover:text-mainPurple transition-colors"
                >
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-spaceGrotesk font-semibold mb-4">Company</h4>
            <ul className="space-y-2 font-openSans text-grey3 text-sm">
              <li>
                <Link
                  href="/contact"
                  className="hover:text-mainPurple transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy-policy"
                  className="hover:text-mainPurple transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-mainPurple transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-spaceGrotesk font-semibold mb-4">Follow Us</h4>
            <ul className="space-y-2 font-openSans text-grey3 text-sm">
              <li>
                <a
                  href="https://x.com/segwaehq"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-mainPurple transition-colors"
                >
                  Twitter/X
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/company/segwaehq"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-mainPurple transition-colors"
                >
                  LinkedIn
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/segwaehq"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-mainPurple transition-colors"
                >
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-grey1 mt-8 pt-8 text-center">
          <p className="font-openSans text-grey3 text-sm">
            © {new Date().getFullYear()} Segwae. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
