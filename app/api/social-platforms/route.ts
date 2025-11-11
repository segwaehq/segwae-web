import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// GET /api/social-platforms - Get all enabled platforms (public access)
export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase configuration missing')
    }

    // Use public client (anon key) since this is public data
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Call the RPC function to get enabled platforms
    const { data, error } = await supabase.rpc('get_enabled_platforms')

    if (error) {
      console.error('Error fetching platforms:', error)
      throw error
    }

    // Set cache headers (cache for 5 minutes)
    return NextResponse.json(data || [], {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch (error) {
    console.error('Failed to fetch social platforms:', error)
    return NextResponse.json(
      { error: 'Failed to fetch social platforms' },
      { status: 500 }
    )
  }
}
