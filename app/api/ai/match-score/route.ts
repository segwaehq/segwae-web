import { NextResponse } from 'next/server'
import { getRequestUser } from '@/lib/supabase/api-auth'
import { getMatchScore } from '@/lib/ai/resume-tools'
import { resolveResumeInput } from '@/lib/ai/resume-input'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: Request) {
  const user = await getRequestUser(request)
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

  try {
    const result = await getMatchScore({
      jobTitle: body?.jobTitle,
      company: body?.company,
      jobDescription,
      ...resume,
    })
    return NextResponse.json({ result })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to score match' },
      { status: 500 },
    )
  }
}
