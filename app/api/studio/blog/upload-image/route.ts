import { NextResponse } from 'next/server'
import { checkWriterApiAuth } from '@/lib/writerAuth'
import { uploadToR2 } from '@/lib/r2'

export const dynamic = 'force-dynamic'

// POST /api/studio/blog/upload-image — cover + in-article images (writers only).
export async function POST(request: Request) {
  const auth = await checkWriterApiAuth()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    const fileExt = file.name.split('.').pop()
    const key = `blog-images/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const buffer = new Uint8Array(await file.arrayBuffer())
    const publicUrl = await uploadToR2(key, buffer, file.type)

    return NextResponse.json({ publicUrl })
  } catch (error) {
    console.error('Blog image upload failed:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
