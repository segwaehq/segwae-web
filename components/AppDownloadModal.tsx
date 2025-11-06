'use client'

import { useState, useEffect } from 'react'
import { FaTimes } from 'react-icons/fa'

interface AppDownloadModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AppDownloadModal({ isOpen, onClose }: AppDownloadModalProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleClose = () => {
    setIsAnimating(false)
    setTimeout(() => {
      onClose()
    }, 300) // Match animation duration
  }

  if (!isOpen) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
        isAnimating ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleClose}
    >
      <div
        className={`relative bg-white rounded-3xl shadow-2xl max-w-md max-h-11/12 overflow-auto my-10 w-full p-8 transition-all duration-300 ${
          isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-grey3 hover:text-black transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <FaTimes className="text-2xl" />
        </button>

        {/* Content */}
        <div className="text-center">
          <h2 className="font-satoshi font-bold text-3xl mb-4 text-black">
            Continue on your phone
          </h2>
          <p className="font-openSans text-grey2 mb-8">
            {/* Scan the QR code to get the Segwae app and create your free profile. */}
            Get the Segwae app and create your free profile.
          </p>

          {/* QR Code Placeholder */}
          {/* <div className="bg-grey6 rounded-2xl p-8 mb-8 flex items-center justify-center">
            <div className="w-48 h-48 bg-white rounded-xl flex items-center justify-center border-4 border-mainPurple">
              <p className="font-spaceGrotesk text-grey3 text-center px-4">
                QR Code<br />Coming Soon
              </p>
            </div>
          </div> */}

          {/* App Store Badges */}
          <div className="space-y-4">
            <a
              href="https://play.google.com/store/apps/details?id=com.segwae.app"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <div className="bg-black hover:bg-grey1 transition-colors rounded-xl px-6 py-3 flex items-center justify-center gap-3">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="white">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                </svg>
                <div className="text-left">
                  <p className="text-white text-xs font-openSans">GET IT ON</p>
                  <p className="text-white text-lg font-satoshi font-bold">Google Play</p>
                </div>
              </div>
            </a>

            <div className="bg-grey4 rounded-xl px-6 py-3 flex items-center justify-center gap-3 cursor-not-allowed opacity-60">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="white">
                <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z" />
              </svg>
              <div className="text-left">
                <p className="text-white text-xs font-openSans">Download on the</p>
                <p className="text-white text-lg font-satoshi font-bold">App Store</p>
              </div>
            </div>
            <p className="text-xs text-grey3 font-openSans">App Store coming soon</p>
          </div>
        </div>
      </div>
    </div>
  )
}
