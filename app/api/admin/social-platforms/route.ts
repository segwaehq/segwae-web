import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/adminAuth'

// GET /api/admin/social-platforms - Get all platforms
export async function GET() {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('social_platforms')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching social platforms:', error)
    return NextResponse.json(
      { error: 'Failed to fetch social platforms' },
      { status: 500 }
    )
  }
}

// POST /api/admin/social-platforms - Create new platform
export async function POST(request: Request) {
  try {
    const supabase = createAdminClient()
    const body = await request.json()

    const {
      platform_name,
      platform_identifier,
      icon_identifier,
      color_hex,
      display_order,
      is_enabled,
      url_pattern,
    } = body

    // Validate required fields
    if (!platform_name || !platform_identifier || !icon_identifier || !color_hex) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate hex color format
    const hexRegex = /^#[0-9A-Fa-f]{6}$/
    if (!hexRegex.test(color_hex)) {
      return NextResponse.json(
        { error: 'Invalid color hex format. Must be #RRGGBB' },
        { status: 400 }
      )
    }

    // Validate platform identifier format (lowercase, alphanumeric + underscore)
    const identifierRegex = /^[a-z0-9_]+$/
    if (!identifierRegex.test(platform_identifier)) {
      return NextResponse.json(
        { error: 'Invalid platform identifier. Use lowercase letters, numbers, and underscores only' },
        { status: 400 }
      )
    }

    // Check if identifier already exists
    const { data: existing } = await supabase
      .from('social_platforms')
      .select('id')
      .eq('platform_identifier', platform_identifier)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Platform identifier already exists' },
        { status: 409 }
      )
    }

    // Insert new platform
    const { data, error } = await supabase
      .from('social_platforms')
      .insert({
        platform_name,
        platform_identifier,
        icon_identifier,
        color_hex: color_hex.toUpperCase(),
        display_order: display_order || 999, // Default to end
        is_enabled: is_enabled !== undefined ? is_enabled : true,
        url_pattern: url_pattern || null,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Error creating social platform:', error)
    return NextResponse.json(
      { error: 'Failed to create social platform' },
      { status: 500 }
    )
  }
}
