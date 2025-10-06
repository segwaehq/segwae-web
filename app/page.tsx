// import Image from "next/image";

// export default function Home() {
//   return (
//     <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
//       <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
//         <Image
//           className="dark:invert"
//           src="/next.svg"
//           alt="Next.js logo"
//           width={180}
//           height={38}
//           priority
//         />
//         <ol className="font-mono list-inside list-decimal text-sm/6 text-center sm:text-left">
//           <li className="mb-2 tracking-[-.01em]">
//             Get started by editing{" "}
//             <code className="bg-black/[.05] dark:bg-white/[.06] font-mono font-semibold px-1 py-0.5 rounded">
//               app/page.tsx
//             </code>
//             .
//           </li>
//           <li className="tracking-[-.01em]">
//             Save and see your changes instantly.
//           </li>
//         </ol>

//         <div className="flex gap-4 items-center flex-col sm:flex-row">
//           <a
//             className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
//             href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             <Image
//               className="dark:invert"
//               src="/vercel.svg"
//               alt="Vercel logomark"
//               width={20}
//               height={20}
//             />
//             Deploy now
//           </a>
//           <a
//             className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
//             href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             Read our docs
//           </a>
//         </div>
//       </main>
//       <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
//         <a
//           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
//           href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="/file.svg"
//             alt="File icon"
//             width={16}
//             height={16}
//           />
//           Learn
//         </a>
//         <a
//           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
//           href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="/window.svg"
//             alt="Window icon"
//             width={16}
//             height={16}
//           />
//           Examples
//         </a>
//         <a
//           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
//           href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="/globe.svg"
//             alt="Globe icon"
//             width={16}
//             height={16}
//           />
//           Go to nextjs.org →
//         </a>
//       </footer>
//     </div>
//   );
// }















import WaitlistForm from '@/components/WaitlistForm'
import { FaQrcode, FaMobileAlt, FaChartLine, FaCreditCard } from 'react-icons/fa'

export default function Home() {
  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-lightPurple via-white to-grey6 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="font-satoshi font-black text-5xl md:text-7xl mb-3.5 pb-2.5 bg-gradient-to-r from-mainPurple to-blue bg-clip-text text-transparent">
            Small talk to big deals
          </h1>
          <p className="font-spaceGrotesk text-xl md:text-2xl text-grey2 mb-8 max-w-3xl mx-auto">
            Create your digital business card, share it with a tap, and never lose a connection again.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-mainPurple text-white px-8 py-4 rounded-full font-spaceGrotesk font-semibold text-lg hover:bg-opacity-90 transition-all shadow-lg hover:shadow-xl">
              Coming Soon
            </button>
            <a
              href="#waitlist"
              className="bg-white border-2 border-mainPurple text-mainPurple px-8 py-4 rounded-full font-spaceGrotesk font-semibold text-lg hover:bg-lightPurple transition-all"
            >
              Join Waitlist
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
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

      {/* Features Section */}
      <section id="features" className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-satoshi font-black text-4xl md:text-5xl mb-4">
              Everything you need to network smarter
            </h2>
            <p className="font-spaceGrotesk text-lg text-grey2 max-w-2xl mx-auto">
              Powerful features designed to help you make meaningful connections
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-grey6 rounded-2xl p-8 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-mainPurple rounded-full flex items-center justify-center mb-4">
                <FaQrcode className="text-white text-2xl" />
              </div>
              <h3 className="font-spaceGrotesk font-bold text-xl mb-2">QR Code Profile</h3>
              <p className="font-openSans text-grey2">
                Share your profile instantly with a personalized QR code
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-grey6 rounded-2xl p-8 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-blue rounded-full flex items-center justify-center mb-4">
                <FaMobileAlt className="text-white text-2xl" />
              </div>
              <h3 className="font-spaceGrotesk font-bold text-xl mb-2">Auto-Connect</h3>
              <p className="font-openSans text-grey2">
                Connect instantly when someone views your profile - no approval needed
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-grey6 rounded-2xl p-8 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-successGreen rounded-full flex items-center justify-center mb-4">
                <FaChartLine className="text-white text-2xl" />
              </div>
              <h3 className="font-spaceGrotesk font-bold text-xl mb-2">Analytics Dashboard</h3>
              <p className="font-openSans text-grey2">
                Track profile views, QR scans, and link clicks in real-time
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-grey6 rounded-2xl p-8 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-warningYellow rounded-full flex items-center justify-center mb-4">
                <FaCreditCard className="text-white text-2xl" />
              </div>
              <h3 className="font-spaceGrotesk font-bold text-xl mb-2">Physical NFC Cards</h3>
              <p className="font-openSans text-grey2">
                Order custom NFC business cards that link to your digital profile
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-4 bg-grey6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-satoshi font-black text-4xl md:text-5xl mb-4">
              How Segwae Works
            </h2>
            <p className="font-spaceGrotesk text-lg text-grey2 max-w-2xl mx-auto">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-mainPurple text-white rounded-full flex items-center justify-center mx-auto mb-6 font-satoshi font-black text-3xl">
                1
              </div>
              <h3 className="font-spaceGrotesk font-bold text-2xl mb-3">Create Your Profile</h3>
              <p className="font-openSans text-grey2">
                Add your name, title, bio, social links, and profile photo. Get your unique QR code instantly.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-blue text-white rounded-full flex items-center justify-center mx-auto mb-6 font-satoshi font-black text-3xl">
                2
              </div>
              <h3 className="font-spaceGrotesk font-bold text-2xl mb-3">Share & Connect</h3>
              <p className="font-openSans text-grey2">
                Share your QR code or profile link. When someone views it, they&apos;re automatically added to your network.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-successGreen text-white rounded-full flex items-center justify-center mx-auto mb-6 font-satoshi font-black text-3xl">
                3
              </div>
              <h3 className="font-spaceGrotesk font-bold text-2xl mb-3">Grow Your Network</h3>
              <p className="font-openSans text-grey2">
                Track connections, view analytics, and turn small talk into meaningful business relationships.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-satoshi font-black text-4xl md:text-5xl mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="font-spaceGrotesk text-lg text-grey2 max-w-2xl mx-auto">
              Choose the plan that works best for you
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="bg-grey6 rounded-3xl p-8 border-2 border-transparent">
              <h3 className="font-satoshi font-black text-2xl mb-2">Free</h3>
              <div className="mb-6">
                <span className="font-satoshi font-black text-4xl">₦0</span>
                <span className="font-openSans text-grey2">/forever</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-successGreen mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-openSans">Digital business card</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-successGreen mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-openSans">Auto-generated username</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-successGreen mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-openSans">Unlimited connections</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-successGreen mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-openSans">Basic analytics</span>
                </li>
              </ul>
              <button className="w-full bg-grey2 text-white py-3 rounded-full font-spaceGrotesk font-semibold hover:bg-opacity-90 transition-all">
                Coming Soon
              </button>
            </div>

            {/* Premium Plan */}
            <div className="bg-gradient-to-br from-mainPurple to-blue text-white rounded-3xl p-8 border-2 border-mainPurple relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-white text-mainPurple px-3 py-1 rounded-full text-xs font-spaceGrotesk font-bold">
                POPULAR
              </div>
              <h3 className="font-satoshi font-black text-2xl mb-2">Premium</h3>
              <div className="mb-6">
                <span className="font-satoshi font-black text-4xl">₦2,500</span>
                <span className="font-openSans text-white/80">/month</span>
              </div>
              <p className="font-openSans text-white/80 mb-6">or ₦25,000/year (save 17%)</p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-white mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-openSans">Everything in Free</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-white mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-openSans">Custom username</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-white mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-openSans">Priority support</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-white mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-openSans">Early access to new features</span>
                </li>
              </ul>
              <button className="w-full bg-white text-mainPurple py-3 rounded-full font-spaceGrotesk font-semibold hover:bg-opacity-90 transition-all">
                Coming Soon
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Waitlist Section */}
      <section id="waitlist" className="py-24 px-4 bg-gradient-to-br from-mainPurple to-blue">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12 text-white">
            <h2 className="font-satoshi font-black text-4xl md:text-5xl mb-4">
              Join Our Event Network
            </h2>
            <p className="font-spaceGrotesk text-lg">
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