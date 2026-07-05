/**
 * Resolves a resume from a request body into something the AI layer accepts:
 * raw pasted text, an uploaded PDF (base64), or a stored resume file URL that we
 * fetch server-side and base64-encode. Server-only (uses fetch + Buffer).
 */

export type ResolvedResume = { resumeText?: string; resumePdfBase64?: string }

const MAX_PDF_BYTES = 8 * 1024 * 1024 // 8 MB — resumes are tiny; this is just a guard

export async function resolveResumeInput(body: unknown): Promise<ResolvedResume> {
  const b = (body ?? {}) as Record<string, unknown>

  if (typeof b.resumePdfBase64 === 'string' && b.resumePdfBase64.trim()) {
    return { resumePdfBase64: b.resumePdfBase64 }
  }
  if (typeof b.resumeFileUrl === 'string' && b.resumeFileUrl.trim()) {
    return { resumePdfBase64: await fetchPdfAsBase64(b.resumeFileUrl) }
  }
  if (typeof b.resumeText === 'string' && b.resumeText.trim()) {
    return { resumeText: b.resumeText }
  }
  return {}
}

async function fetchPdfAsBase64(url: string): Promise<string> {
  let res: Response
  try {
    res = await fetch(url)
  } catch {
    throw new Error('Could not reach the stored resume file')
  }
  if (!res.ok) throw new Error('Could not fetch the stored resume file')

  const contentType = res.headers.get('content-type') ?? ''
  const looksPdf =
    contentType.includes('pdf') ||
    contentType.includes('octet-stream') ||
    /\.pdf(\?|$)/i.test(url)
  if (!looksPdf) throw new Error('Stored resume must be a PDF to use this tool')

  const buf = Buffer.from(await res.arrayBuffer())
  if (buf.byteLength > MAX_PDF_BYTES) throw new Error('Resume file is too large (max 8 MB)')
  return buf.toString('base64')
}
