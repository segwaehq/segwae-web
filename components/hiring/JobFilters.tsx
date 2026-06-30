'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import { FaMagnifyingGlass } from 'react-icons/fa6'

const JOB_TYPES = [
  { value: 'full_time', label: 'Full-time' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
]
const WORK_MODES = [
  { value: 'remote', label: 'Remote' },
  { value: 'onsite', label: 'On-site' },
  { value: 'hybrid', label: 'Hybrid' },
]

function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-[15px] py-2 rounded-[9px] font-satoshi text-[13px] whitespace-nowrap transition-all ${
        active
          ? 'bg-brand-gradient text-white font-bold border border-transparent'
          : 'bg-white/8 border border-white/16 text-white/70 font-semibold hover:text-white hover:border-white/28'
      }`}
    >
      {label}
    </button>
  )
}

export function JobFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const currentSearch = searchParams.get('search') ?? ''
  const currentType = searchParams.get('job_type') ?? ''
  const currentMode = searchParams.get('work_mode') ?? ''

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) params.set(key, value)
      else params.delete(key)
      params.delete('page')
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false })
      })
    },
    [searchParams, router, pathname]
  )

  return (
    <>
      <div className="relative">
        <FaMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-[17px] h-[17px] text-[#9098A3]" />
        <input
          type="text"
          defaultValue={currentSearch}
          onChange={(e) => updateParam('search', e.target.value || null)}
          placeholder="Search jobs, companies, keywords…"
          className="w-full pl-[42px] pr-4 py-[13px] bg-white rounded-[11px] font-satoshi text-sm font-medium text-[#15131C] placeholder:text-[#9098A3] outline-none focus:ring-2 focus:ring-[#5A2DD4]/30 transition-all"
        />
      </div>

      <div className="flex flex-wrap gap-2 items-center mt-3.5">
        <span className="font-satoshi text-[11px] font-bold uppercase tracking-[0.08em] text-white/30 mr-0.5">Type</span>
        {JOB_TYPES.map((t) => (
          <FilterPill
            key={t.value}
            label={t.label}
            active={currentType === t.value}
            onClick={() => updateParam('job_type', currentType === t.value ? null : t.value)}
          />
        ))}
        <span className="w-px h-5 bg-white/12 mx-1.5" />
        <span className="font-satoshi text-[11px] font-bold uppercase tracking-[0.08em] text-white/30 mr-0.5">Mode</span>
        {WORK_MODES.map((m) => (
          <FilterPill
            key={m.value}
            label={m.label}
            active={currentMode === m.value}
            onClick={() => updateParam('work_mode', currentMode === m.value ? null : m.value)}
          />
        ))}
      </div>
    </>
  )
}
