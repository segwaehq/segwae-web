import sanitizeHtml from 'sanitize-html'

// Clean the editor's HTML before it ever touches the database. Only writers
// reach the editor, but we sanitise anyway — defence in depth, and it keeps
// the stored markup to the small, known set the public renderer styles.
export function sanitizeBlogHtml(dirty: string): string {
  return sanitizeHtml(dirty ?? '', {
    allowedTags: [
      'p', 'h2', 'h3', 'strong', 'b', 'em', 'i', 'u', 's',
      'a', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'br', 'hr', 'img',
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      img: ['src', 'alt'],
    },
    // Absolute links must use a safe scheme; relative links (e.g. /jobs) are
    // allowed by default since they carry no scheme.
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedSchemesByTag: { img: ['http', 'https'] },
    transformTags: {
      // Force safe rel on every link.
      a: (_tagName, attribs) => ({
        tagName: 'a',
        attribs: { ...attribs, rel: 'noopener noreferrer' },
      }),
    },
  })
}
