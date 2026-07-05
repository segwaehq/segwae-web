import { createClient } from '@supabase/supabase-js'

/**
 * Service-role Supabase client — bypasses RLS. Server-only; never import into a
 * client component. Used by the AI entitlement/payment code (same pattern as the
 * store orders route).
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)
