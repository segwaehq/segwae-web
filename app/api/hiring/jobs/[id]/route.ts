import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getJobById, updateJob, getCompanyByOwner } from '@/lib/hiring/queries'

async function getAuthedUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const job = await getJobById(id)
  if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  return NextResponse.json({ job })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const job = await getJobById(id)
  if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

  const company = await getCompanyByOwner(user.id)
  if (!company || company.id !== job.company_id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const {
    title, description, requirements, location, job_type, work_mode,
    posting_mode, external_url, status, salary_min, salary_max,
    salary_visible, experience_years_min, tags, application_deadline,
  } = body

  try {
    const updated = await updateJob(id, {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(requirements !== undefined && { requirements }),
      ...(location !== undefined && { location }),
      ...(job_type !== undefined && { job_type }),
      ...(work_mode !== undefined && { work_mode }),
      ...(posting_mode !== undefined && { posting_mode }),
      ...(external_url !== undefined && { external_url }),
      ...(status !== undefined && { status }),
      ...(salary_min !== undefined && { salary_min }),
      ...(salary_max !== undefined && { salary_max }),
      ...(salary_visible !== undefined && { salary_visible }),
      ...(experience_years_min !== undefined && { experience_years_min }),
      ...(tags !== undefined && { tags }),
      ...(application_deadline !== undefined && { application_deadline }),
    })
    return NextResponse.json({ job: updated })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to update job' }, { status: 500 })
  }
}
