import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/adminAuth'

// GET /api/admin/social-platforms/[id] - Get single platform
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createAdminClient()
    const { id } = await params

    const { data, error } = await supabase
      .from('social_platforms')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Platform not found' },
          { status: 404 }
        )
      }
      throw error
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching social platform:', error)
    return NextResponse.json(
      { error: 'Failed to fetch social platform' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/social-platforms/[id] - Update platform
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createAdminClient()
    const { id } = await params
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

    // Build update object with only provided fields
    const updates: Partial<{
      platform_name: string
      platform_identifier: string
      icon_identifier: string
      color_hex: string
      display_order: number
      is_enabled: boolean
      url_pattern: string | null
    }> = {}

    if (platform_name !== undefined) updates.platform_name = platform_name
    if (platform_identifier !== undefined) {
      // Validate identifier format
      const identifierRegex = /^[a-z0-9_]+$/
      if (!identifierRegex.test(platform_identifier)) {
        return NextResponse.json(
          { error: 'Invalid platform identifier. Use lowercase letters, numbers, and underscores only' },
          { status: 400 }
        )
      }

      // Check if identifier is unique (excluding current platform)
      const { data: existing } = await supabase
        .from('social_platforms')
        .select('id')
        .eq('platform_identifier', platform_identifier)
        .neq('id', id)
        .single()

      if (existing) {
        return NextResponse.json(
          { error: 'Platform identifier already exists' },
          { status: 409 }
        )
      }

      updates.platform_identifier = platform_identifier
    }
    if (icon_identifier !== undefined) updates.icon_identifier = icon_identifier
    if (color_hex !== undefined) {
      // Validate hex color format
      const hexRegex = /^#[0-9A-Fa-f]{6}$/
      if (!hexRegex.test(color_hex)) {
        return NextResponse.json(
          { error: 'Invalid color hex format. Must be #RRGGBB' },
          { status: 400 }
        )
      }
      updates.color_hex = color_hex.toUpperCase()
    }
    if (display_order !== undefined) updates.display_order = display_order
    if (is_enabled !== undefined) updates.is_enabled = is_enabled
    if (url_pattern !== undefined) updates.url_pattern = url_pattern || null

    // Check if there are any updates
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      )
    }

    // Update platform
    const { data, error } = await supabase
      .from('social_platforms')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Platform not found' },
          { status: 404 }
        )
      }
      throw error
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error updating social platform:', error)
    return NextResponse.json(
      { error: 'Failed to update social platform' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/social-platforms/[id] - Delete platform
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createAdminClient()
    const { id } = await params

    // Check if platform exists
    const { data: existing } = await supabase
      .from('social_platforms')
      .select('platform_identifier')
      .eq('id', id)
      .single()

    if (!existing) {
      return NextResponse.json(
        { error: 'Platform not found' },
        { status: 404 }
      )
    }

    // Optional: Check if platform is being used in social_links table
    const { data: usageCheck } = await supabase
      .from('social_links')
      .select('id')
      .eq('platform', existing.platform_identifier)
      .limit(1)

    if (usageCheck && usageCheck.length > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete platform that is currently in use by user profiles',
          suggestion: 'Consider disabling the platform instead'
        },
        { status: 409 }
      )
    }

    // Delete platform
    const { error } = await supabase
      .from('social_platforms')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting social platform:', error)
    return NextResponse.json(
      { error: 'Failed to delete social platform' },
      { status: 500 }
    )
  }
}
