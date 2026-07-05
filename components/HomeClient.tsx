'use client'

import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
  FaEnvelope,
  FaPhone,
  FaFileLines,
  FaShareNodes,
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

export type PreviewJob = {
  id?: string
  title: string
  company: string
  location: string
  mode: 'Remote' | 'Hybrid' | 'On-site'
  salary: string
  tags: string[]
  initials: string
  timeAgo: string
}

// Shown only when the database has no active jobs yet (keeps the page populated).
const FALLBACK_JOBS: PreviewJob[] = [
  {
    title: 'Senior Product Designer',
    company: 'Linear',
    location: 'Worldwide',
    mode: 'Remote',
    salary: '$140–180k',
    tags: ['Figma', 'Design systems'],
    initials: 'LN',
    timeAgo: 'Today',
  },
  {
    title: 'Frontend Engineer',
    company: 'Notion',
    location: 'Berlin',
    mode: 'Hybrid',
    salary: '€85–115k',
    tags: ['React', 'TypeScript'],
    initials: 'NT',
    timeAgo: '2d ago',
  },
  {
    title: 'Growth Marketing Lead',
    company: 'Ramp',
    location: 'New York',
    mode: 'On-site',
    salary: '$120–150k',
    tags: ['Growth', 'Lifecycle'],
    initials: 'RM',
    timeAgo: '1d ago',
  },
]

const MODE_STYLES: Record<PreviewJob['mode'], string> = {
  Remote: 'text-[#16895E] bg-[#E7F6EF] dark:text-[#4ade9e] dark:bg-[#12271e]',
  Hybrid: 'text-[#5A2DD4] bg-[#F1ECFD] dark:text-[#b9a4f7] dark:bg-[#221b36]',
  'On-site': 'text-[#1E5BBF] bg-[#E8EFFB] dark:text-[#7fb0f5] dark:bg-[#13203a]',
}

const COMPANIES = ['Linear', 'Notion', 'Figma', 'Vercel', 'Ramp', 'Loom']

const CATEGORIES = ['All roles', 'Engineering', 'Design', 'Product', 'Marketing', 'Data', 'Remote']

const STEPS = [
  {
    num: '01',
    title: 'Build your profile',
    desc: 'Add your experience, skills, and portfolio. Get a shareable link and QR code — live in minutes.',
  },
  {
    num: '02',
    title: 'Discover the right roles',
    desc: 'Browse openings matched to your skills at companies worth your time, across the globe.',
  },
  {
    num: '03',
    title: 'Apply & connect',
    desc: 'One-tap applications. Real connections. Your next role is closer than you think.',
  },
]

const EMPLOYER_FEATURES = [
  { icon: FaBriefcase, text: 'Post unlimited job roles' },
  { icon: FaUsers, text: 'Review candidate profiles & CVs' },
  { icon: FaClock, text: 'Manage all applications in one place' },
]

const IDENTITY_FEATURES = [
  { icon: FaQrcode, label: 'QR code', desc: 'Instant scan-to-view. Works offline.' },
  { icon: FaCreditCard, label: 'NFC card', desc: 'One tap to share your profile.' },
  { icon: FaShieldHalved, label: 'Privacy controls', desc: "You decide exactly what's visible." },
  { icon: FaWifi, label: 'Offline-ready', desc: 'Share without internet access.' },
]

function jobHref(job: PreviewJob) {
  return job.id ? `/jobs/${job.id}` : '/jobs'
}

export default function HomeClient({ previewJobs }: { previewJobs: PreviewJob[] }) {
  const router = useRouter()
  const jobs = previewJobs.length > 0 ? previewJobs : FALLBACK_JOBS
  const lead = jobs[0]

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const hash = new URLSearchParams(window.location.hash.slice(1))
    const errorCode = params.get('error_code') || hash.get('error_code')
    const error = params.get('error') || hash.get('error')
    if (errorCode || error === 'access_denied') {
      router.replace('/forgot-password?error=link_expired')
    }
  }, [router])

  return (
    <div className="overflow-x-hidden text-grey1 dark:text-content">

      {/* ═══ HERO ════════════════════════════════════════════════════════════ */}
      <section className="relative bg-white dark:bg-surface overflow-hidden">
        {/* Dot grid with bottom fade */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, var(--dot) 1px, transparent 1px)',
            backgroundSize: '30px 30px',
            opacity: 0.5,
            WebkitMaskImage:
              'linear-gradient(180deg, #000 0%, #000 55%, transparent 92%)',
            maskImage: 'linear-gradient(180deg, #000 0%, #000 55%, transparent 92%)',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 lg:pt-32 lg:pb-20">
          <div className="grid lg:grid-cols-[1.04fr_0.96fr] gap-12 lg:gap-16 items-center">

            {/* Left — headline + CTAs */}
            <motion.div variants={stagger} initial="hidden" animate="visible">

              <motion.div
                variants={fadeUp}
                className="inline-flex items-center gap-2 px-[13px] py-1.5 rounded-full bg-[#F4F0FE] dark:bg-[#221b36] border border-[#E6DCFB] dark:border-[#332a4d] mb-6 whitespace-nowrap"
              >
                <span className="w-[7px] h-[7px] rounded-full bg-brand-gradient" />
                <span className="font-satoshi text-xs font-bold tracking-[0.04em] text-[#5A2DD4] dark:text-[#b9a4f7]">
                  Careers marketplace
                </span>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="font-satoshi font-black tracking-[-0.035em] leading-[1.02] text-[#0F1115] dark:text-content text-[clamp(2.9rem,5vw,4.6rem)]"
              >
                Find work that<br />moves you forward.
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="font-openSans text-grey3 dark:text-content-muted text-lg leading-relaxed font-medium max-w-[430px] mt-5"
              >
                Segwae connects ambitious professionals with standout roles — and gives you a profile recruiters actually remember. Build it once, get discovered, apply in a tap.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-wrap gap-3 mt-8">
                <Link
                  href="/jobs"
                  className="inline-flex items-center gap-2 bg-brand-gradient text-white px-6 py-3.5 rounded-[11px] font-satoshi font-bold text-sm shadow-[0_8px_22px_rgba(74,55,216,0.3)] hover:-translate-y-0.5 transition-transform"
                >
                  Browse open roles <FaArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 bg-white dark:bg-surface-raised text-grey2 dark:text-content px-6 py-3.5 rounded-[11px] font-satoshi font-bold text-sm border border-[#E2E2EA] dark:border-line hover:border-[#B9B9C6] dark:hover:border-content-subtle hover:text-grey1 transition-colors"
                >
                  Create free profile
                </Link>
              </motion.div>

              <motion.div variants={fadeUp} className="flex gap-10 mt-9 pt-6 border-t border-[#ECECF1] dark:border-line">
                {[
                  { num: '500+', label: 'Open roles' },
                  { num: '50+', label: 'Hiring companies' },
                  { num: '10k+', label: 'Professionals' },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="font-satoshi font-black text-[28px] tracking-[-0.03em] text-[#0F1115] dark:text-content leading-none">
                      {s.num}
                    </p>
                    <p className="font-openSans text-[13px] text-[#9098A3] dark:text-content-subtle mt-1.5">{s.label}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right — live opportunities panel (desktop) */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.65, ease }}
              className="hidden lg:block"
            >
              <div className="bg-white dark:bg-surface-raised border border-[#E8E8EF] dark:border-line rounded-[18px] shadow-[0_24px_60px_-24px_rgba(31,18,72,0.28)] dark:shadow-[0_24px_60px_-24px_rgba(0,0,0,0.7)] overflow-hidden">
                <div className="px-5 py-[17px] border-b border-[#EFEFF4] dark:border-line flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-brand-pulse" />
                    <span className="font-satoshi font-bold text-sm text-grey1 dark:text-content">Live opportunities</span>
                  </div>
                  <Link href="/jobs" className="font-satoshi text-xs font-semibold text-[#5A2DD4] dark:text-[#b9a4f7]">
                    View all
                  </Link>
                </div>
                <div>
                  {jobs.map((job) => (
                    <Link
                      href={jobHref(job)}
                      key={job.id ?? job.title}
                      className="flex items-center gap-3.5 px-5 py-[15px] border-b border-[#F1F1F5] dark:border-white/[0.06] hover:bg-[#FAFAFC] dark:hover:bg-white/[0.04] transition-colors"
                    >
                      <div className="w-[42px] h-[42px] rounded-[11px] bg-[#F1F0F6] dark:bg-[#241d38] flex items-center justify-center text-xs font-satoshi font-extrabold text-[#5A2DD4] dark:text-[#b9a4f7] shrink-0">
                        {job.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-satoshi font-bold text-sm text-grey1 dark:text-content truncate">{job.title}</p>
                        <p className="font-openSans text-[12.5px] font-medium text-[#9098A3] dark:text-content-subtle mt-0.5">
                          {job.company} · {job.location}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`text-[10px] font-satoshi font-bold px-2 py-[3px] rounded-md ${MODE_STYLES[job.mode]}`}>
                          {job.mode}
                        </span>
                        {job.salary && (
                          <p className="font-satoshi text-[12.5px] font-bold text-grey2 dark:text-content-muted mt-1.5">{job.salary}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="px-5 py-[13px] bg-[#FAFAFC] dark:bg-white/[0.03] border-t border-[#EFEFF4] dark:border-line text-center font-openSans text-xs font-medium text-[#9098A3] dark:text-content-subtle">
                  Updated daily · 500+ open positions
                </div>
              </div>
            </motion.div>

            {/* Mobile preview */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="lg:hidden bg-white dark:bg-surface-raised border border-[#E8E8EF] dark:border-line rounded-[14px] p-4 shadow-sm"
            >
              <Link href={jobHref(lead)} className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-[11px] bg-[#F1F0F6] dark:bg-[#241d38] flex items-center justify-center text-[11px] font-satoshi font-extrabold text-[#5A2DD4] dark:text-[#b9a4f7] shrink-0">
                  {lead.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-satoshi font-bold text-sm text-grey1 dark:text-content truncate">{lead.title}</p>
                  <p className="font-openSans text-xs font-medium text-[#9098A3] dark:text-content-subtle mt-0.5">{lead.company} · {lead.mode}</p>
                </div>
                <FaArrowRight className="w-3.5 h-3.5 text-[#C2C6CF] dark:text-content-subtle group-hover:text-[#5A2DD4] dark:group-hover:text-[#b9a4f7] transition-colors" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ COMPANY STRIP ═══════════════════════════════════════════════════ */}
      {/* <section className="bg-white border-y border-[#F1F1F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 flex items-center justify-center gap-x-11 gap-y-4 flex-wrap">
          <span className="font-satoshi text-xs font-semibold tracking-[0.1em] uppercase text-[#A6ACB6]">
            Professionals on Segwae work at
          </span>
          {COMPANIES.map((c) => (
            <span key={c} className="font-satoshi text-xl font-black tracking-[-0.03em] text-[#C2C6CF]">
              {c}
            </span>
          ))}
        </div>
      </section> */}

      {/* ═══ OPEN POSITIONS ══════════════════════════════════════════════════ */}
      <section id="roles" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-[#FAFAFB] dark:bg-[#12101b]">
        <div className="max-w-6xl mx-auto">

          <InView className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <motion.p variants={fadeUp} className="font-satoshi text-xs font-bold text-[#5A2DD4] dark:text-[#b9a4f7] uppercase tracking-[0.16em] mb-2.5">
                Open positions
              </motion.p>
              <motion.h2 variants={fadeUp} className="font-satoshi font-black tracking-[-0.03em] leading-[1.04] text-[#0F1115] dark:text-content text-[clamp(2.2rem,3.4vw,3.1rem)]">
                Find your next opportunity.
              </motion.h2>
            </div>
            <motion.div variants={fadeUp}>
              <Link href="/jobs" className="inline-flex items-center gap-1.5 font-satoshi font-bold text-sm text-[#5A2DD4] dark:text-[#b9a4f7] group">
                Browse all roles <FaArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </motion.div>
          </InView>

          {/* Category tabs */}
          <InView className="flex flex-wrap gap-2.5 mb-7">
            {CATEGORIES.map((cat, i) => (
              <motion.span key={cat} variants={fadeUp}>
                <Link
                  href="/jobs"
                  className={`inline-block px-4 py-2 rounded-[9px] font-satoshi text-[13px] transition-colors ${
                    i === 0
                      ? 'bg-brand-gradient text-white font-bold'
                      : 'bg-white dark:bg-surface-raised border border-[#E8E8EF] dark:border-line text-grey3 dark:text-content-muted font-semibold hover:border-[#B9B9C6] dark:hover:border-content-subtle hover:text-grey2 dark:hover:text-content'
                  }`}
                >
                  {cat}
                </Link>
              </motion.span>
            ))}
          </InView>

          {/* Job cards */}
          <InView className="grid md:grid-cols-3 gap-4 mb-10">
            {jobs.map((job) => (
              <motion.div key={job.id ?? job.title} variants={fadeUp}>
                <Link href={jobHref(job)} className="block group h-full">
                  <div className="bg-white dark:bg-surface-raised rounded-[15px] border border-[#E8E8EF] dark:border-line p-[22px] hover:border-[#C9BCF2] dark:hover:border-[#4a3d78] hover:shadow-[0_14px_30px_-16px_rgba(74,55,216,0.4)] dark:hover:shadow-[0_14px_30px_-16px_rgba(124,90,246,0.5)] hover:-translate-y-[3px] transition-all duration-200 h-full flex flex-col">
                    <div className="flex items-start gap-3 mb-[18px]">
                      <div className="w-11 h-11 rounded-[12px] bg-[#F1F0F6] dark:bg-[#241d38] flex items-center justify-center text-[13px] font-satoshi font-extrabold text-[#5A2DD4] dark:text-[#b9a4f7] shrink-0">
                        {job.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-satoshi font-bold text-[15px] text-grey1 dark:text-content leading-snug">{job.title}</p>
                        <p className="font-openSans text-[13px] font-medium text-[#9098A3] dark:text-content-subtle mt-0.5">{job.company}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      <span className={`text-[10px] font-satoshi font-bold px-2.5 py-[3px] rounded-md ${MODE_STYLES[job.mode]}`}>
                        {job.mode}
                      </span>
                      <span className="flex items-center gap-1 font-openSans text-xs font-medium text-[#9098A3] dark:text-content-subtle">
                        <FaLocationDot className="w-2.5 h-2.5" />{job.location}
                      </span>
                    </div>

                    {job.tags.length > 0 && (
                      <div className="flex gap-1.5 flex-wrap mb-4">
                        {job.tags.map((tag) => (
                          <span key={tag} className="text-[11px] font-openSans font-medium text-grey3 dark:text-content-muted bg-[#F3F3F7] dark:bg-white/[0.06] px-2.5 py-1 rounded-md">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-auto pt-[15px] border-t border-[#F1F1F5] dark:border-white/[0.06]">
                      {job.salary
                        ? <span className="font-satoshi font-extrabold text-[13px] text-grey1 dark:text-content">{job.salary}</span>
                        : <span />}
                      <span className="font-openSans text-xs font-medium text-[#9098A3] dark:text-content-subtle">{job.timeAgo}</span>
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
                className="inline-flex items-center gap-2 bg-[#0F1115] dark:bg-white text-white dark:text-[#0F1115] px-7 py-3.5 rounded-[11px] font-satoshi font-bold text-sm hover:bg-[#2A2540] dark:hover:bg-white/90 transition-colors duration-200"
              >
                View all open positions <FaArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>
          </InView>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-surface">
        <div className="max-w-6xl mx-auto">

          <InView className="mb-12">
            <motion.p variants={fadeUp} className="font-satoshi text-xs font-bold text-[#5A2DD4] dark:text-[#b9a4f7] uppercase tracking-[0.16em] mb-2.5">
              How it works
            </motion.p>
            <motion.h2 variants={fadeUp} className="font-satoshi font-black tracking-[-0.03em] leading-[1.04] text-[#0F1115] dark:text-content max-w-[520px] text-[clamp(2.2rem,3.4vw,3.1rem)]">
              Three steps to your next role.
            </motion.h2>
          </InView>

          <InView className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#ECECF1] dark:divide-line">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                variants={fadeUp}
                className={`py-8 md:py-2 ${i === 0 ? 'md:pr-12' : i === 2 ? 'md:pl-12' : 'md:px-12'}`}
              >
                <span className="font-satoshi font-black text-[52px] tracking-[-0.04em] text-brand-gradient block mb-[18px] leading-none">
                  {step.num}
                </span>
                <h3 className="font-satoshi font-bold text-lg text-grey1 dark:text-content mb-2.5">{step.title}</h3>
                <p className="font-openSans text-[14.5px] font-medium text-grey3 dark:text-content-muted leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </InView>
        </div>
      </section>

      {/* ═══ FOR EMPLOYERS ═══════════════════════════════════════════════════ */}
      <section id="employers" className="relative overflow-hidden py-20 md:py-24 px-4 sm:px-6 lg:px-8 bg-[#0F1115] border-y border-transparent dark:border-line">
        <div
          className="absolute -top-[120px] -right-20 w-[460px] h-[460px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(91,43,217,0.35), transparent 70%)' }}
        />
        <div className="relative max-w-6xl mx-auto">
          <InView className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div variants={fadeUp}>
              <p className="font-satoshi text-xs font-bold text-[#A78BFA] uppercase tracking-[0.16em] mb-4">
                For employers
              </p>
              <h2 className="font-satoshi font-black tracking-[-0.03em] leading-[1.04] text-white mb-[18px] text-[clamp(2.2rem,3.6vw,3.3rem)]">
                Hire standout talent, faster.
              </h2>
              <p className="font-openSans text-base font-medium text-white/55 leading-relaxed max-w-[420px]">
                Post roles to thousands of qualified professionals. Review rich profiles, manage every application, and find your next great hire — all in one dashboard.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className="flex flex-col gap-5">
              <div className="flex flex-col gap-3.5">
                {EMPLOYER_FEATURES.map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-[11px] bg-[#7C5AF6]/15 flex items-center justify-center shrink-0 text-[#A78BFA]">
                      <Icon className="w-[17px] h-[17px]" />
                    </div>
                    <span className="font-openSans text-[15px] font-medium text-white/[0.78]">{text}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/signup"
                className="self-start inline-flex items-center gap-2 bg-brand-gradient text-white px-6 py-3.5 rounded-[11px] font-satoshi font-bold text-sm shadow-[0_10px_26px_rgba(74,55,216,0.4)] hover:-translate-y-0.5 transition-transform"
              >
                Start hiring <FaArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>
          </InView>
        </div>
      </section>

      {/* ═══ DIGITAL IDENTITY ════════════════════════════════════════════════ */}
      <section id="identity" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-[#FAFAFB] dark:bg-[#12101b]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-[0.85fr_1.15fr] gap-12 lg:gap-16 items-center">

          {/* Phone mockup */}
          <InView className="flex justify-center">
            <motion.div variants={fadeUp} className="w-[280px] bg-[#0E0E12] rounded-[42px] p-[11px] shadow-[0_30px_70px_-24px_rgba(31,18,72,0.5)]">
              <div className="bg-white rounded-[32px] overflow-hidden relative">
                <div className="h-[104px] bg-brand-gradient" />
                <div className="px-[18px] pb-[22px]">
                  <div className="w-[74px] h-[74px] rounded-full border-4 border-white bg-brand-gradient -mt-[37px] flex items-center justify-center text-[26px] font-satoshi font-black text-white">
                    MC
                  </div>
                  <div className="flex items-start justify-between mt-3">
                    <div>
                      <div className="font-satoshi font-extrabold text-lg text-grey1 tracking-[-0.02em]">Maya Chen</div>
                      <div className="font-openSans text-[13px] font-medium text-[#9098A3] mt-px">Product Designer</div>
                    </div>
                    <div className="w-8 h-8 rounded-full border border-[#ECECF1] flex items-center justify-center text-[#9098A3] shrink-0">
                      <FaShareNodes className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <p className="font-openSans text-[12.5px] font-medium text-grey3 leading-relaxed mt-3">
                    Designing calm, useful products. Currently exploring new opportunities in fintech.
                  </p>
                  <div className="h-px bg-[#F1F1F5] my-4" />
                  <div className="flex gap-2">
                    {[FaEnvelope, FaPhone, FaFileLines].map((Icon, idx) => (
                      <div key={idx} className="flex-1 h-[46px] rounded-[23px] bg-[#F4F0FE] flex items-center justify-center text-[#5A2DD4]">
                        <Icon className="w-[18px] h-[18px]" />
                      </div>
                    ))}
                  </div>
                  <div className="font-satoshi text-xs font-extrabold text-grey1 mt-[18px] mb-3">Socials</div>
                  {[
                    { badge: 'in', name: 'LinkedIn', handle: '/in/mayachen' },
                    { badge: 'Dr', name: 'Dribbble', handle: '/mayachen' },
                  ].map((s) => (
                    <div key={s.name} className="flex items-center gap-2.5 mb-2.5">
                      <div className="w-[34px] h-[34px] rounded-full bg-[#F3F3F7] flex items-center justify-center text-[13px] font-satoshi font-extrabold text-grey2">
                        {s.badge}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-satoshi text-[13px] font-bold text-grey1">{s.name}</div>
                        <div className="font-openSans text-[11px] text-[#9098A3]">{s.handle}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </InView>

          {/* Copy + feature cards */}
          <InView>
            <motion.span variants={fadeUp} className="inline-block font-satoshi text-[11px] font-bold tracking-[0.14em] uppercase text-grey3 dark:text-content-muted px-3 py-1.5 bg-white dark:bg-surface-raised border border-[#E8E8EF] dark:border-line rounded-lg mb-[18px]">
              Also on Segwae
            </motion.span>
            <motion.h2 variants={fadeUp} className="font-satoshi font-black tracking-[-0.03em] leading-[1.06] text-[#0F1115] dark:text-content mb-4 text-[clamp(2rem,3.2vw,2.9rem)]">
              Your digital identity,<br />in one tap.
            </motion.h2>
            <motion.p variants={fadeUp} className="font-openSans text-base font-medium text-grey3 dark:text-content-muted leading-relaxed mb-7 max-w-[460px]">
              Every Segwae member gets a shareable profile with a QR code or NFC card. One tap and anyone sees your contact, portfolio, and links — no app required on their end.
            </motion.p>
            <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3 mb-7 max-w-[480px]">
              {IDENTITY_FEATURES.map(({ icon: Icon, label, desc }) => (
                <div key={label} className="bg-white dark:bg-surface-raised border border-[#E8E8EF] dark:border-line rounded-[13px] p-[17px]">
                  <div className="w-[34px] h-[34px] rounded-[9px] bg-[#F4F0FE] dark:bg-[#241d38] flex items-center justify-center text-[#5A2DD4] dark:text-[#b9a4f7] mb-3">
                    <Icon className="w-[17px] h-[17px]" />
                  </div>
                  <div className="font-satoshi text-sm font-bold text-grey1 dark:text-content mb-1">{label}</div>
                  <div className="font-openSans text-[12.5px] font-medium text-[#9098A3] dark:text-content-subtle leading-relaxed">{desc}</div>
                </div>
              ))}
            </motion.div>
            <motion.div variants={fadeUp} className="flex gap-6 items-center flex-wrap">
              <Link href="/signup" className="inline-flex items-center gap-1.5 font-satoshi font-bold text-sm text-[#5A2DD4] dark:text-[#b9a4f7] group">
                Create your profile <FaArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link href="/store" className="inline-flex items-center gap-1.5 font-satoshi font-semibold text-sm text-[#9098A3] dark:text-content-subtle hover:text-grey2 dark:hover:text-content-muted transition-colors">
                Order NFC card <FaArrowRight className="w-3 h-3" />
              </Link>
            </motion.div>
          </InView>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-brand-gradient py-24 md:py-26 px-4 text-center">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.14) 1px, transparent 1px)',
            backgroundSize: '30px 30px',
            opacity: 0.4,
          }}
        />
        <InView className="relative max-w-2xl mx-auto">
          <motion.h2
            variants={fadeUp}
            className="font-satoshi font-black tracking-[-0.03em] leading-[1.04] text-white mb-4 text-[clamp(2.4rem,4.4vw,3.7rem)]"
          >
            Your next chapter<br />starts here.
          </motion.h2>
          <motion.p variants={fadeUp} className="font-openSans text-lg font-medium text-white/[0.78] mb-8 max-w-[430px] mx-auto leading-relaxed">
            Join thousands of professionals building careers and making connections on Segwae.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/jobs"
              className="inline-flex items-center justify-center bg-white text-[#5A2DD4] px-[30px] py-[15px] rounded-[11px] font-satoshi font-bold text-sm hover:-translate-y-0.5 transition-transform"
            >
              Browse jobs
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center bg-white/12 text-white px-[30px] py-[15px] rounded-[11px] font-satoshi font-bold text-sm border border-white/30 hover:bg-white/20 transition-colors"
            >
              Create free profile
            </Link>
          </motion.div>
        </InView>
      </section>

    </div>
  )
}
