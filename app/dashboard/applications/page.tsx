'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { FaBuilding, FaVideo, FaCircle } from 'react-icons/fa6'
import { createClient } from '@/lib/supabase/client'
import type { JobApplication } from '@/lib/types'

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  applied: { label: 'Application sent', color: 'text-blue bg-blue/10' },
  under_review: { label: 'Under review', color: 'text-warningYellow bg-warningYellow/10' },
  shortlisted: { label: 'Shortlisted', color: 'text-mainPurple bg-lightPurple' },
  accepted: { label: "Congratulations! You've been accepted", color: 'text-successGreen bg-successGreen/10' },
  rejected: { label: 'Not selected', color: 'text-errorRed bg-errorRed/10' },
}

type JobWithCompany = { title: string; companies?: { name: string; logo_url: string | null } | null }

function ApplicationCard({ app }: { app: JobApplication }) {
  const jobData = app.jobs as JobWithCompany | undefined
  const company = jobData?.companies
  const jobTitle = jobData?.title
  const config = STATUS_CONFIG[app.status] ?? STATUS_CONFIG.applied
  const schedule = app.interview_schedules

  return (
    <div className="bg-white rounded-2xl border border-grey4/60 p-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl overflow-hidden bg-grey5 flex items-center justify-center shrink-0">
          {company?.logo_url ? (
            <Image src={company.logo_url} alt={company.name} width={48} height={48} className="object-cover w-full h-full" />
          ) : (
            <FaBuilding className="w-5 h-5 text-grey3" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-satoshi font-bold text-lg text-grey1 leading-tight">{jobTitle ?? '—'}</p>
          <p className="font-openSans text-sm text-grey2 mt-0.5">{company?.name ?? '—'}</p>

          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className={`text-xs font-semibold font-satoshi px-2.5 py-1 rounded-full ${config.color}`}>
              {config.label}
            </span>
            <span className="font-openSans text-xs text-grey3">
              Applied {new Date(app.applied_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>

          {app.status === 'accepted' && schedule && (
            <div className="mt-4 p-4 bg-successGreen/5 border border-successGreen/20 rounded-lg">
              <p className="font-satoshi font-semibold text-xs text-successGreen mb-1">Interview Scheduled</p>
              <p className="font-openSans text-sm text-grey1">
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
                  className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-successGreen text-white rounded-lg font-satoshi font-semibold text-xs hover:opacity-90 transition-opacity"
                >
                  <FaVideo className="w-3 h-3" /> Join Meeting
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
        <div className="w-7 h-7 border-[3px] border-mainPurple border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <p className="font-satoshi text-[11px] font-semibold text-mainPurple uppercase tracking-[0.22em] mb-1">Jobs</p>
        <div className="flex items-center justify-between">
          <h1 className="font-satoshi font-bold text-2xl text-grey1">My Applications</h1>
          <div className="flex items-center gap-3">
            {realtimeConnected && (
              <span className="flex items-center gap-1.5 font-openSans text-[11px] text-successGreen">
                <FaCircle className="w-1.5 h-1.5" /> Live
              </span>
            )}
            <Link href="/jobs" className="text-xs font-semibold font-satoshi text-mainPurple hover:opacity-70 transition-opacity">
              Browse jobs →
            </Link>
          </div>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-grey4/60 py-20 flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-lightPurple flex items-center justify-center">
            <FaBuilding className="w-5 h-5 text-mainPurple" />
          </div>
          <p className="font-satoshi font-semibold text-grey1">No applications yet</p>
          <p className="font-openSans text-sm text-grey3">Apply to jobs and track your progress here</p>
          <Link
            href="/jobs"
            className="mt-2 px-6 py-2.5 bg-mainPurple text-white rounded-lg font-satoshi font-semibold text-sm hover:bg-[#4338CA] transition-colors"
          >
            Browse Jobs
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
