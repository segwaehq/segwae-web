// import Link from "next/link";
// import Image from "next/image";

// export default function Footer() {
//   return (
//     <footer className="bg-black text-white py-12 px-4">
//       <div className="max-w-7xl mx-auto">
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-8">
//           {/* Left: Logo + Tagline */}
//           <div className="flex flex-col gap-3">
//             <Link href="/" className="flex items-center gap-2">
//               <Image
//                 src="/wordmark_white.png"
//                 alt="Segwae"
//                 width={120}
//                 height={30}
//                 className="h-8 w-auto"
//               />
//             </Link>
//             <p className="font-spaceGrotesk text-grey5 text-lg">
//               Small Talk to Big Deals.
//             </p>
//           </div>

//           {/* Right: Links */}
//           <nav className="flex flex-wrap gap-6 font-openSans text-grey5">
//             <Link
//               href="/about"
//               className="hover:text-white transition-colors"
//             >
//               About
//             </Link>
//             <Link
//               href="/contact"
//               className="hover:text-white transition-colors"
//             >
//               Contact
//             </Link>
//             <Link
//               href="/privacy-policy"
//               className="hover:text-white transition-colors"
//             >
//               Privacy Policy
//             </Link>
//             <Link
//               href="/terms"
//               className="hover:text-white transition-colors"
//             >
//               Terms
//             </Link>
//           </nav>
//         </div>

//         {/* Subfooter */}
//         <div className="border-t border-grey2 pt-6 text-center">
//           <p className="font-openSans text-grey4 text-sm">
//             © 2025 Segwae Technologies. All rights reserved.
//           </p>
//         </div>
//       </div>
//     </footer>
//   );
// }













'use client'

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import AppDownloadModal from "@/components/AppDownloadModal"

export default function Footer() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <footer className="bg-secondaryBlack text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            {/* <h3 className="font-satoshi font-black text-2xl mb-4">Segwae</h3> */}
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <Image
                // src="/wordmark_svg.svg"
                src="/wordmark_white.png"
                alt="Segwae Logo"
                width={0}
                height={0}
                sizes="100vw"
                className="h-8 w-auto!"
              />
            </Link>
            <p className="font-openSans text-grey3 text-sm">
              Small Talk to Big Deals.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-spaceGrotesk font-semibold mb-4">Product</h4>
            <ul className="space-y-2 font-openSans text-grey3 text-sm">
              
              <li>
                <Link
                  href="/#how-it-works"
                  className="hover:text-mainPurple transition-colors"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-mainPurple transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/store"
                  className="hover:text-mainPurple transition-colors"
                >
                  Store
                </Link>
              </li>
              <li>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="hover:text-mainPurple transition-colors text-left"
                >
                  Get the App
                </button>
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
            © 2025 Segwae. All rights reserved.
          </p>
        </div>
      </div>
    </footer>

    <AppDownloadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}