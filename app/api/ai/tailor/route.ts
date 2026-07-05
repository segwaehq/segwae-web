import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { tailorResume } from '@/lib/ai/resume-tools'
import { resolveResumeInput } from '@/lib/ai/resume-input'
import { consumeTailor, refundTailor } from '@/lib/ai/entitlements'
import { saveGeneration } from '@/lib/ai/generations'

export const runtime = 'nodejs'
// Opus 4.8 + adaptive thinking can run well beyond the default serverless limit.
export const maxDuration = 300

async function getAuthedUser() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
}

export async function POST(request: Request) {
  const user = await getAuthedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const jobDescription: string = body?.jobDescription ?? ''

  if (!jobDescription.trim()) {
    return NextResponse.json({ error: 'jobDescription is required' }, { status: 400 })
  }

  let resume
  try {
    resume = await resolveResumeInput(body)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Invalid resume input' },
      { status: 400 },
    )
  }
  if (!resume.resumeText && !resume.resumePdfBase64) {
    return NextResponse.json(
      { error: 'A resume is required (text, PDF, or a saved resume)' },
      { status: 400 },
    )
  }

  // Cost guardrail: claim one Tailor generation before the (expensive) Opus call.
  let consumed: Awaited<ReturnType<typeof consumeTailor>>
  try {
    consumed = await consumeTailor(user.id)
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : 'Entitlement check failed — has the ai_entitlements migration been run?',
      },
      { status: 500 },
    )
  }
  if (!consumed.ok) {
    return NextResponse.json(
      {
        error: 'limit_reached',
        message: "You've used your free tailor. Get a job-hunt pass to keep tailoring.",
      },
      { status: 402 },
    )
  }

  try {
    const result = await tailorResume({
      jobTitle: body?.jobTitle,
      company: body?.company,
      jobDescription,
      ...resume,
    })

    // Persist the paid output so a refresh/accident never loses it. Best-effort:
    // the user already has their result, so a save failure must not fail the call.
    let savedId: string | null = null
    try {
      savedId = await saveGeneration({
        userId: user.id,
        kind: 'tailor',
        jobTitle: body?.jobTitle,
        company: body?.company,
        jobId: typeof body?.jobId === 'string' ? body.jobId : null,
        payload: result,
      })
    } catch (saveErr) {
      console.error('saveGeneration (tailor) failed:', saveErr)
    }

    return NextResponse.json({ result, savedId })
  } catch (err) {
    await refundTailor(consumed.entitlementId) // never charge for a failed generation
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to tailor resume' },
      { status: 500 },
    )
  }
}
