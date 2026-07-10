// Dual-mode API authentication for route handlers.
//
// The web app authenticates via SSR cookies (see ./server.ts). The Segwae mobile
// app cannot send those cookies, so it sends the Supabase session JWT as a
// `Authorization: Bearer <token>` header instead. These helpers accept either:
//
//   1. If a Bearer token is present, validate it and act as that user.
//   2. Otherwise, fall back to the cookie-based server client (unchanged web behavior).
//
// This is purely additive — when no Authorization header is present, behavior is
// identical to using the cookie client directly, as the routes did before.
import { createClient as createServerClient } from '@/lib/supabase/server'
import {
  createClient as createSupabaseClient,
  type SupabaseClient,
  type User,
} from '@supabase/supabase-js'

function bearerTokenFrom(request: Request): string | null {
  const header =
    request.headers.get('authorization') ?? request.headers.get('Authorization')
  if (!header) return null
  const match = /^Bearer\s+(.+)$/i.exec(header.trim())
  const token = match?.[1]?.trim()
  return token && token.length > 0 ? token : null
}

/**
 * A Supabase client whose PostgREST requests carry the given user JWT, so its
 * reads/writes run under that user's RLS policies (same as the cookie client
 * does for the web).
 */
function tokenScopedClient(token: string): SupabaseClient {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    },
  )
}

/**
 * Returns the authenticated user for a request, accepting either a mobile Bearer
 * token or the web session cookie. Returns null if neither yields a valid user.
 */
export async function getRequestUser(request: Request): Promise<User | null> {
  const token = bearerTokenFrom(request)

  if (token) {
    const sb = tokenScopedClient(token)
    const {
      data: { user },
      error,
    } = await sb.auth.getUser(token)
    return !error && user ? user : null
  }

  // No Bearer token — fall back to the cookie-based web session (unchanged).
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user ?? null
}

export type RequestAuth = { user: User; supabase: SupabaseClient }

/**
 * Like {@link getRequestUser}, but also returns a request-scoped Supabase client
 * whose queries run under the caller's identity (RLS): the Bearer-token client
 * for mobile, or the cookie server client for the web. Use this when a route must
 * read/write RLS-protected tables as the user (e.g. applying to a job).
 *
 * For web requests (no Bearer header) this is behaviorally identical to using the
 * cookie client the routes used before.
 */
export async function getRequestAuth(request: Request): Promise<RequestAuth | null> {
  const token = bearerTokenFrom(request)

  if (token) {
    const supabase = tokenScopedClient(token)
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token)
    if (error || !user) return null
    return { user, supabase }
  }

  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  return { user, supabase };
}
