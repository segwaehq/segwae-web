import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { generatePresignedUrl, r2PublicUrl } from '@/lib/r2'

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {}
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { contentType, fileExt } = await request.json()
  if (!contentType?.startsWith('image/')) {
    return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
  }

  const key = `avatars/${user.id}/profile-${Date.now()}.${fileExt}`
  const presignedUrl = await generatePresignedUrl(key, contentType)
  const publicUrl = r2PublicUrl(key)

  return NextResponse.json({ presignedUrl, publicUrl })
}
