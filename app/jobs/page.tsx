import Link from 'next/link'
import Image from 'next/image'
import { Suspense } from 'react'
import {
  FaBuilding, FaUsers, FaLocationDot, FaClock, FaArrowRight, FaMagnifyingGlass,
} from 'react-icons/fa6'
import type { Job } from '@/lib/types'
import { getActiveJobs } from '@/lib/hiring/queries'
import { JobFilters } from '@/components/hiring/JobFilters'

const JOB_TYPE_LABELS: Record<string, string> = {
  full_time: 'Full-time', part_time: 'Part-time', contract: 'Contract', internship: 'Internship',
}
const WORK_MODE_STYLES: Record<string, string> = {
  remote: 'text-successGreen bg-successGreen/10',
  onsite: 'text-blue bg-blue/10',
  hybrid: 'text-mainPurple bg-lightPurple',
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

function formatSalary(min: number | null, max: number | null) {
  if (!min && !max) return null
  const fmt = (n: number) => n >= 1_000_000 ? `₦${(n / 1_000_000).toFixed(1)}M` : `₦${(n / 1000).toFixed(0)}k`
  if (min && max) return `${fmt(min)} – ${fmt(max)}`
  if (min) return `From ${fmt(min)}`
  return `Up to ${fmt(max!)}`
}

function JobCard({ job }: { job: Job }) {
  const company = job.companies
  const salary = job.salary_visible ? formatSalary(job.salary_min, job.salary_max) : null
  const modeStyle = WORK_MODE_STYLES[job.work_mode] ?? 'text-grey2 bg-grey5'
  const modeLabel = WORK_MODE_LABELS[job.work_mode] ?? job.work_mode

  return (
    <Link href={`/jobs/${job.id}`} className="block group">
      <div className="bg-white rounded-2xl border border-grey4/50 p-5 hover:border-mainPurple/35 hover:shadow-lg transition-all duration-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-grey5 flex items-center justify-center shrink-0 border border-grey4/40">
            {company?.logo_url ? (
              <Image src={company.logo_url} alt={company.name} width={48} height={48} className="object-cover w-full h-full" />
            ) : (
              <FaBuilding className="w-5 h-5 text-grey3" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <p className="font-satoshi font-bold text-base text-grey1 group-hover:text-mainPurple transition-colors leading-snug">
                {job.title}
              </p>
              {job.posting_mode === 'external' && (
                <span className="text-[10px] font-satoshi font-semibold px-2 py-0.5 rounded-full text-blue bg-blue/10 shrink-0">
                  External
                </span>
              )}
            </div>
            <p className="font-openSans text-sm text-grey3 mt-0.5">{company?.name ?? '—'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 flex-wrap">
          <span className={`text-[11px] font-satoshi font-semibold px-2.5 py-1 rounded-full ${modeStyle}`}>{modeLabel}</span>
          <span className="text-[11px] font-satoshi font-semibold px-2.5 py-1 rounded-full text-grey2 bg-grey5">
            {JOB_TYPE_LABELS[job.job_type]}
          </span>
          {job.location && (
            <span className="flex items-center gap-1 text-xs font-openSans text-grey3">
              <FaLocationDot className="w-3 h-3" /> {job.location}
            </span>
          )}
        </div>

        {job.tags && job.tags.length > 0 && (
          <div className="flex gap-1.5 mt-3 flex-wrap">
            {job.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="text-[10px] font-openSans text-grey3 bg-grey6 px-2 py-0.5 rounded-md">{tag}</span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-grey4/40">
          <div className="flex items-center gap-3">
            {salary && <span className="font-satoshi font-semibold text-xs text-grey1">{salary}</span>}
            {job.application_deadline && (
              <span className="flex items-center gap-1 text-xs font-openSans text-grey3">
                <FaClock className="w-3 h-3" />
                {new Date(job.application_deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {job.posting_mode === 'internal' && (
              <span className="flex items-center gap-1 text-xs font-openSans text-grey3">
                <FaUsers className="w-3 h-3" /> {job.application_count ?? 0} applied
              </span>
            )}
            <span className="text-xs font-openSans text-grey3">{timeAgo(job.created_at)}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; job_type?: string; work_mode?: string }>
}) {
  const sp = await searchParams
  const { search, job_type, work_mode } = sp

  const jobs = await getActiveJobs({ search, job_type, work_mode })
  const hasFilters = !!(search || job_type || work_mode)

  return (
    <div className="min-h-screen bg-grey6">
      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <div className="relative bg-[#111827] overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
        <div className="relative max-w-5xl mx-auto px-5 pt-10 pb-10">
          <div className="flex items-center gap-2 mb-6">
            <Link href="/" className="font-satoshi text-[11px] font-semibold text-white/30 hover:text-white/60 transition-colors uppercase tracking-wider">
              Segwae
            </Link>
            <span className="text-white/20 text-xs">›</span>
            <span className="font-satoshi text-[11px] font-semibold text-accent uppercase tracking-wider">Jobs</span>
          </div>
          <h1 className="font-dmSerif text-3xl sm:text-4xl md:text-5xl text-white leading-tight mb-2">
            Find your next role
          </h1>
          <p className="font-openSans text-white/40 text-sm mb-8">
            Browse open positions across Nigeria&apos;s fastest-growing companies.
          </p>
          <Suspense>
            <JobFilters />
          </Suspense>
        </div>
      </div>

      {/* ─── Results ─────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-5 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="font-openSans text-sm text-grey3">
            {jobs.length} {jobs.length === 1 ? 'role' : 'roles'} found
          </p>
          {hasFilters && (
            <Link href="/jobs" className="font-satoshi font-semibold text-xs text-mainPurple hover:opacity-70 transition-opacity">
              Clear all filters
            </Link>
          )}
        </div>

        {jobs.length === 0 ? (
          <div className="py-24 flex flex-col items-center gap-4 bg-white rounded-2xl border border-grey4/50">
            <div className="w-14 h-14 rounded-2xl bg-lightPurple flex items-center justify-center">
              <FaMagnifyingGlass className="w-5 h-5 text-mainPurple" />
            </div>
            <p className="font-satoshi font-bold text-lg text-grey1">No roles found</p>
            <p className="font-openSans text-sm text-grey3 text-center max-w-[280px]">
              {hasFilters
                ? 'Try adjusting your filters or search terms.'
                : 'No positions are currently listed. Check back soon.'}
            </p>
            {hasFilters && (
              <Link href="/jobs" className="mt-1 px-5 py-2 bg-mainPurple text-white rounded-lg font-satoshi font-semibold text-sm hover:bg-[#4338CA] transition-colors">
                Clear filters
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {jobs.map((job) => <JobCard key={job.id} job={job} />)}
          </div>
        )}

        <div className="mt-12 bg-[#111827] rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-satoshi font-bold text-base text-white">Hiring? Post your roles here.</p>
            <p className="font-openSans text-sm text-white/40 mt-0.5">
              Reach thousands of qualified Nigerian professionals.
            </p>
          </div>
          <Link
            href="/dashboard/hiring/post"
            className="flex items-center gap-2 bg-accent text-[#111827] px-6 py-2.5 rounded-lg font-satoshi font-semibold text-sm hover:opacity-90 transition-all whitespace-nowrap shrink-0"
          >
            Post a Job <FaArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
