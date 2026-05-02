import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCompanyByOwner, getJobById, createInterview } from '@/lib/hiring/queries'
import { generateMeetLink } from '@/lib/hiring/jitsi'

async function getAuthedUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
}

export async function POST(request: Request) {
  const user = await getAuthedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { application_id, scheduled_at, duration_minutes, notes } = body

  if (!application_id) return NextResponse.json({ error: 'application_id is required' }, { status: 400 })
  if (!scheduled_at) return NextResponse.json({ error: 'scheduled_at is required' }, { status: 400 })
  if (!duration_minutes) return NextResponse.json({ error: 'duration_minutes is required' }, { status: 400 })

  // Verify the caller owns the company that posted this application's job
  const supabase = await createClient()
  const { data: appRow } = await supabase
    .from('job_applications')
    .select('id, job_id')
    .eq('id', application_id)
    .single()

  if (!appRow) return NextResponse.json({ error: 'Application not found' }, { status: 404 })

  const job = await getJobById(appRow.job_id)
  if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

  const company = await getCompanyByOwner(user.id)
  if (!company || company.id !== job.company_id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const meet_link = generateMeetLink()

  try {
    const interview = await createInterview({
      application_id,
      scheduled_by: user.id,
      scheduled_at,
      duration_minutes,
      meet_link,
      notes: notes ?? null,
    })
    return NextResponse.json({ interview }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to schedule interview' }, { status: 500 })
  }
}
