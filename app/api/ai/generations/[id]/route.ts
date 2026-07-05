import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getGeneration } from '@/lib/ai/generations'

export const runtime = 'nodejs'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  try {
    const generation = await getGeneration(user.id, id)
    if (!generation) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ generation })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to load generation' },
      { status: 500 },
    )
  }
}
