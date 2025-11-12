import Image from 'next/image'
import Link from 'next/link'
import WaitlistForm from '@/components/WaitlistForm'

export default function Home() {

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-linear-to-br from-lightPurple via-white to-grey6 px-4">
       
        {/* <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center py-20"> */}
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-12 items-center py-20 px-4 sm:px-6 lg:px-8">
          {/* Left Side - Text + CTAs */}
          <div className="space-y-6 flex-2">
            <h1 className="font-satoshi font-black text-4xl md:text-5xl lg:text-6xl leading-tight">
              Your Professional Identity, Instantly Shareable
            </h1>
            <p className="font-spaceGrotesk text-lg md:text-xl text-grey2 leading-relaxed">
              Segwae makes networking effortless. Create a smart digital profile, link it to your NFC card or QR code, and share your details in one tap — no apps, no awkward moments.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                href="/signup"
                className="bg-mainPurple text-white px-10 py-4 rounded-full font-spaceGrotesk font-bold text-lg cursor-pointer hover:bg-opacity-90 transition-all shadow-lg hover:shadow-2xl hover:scale-105 transform text-center"
              >
                Create Your Free Profile
              </Link>
              <Link
                href="/store"
                className="bg-white border-2 border-mainPurple text-mainPurple px-8 py-4 rounded-full font-spaceGrotesk font-semibold text-lg cursor-pointer hover:bg-lightPurple transition-all text-center"
              >
                Order NFC Card
              </Link>
            </div>
          </div>

          {/* Right Side - Phone Mockup */}
          <div className="relative flex items-center justify-center flex-1">
            <div className="relative w-full max-w-md aspect-square">
              <Image
                src="/web_profile_mobile_mockup.png"
                alt="Segwae Profile on Mobile"
                fill
                className="object-contain drop-shadow-2xl"
                priority
              />
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg
            className="w-6 h-6 text-mainPurple"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#FAF5FF' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-satoshi font-black text-4xl md:text-5xl mb-4">
              How It Works
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-mainPurple text-white rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
                🧑‍💼
              </div>
              <h3 className="font-spaceGrotesk font-bold text-2xl mb-3">1. Create your profile</h3>
              <p className="font-openSans text-grey2">
                Add your details and get your personalized QR instantly.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-blue text-white rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
                📱
              </div>
              <h3 className="font-spaceGrotesk font-bold text-2xl mb-3">2. Share effortlessly</h3>
              <p className="font-openSans text-grey2">
                Anyone can view your profile by scanning or tapping.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-successGreen text-white rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
                🔗
              </div>
              <h3 className="font-spaceGrotesk font-bold text-2xl mb-3">3. Connect smarter</h3>
              <p className="font-openSans text-grey2">
                See who you met, update info anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Segwae Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-linear-to-br from-mainPurple/10 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Side */}
            <div>
              <h2 className="font-satoshi font-black text-4xl md:text-5xl mb-6">
                The easiest way to stay connected — online or offline.
              </h2>
            </div>

            {/* Right Side - Benefits */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-successGreen text-2xl">✅</span>
                <div>
                  <p className="font-spaceGrotesk font-semibold text-lg">Always up to date</p>
                  <p className="font-openSans text-grey2">Edit once, update everywhere.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-successGreen text-2xl">✅</span>
                <div>
                  <p className="font-spaceGrotesk font-semibold text-lg">Offline-friendly</p>
                  <p className="font-openSans text-grey2">Share without internet.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-successGreen text-2xl">✅</span>
                <div>
                  <p className="font-spaceGrotesk font-semibold text-lg">NFC-ready</p>
                  <p className="font-openSans text-grey2">Physical meets digital networking.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-successGreen text-2xl">✅</span>
                <div>
                  <p className="font-spaceGrotesk font-semibold text-lg">Privacy-first</p>
                  <p className="font-openSans text-grey2">You control what people see.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-successGreen text-2xl">✅</span>
                <div>
                  <p className="font-spaceGrotesk font-semibold text-lg">100% Free</p>
                  <p className="font-openSans text-grey2">No subscriptions, no limits.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Event Networking Section */}
      <section className="py-24 bg-white relative">
        <div className="absolute inset-0 bg-linear-to-r from-mainPurple/5 to-blue/5"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="font-satoshi font-black text-4xl md:text-5xl mb-6">
            Power Your Next Event with Segwae
          </h2>
          <p className="font-spaceGrotesk text-xl text-grey2 mb-8 max-w-2xl mx-auto">
            Let guests connect instantly. No typing, no fumbling — just scan, tap, and connect.
          </p>
          <a
            href="#waitlist"
            className="inline-block bg-mainPurple text-white px-10 py-4 rounded-full font-spaceGrotesk font-bold text-lg hover:bg-opacity-90 transition-all shadow-lg hover:shadow-2xl hover:scale-105 transform"
          >
            Join Event Waitlist
          </a>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 px-4 bg-linear-to-br from-mainPurple to-blue text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-satoshi font-black text-4xl md:text-5xl mb-6">
            Ready to stand out and stay connected?
          </h2>
          <p className="font-spaceGrotesk text-xl mb-8">
            Join professionals and founders using Segwae to make real connections.
          </p>
          <Link
            href="/signup"
            className="bg-white text-mainPurple px-10 py-4 rounded-full font-spaceGrotesk font-bold text-lg hover:bg-opacity-90 transition-all shadow-lg hover:shadow-2xl hover:scale-105 transform inline-block"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Waitlist Section */}
      <section id="waitlist" className="py-24 px-4 bg-grey6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-satoshi font-black text-4xl md:text-5xl mb-4">
              Join Our Event Network
            </h2>
            <p className="font-spaceGrotesk text-lg text-grey2">
              Get notified about networking events in your area. We&apos;ll only send relevant events based on your location.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-2xl">
            <WaitlistForm />
          </div>
        </div>
      </section>
    </div>
  )
}
