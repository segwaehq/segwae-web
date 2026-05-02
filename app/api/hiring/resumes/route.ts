import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getResumes, createResume } from '@/lib/hiring/queries'

async function getAuthedUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
}

export async function GET() {
  const user = await getAuthedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const resumes = await getResumes(user.id)
  return NextResponse.json({ resumes })
}

export async function POST(request: Request) {
  const user = await getAuthedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { label, file_url, is_default } = body

  if (!label?.trim()) return NextResponse.json({ error: 'Label is required' }, { status: 400 })
  if (!file_url?.trim()) return NextResponse.json({ error: 'file_url is required' }, { status: 400 })

  try {
    const resume = await createResume({
      user_id: user.id,
      label,
      file_url,
      is_default: is_default ?? false,
    })
    return NextResponse.json({ resume }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to add resume' }, { status: 500 })
  }
}
