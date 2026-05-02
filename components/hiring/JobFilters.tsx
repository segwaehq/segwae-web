'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import { FaMagnifyingGlass, FaSliders } from 'react-icons/fa6'
import { useState } from 'react'

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
      className={`px-3.5 py-1.5 rounded-full font-syne font-bold text-xs transition-all ${
        active
          ? 'bg-mainPurple text-white shadow-[0_0_12px_rgba(124,58,237,0.35)]'
          : 'bg-white/8 border border-white/14 text-white/55 hover:text-white hover:border-white/28'
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
  const [filtersOpen, setFiltersOpen] = useState(false)

  const currentSearch = searchParams.get('search') ?? ''
  const currentType = searchParams.get('job_type') ?? ''
  const currentMode = searchParams.get('work_mode') ?? ''

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) params.set(key, value)
      else params.delete(key)
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false })
      })
    },
    [searchParams, router, pathname]
  )

  const clearAll = useCallback(() => {
    startTransition(() => {
      router.replace(pathname, { scroll: false })
    })
  }, [router, pathname])

  const activeFilterCount = [currentType, currentMode].filter(Boolean).length

  return (
    <>
      <div className="flex gap-3">
        <div className="relative flex-1">
          <FaMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-grey3" />
          <input
            type="text"
            defaultValue={currentSearch}
            onChange={(e) => updateParam('search', e.target.value || null)}
            placeholder="Search jobs, companies, keywords…"
            className="w-full pl-11 pr-4 py-3.5 bg-white rounded-xl font-openSans text-sm text-grey1 placeholder:text-grey3 outline-none focus:ring-2 focus:ring-mainPurple/30 transition-all"
          />
        </div>
        <button
          onClick={() => setFiltersOpen((o) => !o)}
          className={`px-4 py-3.5 rounded-xl font-syne font-bold text-sm flex items-center gap-2 transition-all ${
            filtersOpen || activeFilterCount > 0
              ? 'bg-mainPurple text-white'
              : 'bg-white/8 border border-white/14 text-white/70 hover:border-white/28'
          }`}
        >
          <FaSliders className="w-4 h-4" />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-accent text-[#08090D] text-[10px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {filtersOpen && (
        <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-xl flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-syne text-[11px] font-bold text-white/35 uppercase tracking-wider mr-1">Type</span>
            {JOB_TYPES.map((t) => (
              <FilterPill
                key={t.value}
                label={t.label}
                active={currentType === t.value}
                onClick={() => updateParam('job_type', currentType === t.value ? null : t.value)}
              />
            ))}
          </div>
          <div className="w-px bg-white/10 hidden sm:block self-stretch" />
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-syne text-[11px] font-bold text-white/35 uppercase tracking-wider mr-1">Mode</span>
            {WORK_MODES.map((m) => (
              <FilterPill
                key={m.value}
                label={m.label}
                active={currentMode === m.value}
                onClick={() => updateParam('work_mode', currentMode === m.value ? null : m.value)}
              />
            ))}
          </div>
          {activeFilterCount > 0 && (
            <button onClick={clearAll} className="ml-auto font-syne font-bold text-xs text-white/50 hover:text-white transition-colors">
              Clear
            </button>
          )}
        </div>
      )}
    </>
  )
}
