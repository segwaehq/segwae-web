import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/adminAuth'
import { checkJobManagerAuth } from '@/lib/jobManagerAuth'

// PATCH /api/admin/jobs/[id] — update an admin-posted job
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await checkJobManagerAuth()
  const supabase = createAdminClient()
  const { id } = await params

  try {
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
      salary_currency,
      salary_visible,
      experience_years_min,
      tags,
      application_deadline,
      status,
    } = body

    const patch: Record<string, unknown> = {}
    if (company_name !== undefined) patch.company_name = company_name?.trim() || null
    if (title !== undefined) patch.title = title?.trim()
    if (external_url !== undefined) patch.external_url = external_url?.trim() || null
    if (job_type !== undefined) patch.job_type = job_type
    if (work_mode !== undefined) patch.work_mode = work_mode
    if (location !== undefined) patch.location = location?.trim() || null
    if (description !== undefined) patch.description = description?.trim() || ''
    if (requirements !== undefined) patch.requirements = requirements?.trim() || null
    if (salary_min !== undefined) patch.salary_min = salary_min
    if (salary_max !== undefined) patch.salary_max = salary_max
    if (salary_currency !== undefined) patch.salary_currency = salary_currency
    if (salary_visible !== undefined) patch.salary_visible = salary_visible
    if (experience_years_min !== undefined) patch.experience_years_min = experience_years_min
    if (tags !== undefined) patch.tags = Array.isArray(tags) ? tags : []
    if (application_deadline !== undefined) patch.application_deadline = application_deadline || null
    if (status !== undefined) patch.status = status

    const resolvedMin = salary_min !== undefined ? salary_min : undefined
    const resolvedMax = salary_max !== undefined ? salary_max : undefined
    if (resolvedMin != null && resolvedMax != null && Number(resolvedMin) > Number(resolvedMax)) {
      return NextResponse.json({ error: 'Minimum salary cannot be greater than maximum salary' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('jobs')
      .update(patch)
      .eq('id', id)
      .is('company_id', null)
      .select()
      .single()

    if (error) throw error
    if (!data) return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    return NextResponse.json({ job: data })
  } catch (err) {
    console.error('Error updating admin job:', err)
    const pg = err as { code?: string }
    if (pg.code === '23514') {
      return NextResponse.json({ error: 'Minimum salary cannot be greater than maximum salary' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update job' }, { status: 500 })
  }
}

// DELETE /api/admin/jobs/[id] — delete an admin-posted job
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await checkJobManagerAuth()
  const supabase = createAdminClient()
  const { id } = await params

  try {
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id)
      .is('company_id', null)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Error deleting admin job:', err)
    return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 })
  }
}
