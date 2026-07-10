import { createClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Company, Job, JobApplication, Resume, EmailTemplate, InterviewSchedule } from '@/lib/types'

// Routes that authenticate a mobile Bearer token pass a request-scoped client so
// these queries run under the caller's RLS. Web callers omit it and get the
// cookie-based server client, exactly as before.

// ─── Company ──────────────────────────────────────────────────────────────────

export async function getCompanyByOwner(ownerId: string): Promise<Company | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('companies')
    .select('*')
    .eq('owner_id', ownerId)
    .single()
  return data ?? null
}

export async function createCompany(
  ownerId: string,
  payload: Pick<Company, 'name'> & Partial<Omit<Company, 'id' | 'owner_id' | 'is_verified' | 'created_at' | 'updated_at'>>
): Promise<Company> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('companies')
    .insert({ ...payload, owner_id: ownerId })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function updateCompany(
  companyId: string,
  payload: Partial<Omit<Company, 'id' | 'owner_id' | 'is_verified' | 'created_at' | 'updated_at'>>
): Promise<Company> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('companies')
    .update(payload)
    .eq('id', companyId)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

// ─── Jobs ─────────────────────────────────────────────────────────────────────

const JOBS_PAGE_SIZE = 20

export async function getActiveJobs(filters?: {
  search?: string
  job_type?: string
  work_mode?: string
  page?: number
}): Promise<{ jobs: Job[]; total: number }> {
  const supabase = await createClient()
  const page = Math.max(1, filters?.page ?? 1)
  const from = (page - 1) * JOBS_PAGE_SIZE
  const to = from + JOBS_PAGE_SIZE - 1

  let query = supabase
    .from('jobs')
    .select(`
      *,
      companies ( id, name, logo_url, location ),
      job_applications ( count )
    `, { count: 'exact' })
    .eq('status', 'active')
    .or(`application_deadline.is.null,application_deadline.gt.${new Date().toISOString()}`)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (filters?.job_type) query = query.eq('job_type', filters.job_type)
  if (filters?.work_mode) query = query.eq('work_mode', filters.work_mode)
  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }

  const { data, error, count } = await query
  if (error) throw new Error(error.message)

  type RawRow = Omit<Job, 'application_count'> & { job_applications?: { count: number }[]; companies?: Job['companies'] }
  const jobs = (data ?? []).map((row: RawRow): Job => {
    const { job_applications, ...rest } = row
    return { ...rest, application_count: job_applications?.[0]?.count ?? 0 }
  })

  return { jobs, total: count ?? 0 }
}

export async function getJobsByCompany(companyId: string): Promise<Job[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      companies ( id, name, logo_url ),
      job_applications ( count )
    `)
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)

  type RawRow = Omit<Job, 'application_count'> & { job_applications?: { count: number }[]; companies?: Job['companies'] }
  return (data ?? []).map((row: RawRow): Job => {
    const { job_applications, ...rest } = row
    return { ...rest, application_count: job_applications?.[0]?.count ?? 0 }
  })
}

export async function getJobById(jobId: string, client?: SupabaseClient): Promise<Job | null> {
  const supabase = client ?? await createClient()
  const { data } = await supabase
    .from('jobs')
    .select(`
      *,
      companies ( * ),
      job_applications ( count )
    `)
    .eq('id', jobId)
    .single()
  if (!data) return null

  type RawRow = Omit<Job, 'application_count'> & { job_applications?: { count: number }[]; companies?: Job['companies'] }
  const { job_applications, ...rest } = data as RawRow
  return { ...rest, application_count: job_applications?.[0]?.count ?? 0 }
}

export async function createJob(
  companyId: string,
  postedBy: string,
  payload: Omit<Job, 'id' | 'company_id' | 'posted_by' | 'created_at' | 'updated_at' | 'companies' | 'application_count'>
): Promise<Job> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('jobs')
    .insert({ ...payload, company_id: companyId, posted_by: postedBy })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function updateJob(
  jobId: string,
  payload: Partial<Omit<Job, 'id' | 'company_id' | 'posted_by' | 'created_at' | 'updated_at' | 'companies' | 'application_count'>>
): Promise<Job> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('jobs')
    .update(payload)
    .eq('id', jobId)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

// ─── Applications ─────────────────────────────────────────────────────────────

export async function getApplicationsForJob(jobId: string): Promise<JobApplication[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('job_applications')
    .select(`
      *,
      users (
        id, name, title, bio, profile_image_url, email, phone,
        years_experience, portfolio_or_website_link,
        open_to_work, job_seeking_status
      ),
      interview_schedules (*)
    `)
    .eq('job_id', jobId)
    .order('applied_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getMyApplications(userId: string, client?: SupabaseClient): Promise<JobApplication[]> {
  const supabase = client ?? await createClient()
  const { data, error } = await supabase
    .from('job_applications')
    .select(`
      *,
      jobs (
        id, title, company_id,
        companies ( id, name, logo_url )
      ),
      interview_schedules (*)
    `)
    .eq('applicant_id', userId)
    .order('applied_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getTodayApplicationCount(userId: string, client?: SupabaseClient): Promise<number> {
  const supabase = client ?? await createClient()
  const { data, error } = await supabase.rpc('get_today_application_count', {
    p_user_id: userId,
  })
  if (error) throw new Error(error.message)
  return data ?? 0
}

export async function getTotalApplicationCount(userId: string, client?: SupabaseClient): Promise<number> {
  const supabase = client ?? await createClient()
  const { count, error } = await supabase
    .from('job_applications')
    .select('*', { count: 'exact', head: true })
    .eq('applicant_id', userId)
  if (error) throw new Error(error.message)
  return count ?? 0
}

export async function getExistingApplication(
  jobId: string,
  userId: string,
  client?: SupabaseClient
): Promise<{ id: string; status: string } | null> {
  const supabase = client ?? await createClient()
  const { data } = await supabase
    .from('job_applications')
    .select('id, status')
    .eq('job_id', jobId)
    .eq('applicant_id', userId)
    .single()
  return data ?? null
}

export async function createApplication(payload: {
  job_id: string
  applicant_id: string
  cover_note: string | null
  resume_url: string | null
  ad_watched: boolean
}, client?: SupabaseClient): Promise<JobApplication> {
  const supabase = client ?? await createClient()
  const { data, error } = await supabase
    .from('job_applications')
    .insert(payload)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function updateApplicationStatus(
  applicationId: string,
  status: JobApplication['status']
): Promise<JobApplication> {
  const supabase = await createClient()
  const now = new Date().toISOString()
  const patch: Record<string, unknown> = { status }

  if (status !== 'applied') patch.reviewed_at = now
  if (status === 'accepted' || status === 'rejected') patch.decided_at = now

  const { data, error } = await supabase
    .from('job_applications')
    .update(patch)
    .eq('id', applicationId)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function bulkUpdateApplicationStatus(
  applicationIds: string[],
  status: JobApplication['status']
): Promise<void> {
  const supabase = await createClient()
  const now = new Date().toISOString()
  const patch: Record<string, unknown> = { status }

  if (status !== 'applied') patch.reviewed_at = now
  if (status === 'accepted' || status === 'rejected') patch.decided_at = now

  const { error } = await supabase
    .from('job_applications')
    .update(patch)
    .in('id', applicationIds)
  if (error) throw new Error(error.message)
}

// ─── Resumes ──────────────────────────────────────────────────────────────────

export async function getResumes(userId: string, client?: SupabaseClient): Promise<Resume[]> {
  const supabase = client ?? await createClient()
  const { data, error } = await supabase
    .from('resumes')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createResume(payload: {
  user_id: string
  label: string
  file_url: string
  is_default: boolean
}): Promise<Resume> {
  const supabase = await createClient()

  if (payload.is_default) {
    await supabase
      .from('resumes')
      .update({ is_default: false })
      .eq('user_id', payload.user_id)
  }

  const { data, error } = await supabase
    .from('resumes')
    .insert(payload)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function updateResume(
  resumeId: string,
  userId: string,
  payload: { label?: string; is_default?: boolean }
): Promise<Resume> {
  const supabase = await createClient()

  if (payload.is_default) {
    await supabase
      .from('resumes')
      .update({ is_default: false })
      .eq('user_id', userId)
  }

  const { data, error } = await supabase
    .from('resumes')
    .update(payload)
    .eq('id', resumeId)
    .eq('user_id', userId)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function deleteResume(resumeId: string, userId: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('resumes')
    .delete()
    .eq('id', resumeId)
    .eq('user_id', userId)
  if (error) throw new Error(error.message)
}

// ─── Email Templates ──────────────────────────────────────────────────────────

export async function getTemplatesByCompany(companyId: string): Promise<EmailTemplate[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('email_templates')
    .select('*')
    .eq('company_id', companyId)
    .order('type')
    .order('is_default', { ascending: false })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getTemplateById(templateId: string): Promise<EmailTemplate | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('email_templates')
    .select('*')
    .eq('id', templateId)
    .single()
  return data ?? null
}

export async function createTemplate(
  companyId: string,
  payload: Pick<EmailTemplate, 'type' | 'label' | 'subject' | 'body' | 'is_default'>
): Promise<EmailTemplate> {
  const supabase = await createClient()

  if (payload.is_default) {
    await supabase
      .from('email_templates')
      .update({ is_default: false })
      .eq('company_id', companyId)
      .eq('type', payload.type)
  }

  const { data, error } = await supabase
    .from('email_templates')
    .insert({ ...payload, company_id: companyId })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function updateTemplate(
  templateId: string,
  companyId: string,
  payload: Partial<Pick<EmailTemplate, 'label' | 'subject' | 'body' | 'is_default'>>
): Promise<EmailTemplate> {
  const supabase = await createClient()

  if (payload.is_default) {
    const { data: existing } = await supabase
      .from('email_templates')
      .select('type')
      .eq('id', templateId)
      .single()
    if (existing) {
      await supabase
        .from('email_templates')
        .update({ is_default: false })
        .eq('company_id', companyId)
        .eq('type', existing.type)
    }
  }

  const { data, error } = await supabase
    .from('email_templates')
    .update(payload)
    .eq('id', templateId)
    .eq('company_id', companyId)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function deleteTemplate(templateId: string, companyId: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('email_templates')
    .delete()
    .eq('id', templateId)
    .eq('company_id', companyId)
  if (error) throw new Error(error.message)
}

// ─── Interview Schedules ──────────────────────────────────────────────────────

export async function createInterview(payload: {
  application_id: string
  scheduled_by: string
  scheduled_at: string
  duration_minutes: number
  meet_link: string
  notes?: string | null
}): Promise<InterviewSchedule> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('interview_schedules')
    .insert({ ...payload, status: 'scheduled' })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function updateInterview(
  interviewId: string,
  payload: Partial<Pick<InterviewSchedule, 'scheduled_at' | 'duration_minutes' | 'meet_link' | 'notes' | 'status'>>
): Promise<InterviewSchedule> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('interview_schedules')
    .update(payload)
    .eq('id', interviewId)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

// ─── Application Email Log ────────────────────────────────────────────────────

export async function logApplicationEmail(payload: {
  application_id: string
  template_id: string | null
  sent_by: string
  recipient_email: string
  subject: string
  body: string
}): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from('application_emails').insert(payload)
  if (error) throw new Error(error.message)
}
