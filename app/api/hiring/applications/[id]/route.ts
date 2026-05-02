import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getJobById, getCompanyByOwner, updateApplicationStatus } from '@/lib/hiring/queries'

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
  const { status } = await request.json()

  const validStatuses = ['applied', 'under_review', 'shortlisted', 'accepted', 'rejected']
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  // Verify the caller owns the company that posted this application's job
  const supabase = await createClient()
  const { data: appRow } = await supabase
    .from('job_applications')
    .select('id, job_id')
    .eq('id', id)
    .single()

  if (!appRow) return NextResponse.json({ error: 'Application not found' }, { status: 404 })

  const job = await getJobById(appRow.job_id)
  if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

  const company = await getCompanyByOwner(user.id)
  if (!company || company.id !== job.company_id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const application = await updateApplicationStatus(id, status)
    return NextResponse.json({ application })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Update failed' }, { status: 500 })
  }
}
