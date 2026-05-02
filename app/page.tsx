'use client'

import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import {
  FaArrowRight,
  FaLocationDot,
  FaBriefcase,
  FaUsers,
  FaClock,
  FaQrcode,
  FaCreditCard,
  FaShieldHalved,
  FaWifi,
} from 'react-icons/fa6'

const ease = [0.22, 1, 0.36, 1] as const

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

function InView({ children, className }: { children: React.ReactNode; className?: string }) {
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

const PREVIEW_JOBS = [
  {
    title: 'Product Designer',
    company: 'Stripe',
    location: 'Remote',
    mode: 'Remote',
    salary: '$120k – $160k',
    tags: ['Figma', 'UX Research'],
    color: '#635BFF',
    initials: 'ST',
    timeAgo: '2d ago',
  },
  {
    title: 'Senior Frontend Engineer',
    company: 'Spotify',
    location: 'Stockholm',
    mode: 'Hybrid',
    salary: '€85k – €115k',
    tags: ['React', 'TypeScript'],
    color: '#1DB954',
    initials: 'SP',
    timeAgo: 'Today',
  },
  {
    title: 'Marketing Manager',
    company: 'Canva',
    location: 'Sydney',
    mode: 'On-site',
    salary: 'A$95k – $130k',
    tags: ['Growth', 'Brand'],
    color: '#00C4CC',
    initials: 'CV',
    timeAgo: '1d ago',
  },
]

const MODE_STYLES: Record<string, string> = {
  Remote: 'text-successGreen bg-successGreen/10',
  'On-site': 'text-blue bg-blue/10',
  Hybrid: 'text-mainPurple bg-lightPurple',
}

const STEPS = [
  {
    num: '01',
    title: 'Build your profile',
    desc: 'Add your experience, skills, and portfolio. Get a shareable link and QR code — live in minutes.',
  },
  {
    num: '02',
    title: 'Discover opportunities',
    desc: 'Browse roles matched to your skills at companies across the globe.',
  },
  {
    num: '03',
    title: 'Apply & connect',
    desc: 'One-tap applications. Real connections. Your next role is closer than you think.',
  },
]

export default function Home() {
  return (
    <div className="overflow-x-hidden">

      {/* ═══ HERO ════════════════════════════════════════════════════════════ */}
      <section className="relative bg-white min-h-screen flex items-center">

        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
            backgroundSize: '28px 28px',
            opacity: 0.55,
          }}
        />
        {/* Fade bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-linear-to-t from-white to-transparent pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-32 pb-20 lg:pt-44 lg:pb-28">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">

            {/* Left — headline + CTAs */}
            <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-7">

              <motion.h1
                variants={fadeUp}
                className="font-dmSerif text-grey1 leading-[1.04]"
                style={{ fontSize: 'clamp(2.75rem, 6.5vw, 5rem)' }}
              >
                Find work<br />that matters.
              </motion.h1>

              <motion.p variants={fadeUp} className="font-openSans text-grey3 text-lg leading-relaxed max-w-[400px]">
                Segwae connects professionals with great roles at companies that value their work.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
                <Link
                  href="/jobs"
                  className="inline-flex items-center gap-2 bg-mainPurple text-white px-6 py-3 rounded-lg font-satoshi font-semibold text-sm hover:bg-[#4338CA] transition-colors"
                >
                  Browse Open Roles <FaArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 border border-grey4 text-grey2 px-6 py-3 rounded-lg font-satoshi font-semibold text-sm hover:border-grey3 hover:text-grey1 transition-colors bg-white"
                >
                  Create Free Profile
                </Link>
              </motion.div>

              <motion.div variants={fadeUp} className="flex items-center gap-10 pt-4 border-t border-grey4">
                {[
                  { num: '500+', label: 'Open Roles' },
                  { num: '50+', label: 'Companies' },
                  { num: '10k+', label: 'Professionals' },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="font-dmSerif text-2xl text-grey1">{s.num}</p>
                    <p className="font-openSans text-xs text-grey3 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right — job panel (desktop) */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.65, ease }}
              className="hidden lg:block"
            >
              <div className="bg-white border border-grey4 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-grey4 flex items-center justify-between">
                  <span className="font-satoshi font-semibold text-sm text-grey1">Latest Opportunities</span>
                  <Link href="/jobs" className="font-satoshi text-xs text-mainPurple font-medium hover:underline">
                    View all →
                  </Link>
                </div>
                <div className="divide-y divide-grey4">
                  {PREVIEW_JOBS.map((job) => (
                    <Link
                      href="/jobs"
                      key={job.title}
                      className="flex items-center gap-4 px-5 py-4 hover:bg-grey6 transition-colors group"
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-[11px] font-satoshi font-bold shrink-0"
                        style={{ backgroundColor: job.color }}
                      >
                        {job.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-satoshi font-semibold text-sm text-grey1 group-hover:text-mainPurple transition-colors truncate">
                          {job.title}
                        </p>
                        <p className="font-openSans text-xs text-grey3 mt-0.5">{job.company} · {job.location}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`text-[10px] font-satoshi font-semibold px-2 py-0.5 rounded-md ${MODE_STYLES[job.mode]}`}>
                          {job.mode}
                        </span>
                        <p className="font-satoshi text-xs text-grey3 mt-1">{job.salary}</p>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="px-5 py-3.5 bg-grey6 border-t border-grey4">
                  <p className="font-openSans text-xs text-grey3 text-center">Updated daily · 500+ open positions</p>
                </div>
              </div>
            </motion.div>

            {/* Mobile: single preview row */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="lg:hidden bg-white border border-grey4 rounded-xl p-4 shadow-sm"
            >
              <Link href="/jobs" className="flex items-center gap-3 group">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-[11px] font-satoshi font-bold shrink-0"
                  style={{ backgroundColor: '#635BFF' }}
                >
                  ST
                </div>
                <div className="flex-1">
                  <p className="font-satoshi font-semibold text-sm text-grey1 group-hover:text-mainPurple transition-colors">
                    Product Designer
                  </p>
                  <p className="font-openSans text-xs text-grey3 mt-0.5">Stripe · Remote</p>
                </div>
                <FaArrowRight className="w-3.5 h-3.5 text-grey4 group-hover:text-mainPurple transition-colors" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ OPEN POSITIONS ══════════════════════════════════════════════════ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-grey6">
        <div className="max-w-6xl mx-auto">

          <InView className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <motion.p variants={fadeUp} className="font-satoshi text-[11px] font-semibold text-mainPurple uppercase tracking-[0.18em] mb-2">
                Open Positions
              </motion.p>
              <motion.h2 variants={fadeUp} className="font-dmSerif text-4xl md:text-5xl text-grey1 leading-[1.05]">
                Find your next<br className="hidden md:block" /> opportunity.
              </motion.h2>
            </div>
            <motion.div variants={fadeUp}>
              <Link href="/jobs" className="inline-flex items-center gap-1.5 font-satoshi font-medium text-sm text-mainPurple group">
                Browse all roles <FaArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </motion.div>
          </InView>

          {/* Category tabs */}
          <InView className="flex flex-wrap gap-2 mb-8">
            {['All Roles', 'Tech', 'Design', 'Marketing', 'Finance', 'Operations', 'Remote'].map((cat, i) => (
              <motion.span key={cat} variants={fadeUp}>
                <Link
                  href="/jobs"
                  className={`inline-block px-4 py-1.5 rounded-md font-satoshi font-medium text-xs transition-colors ${
                    i === 0
                      ? 'bg-mainPurple text-white'
                      : 'bg-white border border-grey4 text-grey3 hover:border-grey3 hover:text-grey2'
                  }`}
                >
                  {cat}
                </Link>
              </motion.span>
            ))}
          </InView>

          {/* Job cards */}
          <InView className="grid md:grid-cols-3 gap-4 mb-10">
            {PREVIEW_JOBS.map((job) => (
              <motion.div key={job.title} variants={fadeUp}>
                <Link href="/jobs" className="block group h-full">
                  <div className="bg-white rounded-xl border border-grey4 p-5 hover:border-mainPurple/40 hover:shadow-sm transition-all duration-200 h-full flex flex-col">
                    <div className="flex items-start gap-3 mb-4">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-[11px] font-satoshi font-bold shrink-0"
                        style={{ backgroundColor: job.color }}
                      >
                        {job.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-satoshi font-semibold text-sm text-grey1 group-hover:text-mainPurple transition-colors leading-snug">
                          {job.title}
                        </p>
                        <p className="font-openSans text-xs text-grey3 mt-0.5">{job.company}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      <span className={`text-[10px] font-satoshi font-semibold px-2 py-0.5 rounded-md ${MODE_STYLES[job.mode]}`}>
                        {job.mode}
                      </span>
                      <span className="flex items-center gap-1 font-openSans text-[11px] text-grey3">
                        <FaLocationDot className="w-2.5 h-2.5" />{job.location}
                      </span>
                    </div>

                    <div className="flex gap-1.5 flex-wrap mb-3">
                      {job.tags.map((tag) => (
                        <span key={tag} className="text-[10px] font-openSans text-grey3 bg-grey5 px-2 py-0.5 rounded-md">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-grey4">
                      <span className="font-satoshi font-semibold text-xs text-grey1">{job.salary}</span>
                      <span className="font-openSans text-xs text-grey3">{job.timeAgo}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </InView>

          <InView>
            <motion.div variants={fadeUp} className="text-center">
              <Link
                href="/jobs"
                className="inline-flex items-center gap-2 bg-grey1 text-white px-8 py-3 rounded-lg font-satoshi font-semibold text-sm hover:bg-mainPurple transition-colors duration-200"
              >
                View All Open Positions <FaArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>
          </InView>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">

          <InView className="mb-16">
            <motion.p variants={fadeUp} className="font-satoshi text-[11px] font-semibold text-mainPurple uppercase tracking-[0.18em] mb-2">
              How It Works
            </motion.p>
            <motion.h2 variants={fadeUp} className="font-dmSerif text-4xl md:text-5xl text-grey1 leading-[1.05] max-w-md">
              Three steps to your next opportunity.
            </motion.h2>
          </InView>

          <InView className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-grey4">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                variants={fadeUp}
                className={`py-8 md:py-4 ${i === 0 ? 'md:pr-12' : i === 2 ? 'md:pl-12' : 'md:px-12'}`}
              >
                <span className="font-dmSerif text-5xl text-grey4 block mb-5">{step.num}</span>
                <div className="h-px bg-grey4 mb-5" />
                <h3 className="font-satoshi font-semibold text-base text-grey1 mb-2">{step.title}</h3>
                <p className="font-openSans text-sm text-grey3 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </InView>
        </div>
      </section>

      {/* ═══ FOR EMPLOYERS ═══════════════════════════════════════════════════ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#111827]">
        <div className="max-w-6xl mx-auto">
          <InView className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div variants={fadeUp}>
              <p className="font-satoshi text-[11px] font-semibold text-accent uppercase tracking-[0.18em] mb-4">
                For Employers
              </p>
              <h2 className="font-dmSerif text-4xl md:text-5xl text-white leading-[1.05] mb-5">
                Hire the world&apos;s<br />best talent.
              </h2>
              <p className="font-openSans text-white/50 text-base leading-relaxed">
                Post jobs to thousands of qualified professionals. Manage applications, review profiles, and find your next great hire — all in one dashboard.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className="flex flex-col gap-6">
              <div className="flex flex-col gap-3.5">
                {[
                  { icon: FaBriefcase, text: 'Post unlimited job roles' },
                  { icon: FaUsers, text: 'Review candidate profiles & CVs' },
                  { icon: FaClock, text: 'Manage all applications in one place' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3 font-openSans text-sm text-white/55">
                    <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center shrink-0">
                      <Icon className="w-3.5 h-3.5 text-accent" />
                    </div>
                    {text}
                  </div>
                ))}
              </div>
              <Link
                href="/signup"
                className="self-start inline-flex items-center gap-2 bg-accent text-[#111827] px-6 py-3 rounded-lg font-satoshi font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                Start Hiring <FaArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>
          </InView>
        </div>
      </section>

      {/* ═══ DIGITAL IDENTITY ════════════════════════════════════════════════ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-grey6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl border border-grey4 p-8 md:p-12">
            <InView className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div variants={fadeUp}>
                <span className="inline-block font-satoshi text-[10px] font-semibold text-grey3 uppercase tracking-[0.18em] mb-4 px-3 py-1.5 bg-grey5 rounded-md border border-grey4">
                  Also on Segwae
                </span>
                <h2 className="font-dmSerif text-3xl md:text-4xl text-grey1 leading-[1.08] mb-4">
                  Your digital identity,<br />always in your pocket.
                </h2>
                <p className="font-openSans text-grey3 text-base leading-relaxed mb-6">
                  Create a shareable profile with a QR code or NFC card. One tap and anyone can view your contact, portfolio, and social links — no app required on their end.
                </p>
                <div className="flex flex-col sm:flex-row gap-5">
                  <Link href="/signup" className="inline-flex items-center gap-1.5 font-satoshi font-medium text-sm text-mainPurple group">
                    Create your profile <FaArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                  <Link href="/store" className="inline-flex items-center gap-1.5 font-satoshi font-medium text-sm text-grey3 hover:text-grey1 transition-colors">
                    Order NFC Card <FaArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </motion.div>

              <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3">
                {[
                  { icon: FaQrcode, label: 'QR Code', desc: 'Instant scan-to-view. Works offline.' },
                  { icon: FaCreditCard, label: 'NFC Card', desc: 'One tap to share your profile.' },
                  { icon: FaShieldHalved, label: 'Privacy Controls', desc: "You decide exactly what's visible." },
                  { icon: FaWifi, label: 'Offline-Ready', desc: 'Share without internet access.' },
                ].map(({ icon: Icon, label, desc }) => (
                  <div key={label} className="bg-grey6 rounded-xl p-4 border border-grey4">
                    <div className="w-8 h-8 rounded-lg bg-mainPurple/8 flex items-center justify-center mb-3">
                      <Icon className="w-4 h-4 text-mainPurple" />
                    </div>
                    <p className="font-satoshi font-semibold text-sm text-grey1 mb-1">{label}</p>
                    <p className="font-openSans text-xs text-grey3 leading-relaxed">{desc}</p>
                  </div>
                ))}
              </motion.div>
            </InView>
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══════════════════════════════════════════════════════ */}
      <section className="py-28 px-4 bg-[#111827]">
        <InView className="max-w-3xl mx-auto text-center">
          <motion.h2
            variants={fadeUp}
            className="font-dmSerif text-white leading-[1.05] mb-5"
            style={{ fontSize: 'clamp(2.25rem, 5vw, 4rem)' }}
          >
            Your next chapter<br />starts here.
          </motion.h2>
          <motion.p variants={fadeUp} className="font-openSans text-white/45 text-lg mb-10 max-w-sm mx-auto leading-relaxed">
            Join thousands of professionals building careers and making connections on Segwae.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/jobs"
              className="inline-flex items-center justify-center gap-2 bg-mainPurple text-white px-8 py-3.5 rounded-lg font-satoshi font-semibold text-sm hover:bg-[#4338CA] transition-colors"
            >
              Browse Jobs
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 border border-white/20 text-white px-8 py-3.5 rounded-lg font-satoshi font-semibold text-sm hover:bg-white/6 transition-colors"
            >
              Create Free Profile
            </Link>
          </motion.div>
        </InView>
      </section>

    </div>
  )
}
