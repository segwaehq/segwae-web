'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { FaBuilding, FaVideo, FaCircle } from 'react-icons/fa6'
import { createClient } from '@/lib/supabase/client'
import type { JobApplication } from '@/lib/types'

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  applied: { label: 'Application sent', color: 'text-[#5A2DD4] bg-[#F1ECFD] dark:text-[#b9a4f7] dark:bg-[#221b36]' },
  under_review: { label: 'Under review', color: 'text-[#1E5BBF] bg-[#E8EFFB] dark:text-[#7fb0f5] dark:bg-[#13203a]' },
  shortlisted: { label: 'Shortlisted', color: 'text-[#C2410C] bg-[#FDF0E7] dark:text-[#f2a56b] dark:bg-[#2a1a10]' },
  accepted: { label: "Congratulations! You've been accepted", color: 'text-[#16895E] bg-[#E7F6EF] dark:text-[#4ade9e] dark:bg-[#12271e]' },
  rejected: { label: 'Not selected', color: 'text-[#9098A3] bg-[#F3F3F7] dark:text-content-subtle dark:bg-white/[0.06]' },
}

type JobWithCompany = { title: string; companies?: { name: string; logo_url: string | null } | null }

function ApplicationCard({ app }: { app: JobApplication }) {
  const jobData = app.jobs as JobWithCompany | undefined
  const company = jobData?.companies
  const jobTitle = jobData?.title
  const config = STATUS_CONFIG[app.status] ?? STATUS_CONFIG.applied
  const schedule = app.interview_schedules

  return (
    <div className="bg-white dark:bg-surface-raised rounded-[18px] border border-[#E8E8EF] dark:border-line p-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#F1F0F6] dark:bg-[#241d38] flex items-center justify-center shrink-0">
          {company?.logo_url ? (
            <Image src={company.logo_url} alt={company.name} width={48} height={48} className="object-cover w-full h-full" />
          ) : (
            <FaBuilding className="w-5 h-5 text-[#9098A3] dark:text-content-subtle" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-satoshi font-bold text-lg text-[#15131C] dark:text-content leading-tight">{jobTitle ?? '—'}</p>
          <p className="text-sm font-medium text-[#6B6478] dark:text-content-muted mt-0.5">{company?.name ?? '—'}</p>

          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className={`text-xs font-semibold font-satoshi px-2.5 py-1 rounded-full ${config.color}`}>
              {config.label}
            </span>
            <span className="text-xs text-[#9098A3] dark:text-content-subtle">
              Applied {new Date(app.applied_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>

          {(app.status === 'shortlisted' || app.status === 'accepted') && schedule && (
            <div className="mt-4 p-4 bg-[#E7F6EF] dark:bg-[#12271e] border border-[#D0EADD] dark:border-[#1e3a2e] rounded-xl">
              <p className="font-satoshi font-bold text-xs text-[#16895E] dark:text-[#4ade9e] mb-1">Interview scheduled</p>
              <p className="text-sm font-medium text-[#15131C] dark:text-content">
                {new Date(schedule.scheduled_at).toLocaleDateString('en-GB', {
                  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                })}{' '}
                at {new Date(schedule.scheduled_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
              </p>
              {schedule.meet_link && (
                <a
                  href={schedule.meet_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-[#16895E] text-white rounded-lg font-satoshi font-bold text-xs hover:opacity-90 transition-opacity"
                >
                  <FaVideo className="w-3 h-3" /> Join meeting
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [realtimeConnected, setRealtimeConnected] = useState(false)

  const fetchApplications = useCallback(async () => {
    const res = await fetch('/api/hiring/applications')
    const data = await res.json()
    setApplications(data.applications ?? [])
  }, [])

  useEffect(() => {
    fetchApplications().finally(() => setLoading(false))
  }, [fetchApplications])

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('my-applications')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'job_applications' },
        () => {
          fetchApplications()
        }
      )
      .subscribe((status) => {
        setRealtimeConnected(status === 'SUBSCRIBED')
      })

    return () => { supabase.removeChannel(channel) }
  }, [fetchApplications])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-7 h-7 border-[3px] border-[#5A2DD4] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-full">
      <div className="mb-8">
        <p className="font-satoshi text-[12px] font-bold text-[#5A2DD4] dark:text-[#b9a4f7] uppercase tracking-[0.14em] mb-1.5">Jobs</p>
        <div className="flex items-center justify-between">
          <h1 className="font-satoshi font-black tracking-[-0.02em] text-[26px] text-[#15131C] dark:text-content">My applications</h1>
          <div className="flex items-center gap-3">
            {realtimeConnected && (
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-[#16895E] dark:text-[#4ade9e]">
                <FaCircle className="w-1.5 h-1.5" /> Live
              </span>
            )}
            <Link href="/jobs" className="text-xs font-bold font-satoshi text-[#5A2DD4] dark:text-[#b9a4f7] hover:opacity-70 transition-opacity">
              Browse jobs →
            </Link>
          </div>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="bg-white dark:bg-surface-raised rounded-[18px] border border-[#E8E8EF] dark:border-line py-20 flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#F1ECFD] dark:bg-[#221b36] flex items-center justify-center">
            <FaBuilding className="w-5 h-5 text-[#5A2DD4] dark:text-[#b9a4f7]" />
          </div>
          <p className="font-satoshi font-bold text-[#15131C] dark:text-content">No applications yet</p>
          <p className="text-sm text-[#9098A3] dark:text-content-subtle">Apply to jobs and track your progress here</p>
          <Link
            href="/jobs"
            className="mt-2 px-6 py-2.5 bg-brand-gradient text-white rounded-xl font-satoshi font-bold text-sm shadow-[0_10px_24px_-6px_rgba(74,55,216,0.45)] hover:-translate-y-0.5 transition-transform"
          >
            Browse jobs
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <ApplicationCard key={app.id} app={app} />
          ))}
        </div>
      )}
    </div>
  )
}
