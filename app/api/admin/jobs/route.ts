import { NextResponse } from 'next/server'
import { checkAdminAuth, createAdminClient } from '@/lib/adminAuth'

// GET /api/admin/jobs — list all admin-posted external jobs (company_id IS NULL)
export async function GET() {
  try {
    const user = await checkAdminAuth()
    void user
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .is('company_id', null)
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ jobs: data ?? [] })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
  }
}

// POST /api/admin/jobs — create a new admin-posted external job
export async function POST(request: Request) {
  try {
    const user = await checkAdminAuth()
    const supabase = createAdminClient()
    const body = await request.json()

    const {
      company_name,
      title,
      external_url,
      job_type,
      work_mode,
      location,
      description,
      requirements,
      salary_min,
      salary_max,
      salary_visible,
      experience_years_min,
      tags,
      application_deadline,
      status,
    } = body

    if (!company_name?.trim()) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 })
    }
    if (!title?.trim()) {
      return NextResponse.json({ error: 'Job title is required' }, { status: 400 })
    }
    if (!external_url?.trim()) {
      return NextResponse.json({ error: 'External URL is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('jobs')
      .insert({
        company_id: null,
        company_name: company_name.trim(),
        posted_by: user.id,
        title: title.trim(),
        posting_mode: 'external',
        external_url: external_url.trim(),
        job_type: job_type ?? 'full_time',
        work_mode: work_mode ?? 'onsite',
        location: location?.trim() || null,
        description: description?.trim() || '',
        requirements: requirements?.trim() || null,
        salary_min: salary_min ?? null,
        salary_max: salary_max ?? null,
        salary_visible: salary_visible ?? false,
        experience_years_min: experience_years_min ?? 0,
        tags: Array.isArray(tags) ? tags : [],
        application_deadline: application_deadline || null,
        status: status ?? 'active',
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ job: data }, { status: 201 })
  } catch (err) {
    console.error('Error creating admin job:', err)
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 })
  }
}
