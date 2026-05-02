import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getJobById, getApplicationsForJob, getCompanyByOwner, bulkUpdateApplicationStatus } from '@/lib/hiring/queries'

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
  const user = await getAuthedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: jobId } = await params

  const job = await getJobById(jobId)
  if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

  const company = await getCompanyByOwner(user.id)
  if (!company || company.id !== job.company_id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const applications = await getApplicationsForJob(jobId)
  return NextResponse.json({ applications })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: jobId } = await params
  const { application_ids, status } = await request.json()

  if (!Array.isArray(application_ids) || application_ids.length === 0) {
    return NextResponse.json({ error: 'application_ids required' }, { status: 400 })
  }

  const validStatuses = ['applied', 'under_review', 'shortlisted', 'accepted', 'rejected']
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const job = await getJobById(jobId)
  if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

  const company = await getCompanyByOwner(user.id)
  if (!company || company.id !== job.company_id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    await bulkUpdateApplicationStatus(application_ids, status)
    return NextResponse.json({ updated: application_ids.length })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Bulk update failed' }, { status: 500 })
  }
}
