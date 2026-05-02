import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCompanyByOwner, getJobById, updateInterview } from '@/lib/hiring/queries'

async function getAuthedUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  const { scheduled_at, duration_minutes, notes, status } = body

  // Verify ownership through the chain: interview → application → job → company
  const supabase = await createClient()
  const { data: interview } = await supabase
    .from('interview_schedules')
    .select('id, application_id')
    .eq('id', id)
    .single()

  if (!interview) return NextResponse.json({ error: 'Interview not found' }, { status: 404 })

  const { data: appRow } = await supabase
    .from('job_applications')
    .select('job_id')
    .eq('id', interview.application_id)
    .single()

  if (!appRow) return NextResponse.json({ error: 'Application not found' }, { status: 404 })

  const job = await getJobById(appRow.job_id)
  if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

  const company = await getCompanyByOwner(user.id)
  if (!company || company.id !== job.company_id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const updated = await updateInterview(id, {
      ...(scheduled_at !== undefined && { scheduled_at }),
      ...(duration_minutes !== undefined && { duration_minutes }),
      ...(notes !== undefined && { notes }),
      ...(status !== undefined && { status }),
    })
    return NextResponse.json({ interview: updated })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Update failed' }, { status: 500 })
  }
}
