import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { listGenerations, type GenerationKind } from '@/lib/ai/generations'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const kindParam = new URL(request.url).searchParams.get('kind')
  const kind: GenerationKind | undefined =
    kindParam === 'tailor' || kindParam === 'interview' ? kindParam : undefined

  try {
    const generations = await listGenerations(user.id, kind)
    return NextResponse.json({ generations })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to load history' },
      { status: 500 },
    )
  }
}
