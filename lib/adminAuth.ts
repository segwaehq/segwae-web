'use strict'

import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function checkAdminAuth() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  // Check if user is admin
  const { data: userData, error } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (error || !userData?.is_admin) {
    redirect('/admin/login?error=unauthorized')
  }

  return user
}

export function createAdminClient() {
  return createClient(supabaseUrl, supabaseServiceKey)
}