import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getActiveJobs,
  getJobsByCompany,
  getCompanyByOwner,
  createJob,
} from '@/lib/hiring/queries'

async function getAuthedUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('mode')

  if (mode === 'hr') {
    const user = await getAuthedUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const company = await getCompanyByOwner(user.id)
    if (!company) return NextResponse.json({ jobs: [] })

    const jobs = await getJobsByCompany(company.id)
    return NextResponse.json({ jobs })
  }

  const search = searchParams.get('search') ?? undefined
  const job_type = searchParams.get('job_type') ?? undefined
  const work_mode = searchParams.get('work_mode') ?? undefined

  const jobs = await getActiveJobs({ search, job_type, work_mode })
  return NextResponse.json({ jobs })
}

export async function POST(request: Request) {
  const user = await getAuthedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const company = await getCompanyByOwner(user.id)
  if (!company) return NextResponse.json({ error: 'Company not found. Complete setup first.' }, { status: 403 })

  const body = await request.json()
  const {
    title, description, requirements, location, job_type, work_mode,
    posting_mode, external_url, status, salary_min, salary_max,
    salary_currency, salary_visible, experience_years_min, tags, application_deadline,
  } = body

  if (!title?.trim()) return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  if (!description?.trim()) return NextResponse.json({ error: 'Description is required' }, { status: 400 })
  if (posting_mode === 'external' && !external_url?.trim()) {
    return NextResponse.json({ error: 'Application URL is required for external postings' }, { status: 400 })
  }

  try {
    const job = await createJob(company.id, user.id, {
      title, description,
      company_name: null,
      requirements: requirements || null,
      location: location || null,
      job_type,
      work_mode,
      posting_mode: posting_mode ?? 'internal',
      external_url: posting_mode === 'external' ? external_url : null,
      status: status ?? 'draft',
      salary_min: salary_min ?? null,
      salary_max: salary_max ?? null,
      salary_currency: salary_currency ?? 'NGN',
      salary_visible: salary_visible ?? true,
      experience_years_min: experience_years_min ?? 0,
      tags: tags ?? [],
      application_deadline: application_deadline || null,
    })
    return NextResponse.json({ job }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to create job' }, { status: 500 })
  }
}
