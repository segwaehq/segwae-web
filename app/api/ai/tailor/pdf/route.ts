import { createElement } from 'react'
import { renderToBuffer } from '@react-pdf/renderer'
import { createClient } from '@/lib/supabase/server'
import { ResumeDocument, CoverLetterDocument } from '@/lib/pdf/resume-pdf'
import type { TailoredResume } from '@/lib/ai/resume-tools'

export const runtime = 'nodejs'

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
  if (!user) return new Response('Unauthorized', { status: 401 })

  const body = await request.json().catch(() => null)
  const resume = body?.resume as TailoredResume | undefined
  const type: 'resume' | 'cover' = body?.type === 'cover' ? 'cover' : 'resume'

  if (!resume || !resume.name) {
    return new Response('A tailored resume is required', { status: 400 })
  }

  try {
    const element = (
      type === 'cover'
        ? createElement(CoverLetterDocument, { resume })
        : createElement(ResumeDocument, { resume })
    ) as Parameters<typeof renderToBuffer>[0]

    const buffer = await renderToBuffer(element)
    const filename = type === 'cover' ? 'cover-letter.pdf' : 'tailored-resume.pdf'

    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    return new Response(err instanceof Error ? err.message : 'Failed to render PDF', {
      status: 500,
    })
  }
}
