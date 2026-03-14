'use client'

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import AppDownloadModal from "@/components/AppDownloadModal"

const product = [
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/about", label: "About" },
  { href: "/store", label: "Store" },
]

const company = [
  { href: "/contact", label: "Contact Us" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
]

const social = [
  { href: "https://x.com/segwaehq", label: "Twitter / X" },
  { href: "https://www.linkedin.com/company/segwaehq", label: "LinkedIn" },
  { href: "https://www.instagram.com/segwaehq", label: "Instagram" },
]

export default function Footer() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <footer className="bg-[#080B14] text-white border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-14">

            {/* Brand */}
            <div className="col-span-1 space-y-4">
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
              <p className="font-openSans text-[#55556A] text-sm leading-relaxed">
                Small Talk to Big Deals.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-spaceGrotesk text-xs font-semibold uppercase tracking-[0.12em] text-[#55556A] mb-5">
                Product
              </h4>
              <ul className="space-y-3">
                {product.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="font-openSans text-sm text-[#8E8E9A] hover:text-white transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="font-openSans text-sm text-[#8E8E9A] hover:text-white transition-colors text-left"
                  >
                    Get the App
                  </button>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-spaceGrotesk text-xs font-semibold uppercase tracking-[0.12em] text-[#55556A] mb-5">
                Company
              </h4>
              <ul className="space-y-3">
                {company.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="font-openSans text-sm text-[#8E8E9A] hover:text-white transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social */}
            <div>
              <h4 className="font-spaceGrotesk text-xs font-semibold uppercase tracking-[0.12em] text-[#55556A] mb-5">
                Follow Us
              </h4>
              <ul className="space-y-3">
                {social.map((l) => (
                  <li key={l.href}>
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-openSans text-sm text-[#8E8E9A] hover:text-white transition-colors"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-white/[0.06] pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="font-openSans text-[#55556A] text-xs">
              © 2025 Segwae Technologies. All rights reserved.
            </p>
            <p className="font-openSans text-[#55556A] text-xs">
              Made in Nigeria 🇳🇬
            </p>
          </div>
        </div>
      </footer>

      <AppDownloadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
