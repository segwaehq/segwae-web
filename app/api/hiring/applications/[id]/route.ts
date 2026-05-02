import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCompanyByOwner, updateApplicationStatus } from '@/lib/hiring/queries'
import { sendStatusEmail } from '@/lib/hiring/mailer'

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

  const supabase = await createClient()
  const { data: appRow } = await supabase
    .from('job_applications')
    .select(`
      id, job_id,
      users ( id, name, email ),
      jobs ( id, title, company_id, companies ( id, name ) )
    `)
    .eq('id', id)
    .single()

  if (!appRow) return NextResponse.json({ error: 'Application not found' }, { status: 404 })

  type AppRow = typeof appRow & {
    users: { id: string; name: string; email: string } | null
    jobs: { id: string; title: string; company_id: string; companies: { id: string; name: string } | null } | null
  }
  const row = appRow as AppRow

  const company = await getCompanyByOwner(user.id)
  if (!company || company.id !== row.jobs?.company_id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const application = await updateApplicationStatus(id, status)

    // Fire-and-forget: auto-email applicant for accepted/rejected decisions
    if (row.users?.email && row.jobs && row.jobs.companies) {
      sendStatusEmail({
        applicationId: id,
        status,
        applicantName: row.users.name ?? 'Applicant',
        applicantEmail: row.users.email,
        jobTitle: row.jobs.title,
        companyId: company.id,
        companyName: company.name,
        sentBy: user.id,
      }).catch((err) => console.error('[auto-email]', err))
    }

    return NextResponse.json({ application })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Update failed' }, { status: 500 })
  }
}
