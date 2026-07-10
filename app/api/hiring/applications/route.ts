import { NextResponse } from 'next/server'
import { getRequestAuth } from '@/lib/supabase/api-auth'
import {
  getMyApplications,
  getTodayApplicationCount,
  getTotalApplicationCount,
  getExistingApplication,
  getJobById,
  getResumes,
  createApplication,
} from '@/lib/hiring/queries'

export async function GET(request: Request) {
  const auth = await getRequestAuth(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { user, supabase } = auth

  const { searchParams } = new URL(request.url)

  if (searchParams.get('today_count') === 'true') {
    const [count, total_count] = await Promise.all([
      getTodayApplicationCount(user.id, supabase),
      getTotalApplicationCount(user.id, supabase),
    ])
    return NextResponse.json({ count, total_count })
  }

  const checkJobId = searchParams.get('check_job_id')
  if (checkJobId) {
    const application = await getExistingApplication(checkJobId, user.id, supabase)
    return NextResponse.json({ application })
  }

  const applications = await getMyApplications(user.id, supabase)
  return NextResponse.json({ applications })
}

export async function POST(request: Request) {
  const auth = await getRequestAuth(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { user, supabase } = auth

  const body = await request.json()
  const { job_id, cover_note, resume_id, ad_watched } = body

  if (!job_id) return NextResponse.json({ error: 'job_id is required' }, { status: 400 })

  // Verify job exists and is accepting applications
  const job = await getJobById(job_id, supabase)
  if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  if (job.status !== 'active') return NextResponse.json({ error: 'Job is not accepting applications' }, { status: 400 })
  if (job.application_deadline && new Date(job.application_deadline) < new Date()) {
    return NextResponse.json({ error: 'Application deadline has passed' }, { status: 400 })
  }
  if (job.posting_mode !== 'internal') return NextResponse.json({ error: 'Cannot apply to external jobs through Segwae' }, { status: 400 })

  // Block duplicate applications
  const existing = await getExistingApplication(job_id, user.id, supabase)
  if (existing) return NextResponse.json({ error: 'Already applied to this job' }, { status: 409 })

  // Resolve resume URL — block if no resumes
  const resumes = await getResumes(user.id, supabase)
  if (resumes.length === 0) {
    return NextResponse.json({ error: 'no_resumes', message: 'Please add a resume before applying' }, { status: 422 })
  }

  let resume_url: string | null = null
  if (resume_id) {
    const selected = resumes.find((r) => r.id === resume_id)
    resume_url = selected?.file_url ?? null
  } else {
    const defaultResume = resumes.find((r) => r.is_default) ?? resumes[0]
    resume_url = defaultResume.file_url
  }

  // Server-side ad gate: verify the client's claim about ad_watched
  // Count is fetched before insert so N = count + 1
  const todayCount = await getTodayApplicationCount(user.id, supabase)
  const submissionNumber = todayCount + 1
  const adRequired = submissionNumber % 2 === 0

  try {
    const application = await createApplication({
      job_id,
      applicant_id: user.id,
      cover_note: cover_note || null,
      resume_url,
      ad_watched: adRequired ? (ad_watched === true) : false,
    }, supabase)

    const newCount = todayCount + 1
    return NextResponse.json({ application, today_count: newCount, ad_required_next: (newCount + 1) % 2 === 0 }, { status: 201 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to submit application'
    if (msg.includes('unique') || msg.includes('duplicate')) {
      return NextResponse.json({ error: 'Already applied to this job' }, { status: 409 })
    }
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
