import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Suspense } from 'react'
import {
  FaBuilding, FaUsers, FaLocationDot, FaClock, FaArrowRight, FaMagnifyingGlass,
  FaCircleCheck, FaShieldHalved, FaBolt,
} from 'react-icons/fa6'
import type { Job } from '@/lib/types'
import { getActiveJobs } from '@/lib/hiring/queries'
import { JobFilters } from '@/components/hiring/JobFilters'
import { formatSalary } from '@/lib/currencies'

export const metadata: Metadata = {
  title: 'Browse Jobs | Segwae',
  description: 'Explore full-time, part-time, remote, and contract job opportunities. Find your next role on Segwae.',
  alternates: { canonical: 'https://segwae.com/jobs' },
  openGraph: {
    title: 'Browse Jobs | Segwae',
    description: 'Explore full-time, part-time, remote, and contract job opportunities. Find your next role on Segwae.',
    url: 'https://segwae.com/jobs',
    type: 'website',
  },
}

const JOB_TYPE_LABELS: Record<string, string> = {
  full_time: 'Full-time', part_time: 'Part-time', contract: 'Contract', internship: 'Internship',
}
const WORK_MODE_STYLES: Record<string, string> = {
  remote: 'text-[#16895E] bg-[#E7F6EF]',
  onsite: 'text-[#1E5BBF] bg-[#E8EFFB]',
  hybrid: 'text-[#5A2DD4] bg-[#F1ECFD]',
}
const WORK_MODE_LABELS: Record<string, string> = { remote: 'Remote', onsite: 'On-site', hybrid: 'Hybrid' }

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}


function JobCard({ job }: { job: Job }) {
  const company = job.companies
  const salary = job.salary_visible ? formatSalary(job.salary_min, job.salary_max, job.salary_currency) : null
  const modeStyle = WORK_MODE_STYLES[job.work_mode] ?? 'text-grey2 bg-grey5'
  const modeLabel = WORK_MODE_LABELS[job.work_mode] ?? job.work_mode

  return (
    <Link href={`/jobs/${job.id}`} className="block group">
      <div className="bg-white rounded-2xl border border-[#E8E8EF] p-[22px] hover:border-[#C9BCF2] hover:shadow-[0_16px_34px_-18px_rgba(74,55,216,0.45)] hover:-translate-y-[3px] transition-all duration-200">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-[13px] overflow-hidden bg-[#F1F0F6] flex items-center justify-center shrink-0">
            {company?.logo_url ? (
              <Image src={company.logo_url} alt={company.name} width={48} height={48} className="object-cover w-full h-full" />
            ) : (
              <FaBuilding className="w-5 h-5 text-[#5A2DD4]" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <p className="font-satoshi font-bold text-[15.5px] text-[#15131C] group-hover:text-[#5A2DD4] transition-colors leading-snug">
                {job.title}
              </p>
              {job.posting_mode === 'external' ? (
                <span className="flex items-center gap-1 text-[10px] font-satoshi font-bold px-2 py-0.5 rounded-md text-[#16895E] bg-[#E7F6EF] shrink-0">
                  <FaCircleCheck className="w-2.5 h-2.5" />
                  Verified
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] font-satoshi font-bold px-2 py-0.5 rounded-md text-[#5A2DD4] bg-[#F1ECFD] shrink-0">
                  <FaBolt className="w-2.5 h-2.5" />
                  Direct
                </span>
              )}
            </div>
            <p className="font-openSans text-[13px] font-medium text-[#9098A3] mt-0.5">{company?.name ?? job.company_name ?? '—'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 flex-wrap">
          <span className={`text-[10px] font-satoshi font-bold px-2.5 py-[3px] rounded-md ${modeStyle}`}>{modeLabel}</span>
          <span className="text-[10px] font-satoshi font-bold px-2.5 py-[3px] rounded-md text-grey3 bg-[#F3F3F7]">
            {JOB_TYPE_LABELS[job.job_type]}
          </span>
          {job.location && (
            <span className="flex items-center gap-1 text-xs font-openSans font-medium text-[#9098A3]">
              <FaLocationDot className="w-3 h-3" /> {job.location}
            </span>
          )}
        </div>

        {job.tags && job.tags.length > 0 && (
          <div className="flex gap-1.5 mt-3 flex-wrap">
            {job.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="text-[11px] font-openSans font-medium text-grey3 bg-[#F6F5FA] px-2.5 py-1 rounded-md">{tag}</span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-[15px] border-t border-[#F1F1F5]">
          <div className="flex items-center gap-3">
            {salary && <span className="font-satoshi font-extrabold text-[13px] text-[#15131C]">{salary}</span>}
            {job.application_deadline && (
              <span className="flex items-center gap-1 text-xs font-openSans text-[#9098A3]">
                <FaClock className="w-3 h-3" />
                {new Date(job.application_deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {job.posting_mode === 'internal' && (
              <span className="flex items-center gap-1 text-xs font-openSans text-[#9098A3]">
                <FaUsers className="w-3 h-3" /> {job.application_count ?? 0} applied
              </span>
            )}
            <span className="text-xs font-openSans text-[#9098A3]">{timeAgo(job.created_at)}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

const PAGE_SIZE = 20

function buildPageUrl(sp: Record<string, string | undefined>, page: number) {
  const params = new URLSearchParams()
  if (sp.search) params.set('search', sp.search)
  if (sp.job_type) params.set('job_type', sp.job_type)
  if (sp.work_mode) params.set('work_mode', sp.work_mode)
  if (page > 1) params.set('page', String(page))
  const qs = params.toString()
  return `/jobs${qs ? `?${qs}` : ''}`
}

function PaginationControls({
  currentPage,
  totalPages,
  sp,
}: {
  currentPage: number
  totalPages: number
  sp: Record<string, string | undefined>
}) {
  if (totalPages <= 1) return null

  const pages: (number | 'ellipsis')[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (currentPage > 3) pages.push('ellipsis')
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i)
    }
    if (currentPage < totalPages - 2) pages.push('ellipsis')
    pages.push(totalPages)
  }

  return (
    <div className="flex items-center justify-center gap-1.5 mt-8">
      <Link
        href={buildPageUrl(sp, currentPage - 1)}
        aria-disabled={currentPage === 1}
        className={`px-3 py-2 rounded-lg font-satoshi font-semibold text-sm transition-colors ${
          currentPage === 1
            ? 'pointer-events-none text-grey4'
            : 'text-grey2 hover:bg-grey5'
        }`}
      >
        ← Prev
      </Link>

      {pages.map((p, i) =>
        p === 'ellipsis' ? (
          <span key={`e${i}`} className="px-2 text-grey3 font-openSans text-sm select-none">…</span>
        ) : (
          <Link
            key={p}
            href={buildPageUrl(sp, p)}
            className={`w-9 h-9 rounded-lg flex items-center justify-center font-satoshi font-semibold text-sm transition-colors ${
              p === currentPage
                ? 'bg-brand-gradient text-white'
                : 'text-grey2 hover:bg-grey5'
            }`}
          >
            {p}
          </Link>
        )
      )}

      <Link
        href={buildPageUrl(sp, currentPage + 1)}
        aria-disabled={currentPage === totalPages}
        className={`px-3 py-2 rounded-lg font-satoshi font-semibold text-sm transition-colors ${
          currentPage === totalPages
            ? 'pointer-events-none text-grey4'
            : 'text-grey2 hover:bg-grey5'
        }`}
      >
        Next →
      </Link>
    </div>
  )
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; job_type?: string; work_mode?: string; page?: string }>
}) {
  const sp = await searchParams
  const { search, job_type, work_mode, page: pageParam } = sp
  const currentPage = Math.max(1, parseInt(pageParam ?? '1', 10))

  const { jobs, total } = await getActiveJobs({ search, job_type, work_mode, page: currentPage })
  const totalPages = Math.ceil(total / PAGE_SIZE)
  const hasFilters = !!(search || job_type || work_mode)

  return (
    <div className="min-h-screen bg-[#FAFAFB]">
      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <div className="relative bg-[#0F1115] overflow-hidden">
        <div
          className="absolute -top-40 -right-16 w-[520px] h-[520px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(91,43,217,0.4), transparent 70%)' }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            WebkitMaskImage: 'linear-gradient(180deg, #000, transparent)',
            maskImage: 'linear-gradient(180deg, #000, transparent)',
          }}
        />
        <div className="relative max-w-[1100px] mx-auto px-6 pt-9 pb-9">
          <div className="flex items-center gap-2 mb-5">
            <Link href="/" className="font-satoshi text-[11px] font-bold text-white/30 hover:text-white/60 transition-colors uppercase tracking-[0.1em]">
              Segwae
            </Link>
            <span className="text-white/20 text-xs">›</span>
            <span className="font-satoshi text-[11px] font-bold text-[#A78BFA] uppercase tracking-[0.1em]">Jobs</span>
          </div>
          <h1 className="font-satoshi font-black tracking-[-0.03em] leading-[1.05] text-white text-[clamp(2.1rem,3.8vw,3rem)] mb-2">
            Find your next role.
          </h1>
          <p className="font-openSans text-white/45 text-[15px] font-medium mb-6">
            Browse open positions at companies worth your time, across the globe.
          </p>
          <Suspense>
            <JobFilters />
          </Suspense>
        </div>
      </div>

      {/* ─── Results ─────────────────────────────────────────────────────── */}
      <div className="max-w-[1100px] mx-auto px-6 py-7">
        {/* ─── How we verify ───────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-[#E8E8EF] p-5 sm:px-[22px] sm:py-5 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-5 lg:gap-7">
            <div className="flex items-center gap-3.5 lg:shrink-0">
              <div className="w-11 h-11 rounded-xl bg-[#E7F6EF] flex items-center justify-center shrink-0">
                <FaShieldHalved className="w-[19px] h-[19px] text-[#16895E]" />
              </div>
              <div>
                <p className="font-satoshi font-extrabold text-[15.5px] text-[#15131C] leading-tight tracking-[-0.01em]">
                  No ghost jobs.
                </p>
                <p className="font-openSans text-[12.5px] font-medium text-[#9098A3] leading-snug mt-0.5">
                  Every listing shows exactly where it came from.
                </p>
              </div>
            </div>

            <div className="hidden lg:block w-px h-12 bg-[#ECECF1] shrink-0" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 flex-1">
              <div className="flex items-start gap-2.5">
                <span className="flex items-center gap-1 text-[10px] font-satoshi font-bold px-2 py-0.5 rounded-md text-[#16895E] bg-[#E7F6EF] shrink-0 mt-[1px]">
                  <FaCircleCheck className="w-2.5 h-2.5" /> Verified
                </span>
                <p className="font-openSans text-[12px] font-medium text-[#9098A3] leading-snug">
                  Hand-sourced by us, then checked it&apos;s real and still open.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="flex items-center gap-1 text-[10px] font-satoshi font-bold px-2 py-0.5 rounded-md text-[#5A2DD4] bg-[#F1ECFD] shrink-0 mt-[1px]">
                  <FaBolt className="w-2.5 h-2.5" /> Direct
                </span>
                <p className="font-openSans text-[12px] font-medium text-[#9098A3] leading-snug">
                  Posted straight by the employer — apply right here on Segwae.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-5">
          <p className="font-satoshi text-sm font-semibold text-grey3">
            {total} {total === 1 ? 'role' : 'roles'} found
            {totalPages > 1 && (
              <span className="ml-1 text-grey4">· page {currentPage} of {totalPages}</span>
            )}
          </p>
          {hasFilters && (
            <Link href="/jobs" className="font-satoshi font-bold text-[13px] text-[#5A2DD4] hover:opacity-70 transition-opacity">
              Clear all filters
            </Link>
          )}
        </div>

        {jobs.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-3.5 bg-white rounded-[18px] border border-[#E8E8EF]">
            <div className="w-14 h-14 rounded-2xl bg-[#F4F0FE] flex items-center justify-center">
              <FaMagnifyingGlass className="w-5 h-5 text-[#5A2DD4]" />
            </div>
            <p className="font-satoshi font-extrabold text-lg text-[#15131C]">No roles found</p>
            <p className="font-openSans text-sm font-medium text-[#9098A3] text-center max-w-[300px]">
              {hasFilters
                ? 'Try adjusting your filters or search terms to see more opportunities.'
                : 'No positions are currently listed. Check back soon.'}
            </p>
            {hasFilters && (
              <Link href="/jobs" className="mt-1 px-[22px] py-2.5 bg-brand-gradient text-white rounded-[10px] font-satoshi font-bold text-sm hover:-translate-y-0.5 transition-transform">
                Clear filters
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              {jobs.map((job) => <JobCard key={job.id} job={job} />)}
            </div>
            <PaginationControls currentPage={currentPage} totalPages={totalPages} sp={{ search, job_type, work_mode }} />
          </>
        )}

        <div className="relative overflow-hidden mt-12 rounded-[20px] bg-brand-gradient p-[30px] flex flex-col sm:flex-row items-center justify-between gap-5">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.14) 1px, transparent 1px)',
              backgroundSize: '26px 26px',
              opacity: 0.4,
            }}
          />
          <div className="relative">
            <p className="font-satoshi font-extrabold text-[19px] tracking-[-0.02em] text-white">Hiring? Post your roles on Segwae.</p>
            <p className="font-openSans text-sm font-medium text-white/70 mt-1">
              Reach thousands of qualified professionals — your next great hire is here.
            </p>
          </div>
          <Link
            href="/dashboard/hiring/post"
            className="relative flex items-center gap-2 bg-white text-[#5A2DD4] px-6 py-3.5 rounded-[11px] font-satoshi font-bold text-sm hover:-translate-y-0.5 transition-transform whitespace-nowrap shrink-0"
          >
            Post a job <FaArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
