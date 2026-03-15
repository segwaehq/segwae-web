'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import {
  FaArrowsRotate,
  FaWifi,
  FaCreditCard,
  FaShieldHalved,
  FaCircleCheck,
  FaBolt,
} from 'react-icons/fa6'
import WaitlistForm from '@/components/WaitlistForm'

// ─── Animation primitives ──────────────────────────────────────────────────
const ease = [0.22, 1, 0.36, 1] as const

const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.11 } },
}

function InView({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-64px' })
  return (
    <motion.div
      ref={ref}
      variants={stagger}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── Data ──────────────────────────────────────────────────────────────────
const STEPS = [
  {
    num: '01',
    title: 'Create your profile',
    desc: 'Add your details — name, title, bio, and links — and get a personalised QR code instantly.',
  },
  {
    num: '02',
    title: 'Share effortlessly',
    desc: 'Anyone can view your profile by scanning your QR code or tapping your NFC card. No app needed.',
  },
  {
    num: '03',
    title: 'Connect smarter',
    desc: "Track who you've met, update your info anytime, and never hand out an outdated card again.",
  },
]

const FEATURES = [
  {
    icon: FaArrowsRotate,
    title: 'Always up to date',
    desc: 'Edit once, update everywhere. No reprinting required.',
  },
  {
    icon: FaWifi,
    title: 'Offline-friendly',
    desc: 'Share without internet via QR code or a single NFC tap.',
  },
  {
    icon: FaCreditCard,
    title: 'NFC-ready',
    desc: 'Physical meets digital. One tap is all it takes to connect.',
  },
  {
    icon: FaShieldHalved,
    title: 'Privacy controls',
    desc: 'You decide exactly what people see — and what stays private.',
  },
  {
    icon: FaCircleCheck,
    title: '100% free',
    desc: 'Full-featured with no hidden costs or paywalled essentials.',
  },
  {
    icon: FaBolt,
    title: 'Instant profile',
    desc: 'Live in minutes. No app download required on the other end.',
  },
]

// ─── Page ──────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <div className="overflow-x-hidden">

      {/* ══ HERO ═══════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen bg-[#080B14] flex items-center">
        {/* Radial purple glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 65% 55% at 78% 58%, rgba(106,13,173,0.25) 0%, transparent 68%)',
          }}
        />
        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.035]"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-32 pb-24 lg:pt-40 lg:pb-32">
          <div className="flex flex-col lg:flex-row gap-16 items-center">

            {/* Left col */}
            <motion.div
              className="flex-1 space-y-8"
              variants={stagger}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={fadeUp}>
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-mainPurple/40 bg-mainPurple/10 text-mainPurple font-spaceGrotesk text-xs font-semibold tracking-wide uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-mainPurple animate-pulse" />
                  Professional Networking
                </span>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="font-satoshi font-black text-[2.75rem] md:text-[3.5rem] lg:text-[4.25rem] xl:text-[4.75rem] leading-[1.04] text-white"
              >
                Your Professional<br />
                <span className="text-mainPurple">Identity</span>,<br />
                Instantly Shareable.
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="font-openSans text-base md:text-lg text-[#8E8E9A] leading-relaxed max-w-md"
              >
                Create a smart digital profile, link it to your NFC card or
                QR code, and share your contact in one tap — no apps, no
                awkward moments.
              </motion.p>

              <motion.div
                variants={fadeUp}
                className="flex flex-col sm:flex-row gap-3 pt-1"
              >
                <Link
                  href="/signup"
                  className="bg-mainPurple text-white px-8 py-3.5 rounded-full font-spaceGrotesk font-semibold text-base hover:bg-[#7D0FC9] transition-all shadow-[0_0_32px_rgba(106,13,173,0.45)] hover:shadow-[0_0_44px_rgba(106,13,173,0.65)] text-center"
                >
                  Create Your Free Profile
                </Link>
                <Link
                  href="/store"
                  className="border border-white/20 text-white px-8 py-3.5 rounded-full font-spaceGrotesk font-semibold text-base hover:border-white/40 hover:bg-white/6 transition-all text-center"
                >
                  Order NFC Card
                </Link>
              </motion.div>

              <motion.p
                variants={fadeUp}
                className="font-openSans text-[13px] text-[#55556A]"
              >
                Free to create. No credit card required.
              </motion.p>
            </motion.div>

            {/* Right col — mockup */}
            <motion.div
              className="flex-1 relative flex items-center justify-center"
              initial={{ opacity: 0, y: 48, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.95, delay: 0.28, ease }}
            >
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-72 h-20 bg-mainPurple/35 blur-3xl rounded-full pointer-events-none" />
              <div className="relative w-full max-w-[360px] aspect-square">
                <Image
                  src="/web_profile_mobile_mockup.png"
                  alt="Segwae Profile on Mobile"
                  fill
                  className="object-contain drop-shadow-2xl"
                  priority
                />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll cue */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
        >
          <motion.div
            animate={{ y: [0, 7, 0] }}
            transition={{ repeat: Infinity, duration: 1.9, ease: 'easeInOut' }}
            className="w-5 h-8 border border-white/20 rounded-full flex items-start justify-center pt-1.5"
          >
            <div className="w-1 h-1.5 bg-white/40 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* ══ HOW IT WORKS ═══════════════════════════════════════════════════ */}
      <section id="how-it-works" className="py-28 px-4 sm:px-6 lg:px-8 bg-grey6">
        <div className="max-w-7xl mx-auto">

          <InView className="text-center mb-20">
            <motion.p
              variants={fadeUp}
              className="font-spaceGrotesk text-xs font-semibold text-mainPurple uppercase tracking-[0.15em] mb-4"
            >
              How it works
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="font-satoshi font-black text-4xl md:text-5xl text-grey1 leading-tight"
            >
              Three steps to your<br className="hidden md:block" /> digital identity.
            </motion.h2>
          </InView>

          <InView className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-grey4">
            {STEPS.map((step) => (
              <motion.div
                key={step.num}
                variants={fadeUp}
                className="px-8 py-10 md:py-4 md:first:pl-0 md:last:pr-0"
              >
                <span className="font-satoshi font-black text-[4.5rem] leading-none text-mainPurple block mb-6">
                  {step.num}
                </span>
                <div className="h-px bg-grey4 mb-5" />
                <h3 className="font-spaceGrotesk font-bold text-xl text-grey1 mb-3">
                  {step.title}
                </h3>
                <p className="font-openSans text-sm text-grey2 leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </InView>
        </div>
      </section>

      {/* ══ FEATURES ═══════════════════════════════════════════════════════ */}
      <section className="py-28 px-4 sm:px-6 lg:px-8 bg-[#080B14]">
        <div className="max-w-7xl mx-auto">

          <InView className="mb-16">
            <motion.p
              variants={fadeUp}
              className="font-spaceGrotesk text-xs font-semibold text-mainPurple uppercase tracking-[0.15em] mb-4"
            >
              Why Segwae
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="font-satoshi font-black text-4xl md:text-5xl text-white max-w-lg leading-tight"
            >
              Everything you need.<br />Nothing you don&apos;t.
            </motion.h2>
          </InView>

          <InView className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border border-white/[0.07] rounded-2xl overflow-hidden">
            {FEATURES.map((f, i) => {
              const Icon = f.icon
              const isLastRow = i >= 3
              const isLastCol = (i + 1) % 3 === 0
              return (
                <motion.div
                  key={f.title}
                  variants={fadeUp}
                  className={`p-8 bg-[#080B14] hover:bg-[#0D1122] transition-colors group ${
                    !isLastRow ? 'border-b border-white/[0.07]' : ''
                  } ${!isLastCol ? 'lg:border-r border-white/[0.07]' : ''}`}
                >
                  <div className="w-10 h-10 rounded-lg bg-mainPurple/10 border border-mainPurple/20 flex items-center justify-center mb-5 group-hover:bg-mainPurple/20 transition-colors">
                    <Icon className="w-4.5 h-4.5 text-mainPurple" />
                  </div>
                  <h3 className="font-spaceGrotesk font-semibold text-white text-base mb-2 group-hover:text-mainPurple transition-colors">
                    {f.title}
                  </h3>
                  <p className="font-openSans text-[#8E8E9A] text-sm leading-relaxed">
                    {f.desc}
                  </p>
                </motion.div>
              )
            })}
          </InView>
        </div>
      </section>

      {/* ══ EVENTS ═════════════════════════════════════════════════════════ */}
      <section className="py-28 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <InView className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div variants={fadeUp}>
              <p className="font-spaceGrotesk text-xs font-semibold text-mainPurple uppercase tracking-[0.15em] mb-4">
                Events
              </p>
              <h2 className="font-satoshi font-black text-4xl md:text-5xl text-grey1 leading-tight">
                Power Your Next Event with Segwae
              </h2>
            </motion.div>
            <motion.div variants={fadeUp} className="space-y-6">
              <p className="font-openSans text-grey2 text-lg leading-relaxed">
                Let guests connect instantly. No typing, no fumbling — just
                scan, tap, and connect. Perfect for conferences, trade
                shows, and meetups.
              </p>
              <a
                href="#waitlist"
                className="inline-block bg-grey1 text-white px-8 py-4 rounded-full font-spaceGrotesk font-semibold text-sm hover:bg-mainPurple transition-all"
              >
                Join the Waitlist
              </a>
            </motion.div>
          </InView>
        </div>
      </section>

      {/* ══ FINAL CTA ══════════════════════════════════════════════════════ */}
      <section className="relative py-32 px-4 bg-[#080B14] overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 75% 65% at 50% 50%, rgba(106,13,173,0.2) 0%, transparent 68%)',
          }}
        />
        <InView className="relative max-w-3xl mx-auto text-center">
          <motion.h2
            variants={fadeUp}
            className="font-satoshi font-black text-4xl md:text-6xl text-white mb-6 leading-[1.06]"
          >
            Ready to stand out<br />and stay connected?
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="font-openSans text-[#8E8E9A] text-lg mb-10 max-w-lg mx-auto"
          >
            Join professionals and founders using Segwae to make real
            connections.
          </motion.p>
          <motion.div variants={fadeUp}>
            <Link
              href="/signup"
              className="inline-block bg-mainPurple text-white px-12 py-5 rounded-full font-spaceGrotesk font-bold text-base hover:bg-[#7D0FC9] transition-all shadow-[0_0_44px_rgba(106,13,173,0.5)] hover:shadow-[0_0_60px_rgba(106,13,173,0.65)]"
            >
              Get Started Free
            </Link>
          </motion.div>
        </InView>
      </section>

      {/* ══ WAITLIST ════════════════════════════════════════════════════════ */}
      <section id="waitlist" className="py-24 px-4 bg-grey6">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-10">
            <p className="font-spaceGrotesk text-xs font-semibold text-mainPurple uppercase tracking-[0.15em] mb-4">
              Stay in the loop
            </p>
            <h2 className="font-satoshi font-black text-4xl md:text-5xl text-grey1 mb-4">
              Join Our Event Network
            </h2>
            <p className="font-openSans text-grey2 text-base">
              Get notified about networking events in your area.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-8 border border-grey4">
            <WaitlistForm />
          </div>
        </div>
      </section>

    </div>
  )
}
