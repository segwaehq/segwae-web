import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch social links
    const { data: socialLinks, error: fetchError } = await supabase
      .from('social_links')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (fetchError) {
      console.error('Error fetching social links:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch social links' },
        { status: 500 }
      )
    }

    return NextResponse.json({ socialLinks: socialLinks || [] })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { platform, url } = body

    // Validate required fields
    if (!platform || !url) {
      return NextResponse.json(
        { error: 'Platform and URL are required' },
        { status: 400 }
      )
    }

    // Create new social link
    const { data: newLink, error: createError } = await supabase
      .from('social_links')
      .insert({
        user_id: user.id,
        platform,
        url,
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating social link:', createError)
      return NextResponse.json(
        { error: 'Failed to create social link' },
        { status: 500 }
      )
    }

    return NextResponse.json({ socialLink: newLink }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
