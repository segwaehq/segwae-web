import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { uploadToR2 } from '@/lib/r2'

export const dynamic = 'force-dynamic'

async function checkAdminAccess() {
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
  if (!user) return { isAdmin: false as const, error: 'Unauthorized', status: 401 }

  const { data: userData } = await supabase
    .from('users').select('is_admin').eq('id', user.id).single()

  if (!userData?.is_admin) {
    return { isAdmin: false as const, error: 'Forbidden: Admin access required', status: 403 }
  }

  return { isAdmin: true as const, user }
}

// POST /api/products/upload-image - Upload product image (Admin only)
export async function POST(request: Request) {
  try {
    const adminCheck = await checkAdminAccess()
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    const fileExt = file.name.split('.').pop()
    const key = `product-images/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const buffer = new Uint8Array(await file.arrayBuffer())
    const publicUrl = await uploadToR2(key, buffer, file.type)

    return NextResponse.json({ publicUrl })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
