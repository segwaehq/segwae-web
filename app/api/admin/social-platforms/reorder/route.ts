import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/adminAuth'

// PATCH /api/admin/social-platforms/reorder - Bulk reorder platforms
export async function PATCH(request: Request) {
  try {
    const supabase = createAdminClient()
    const body = await request.json()

    const { platform_orders } = body

    // Validate input
    if (!Array.isArray(platform_orders) || platform_orders.length === 0) {
      return NextResponse.json(
        { error: 'platform_orders must be a non-empty array' },
        { status: 400 }
      )
    }

    // Validate each item has required fields
    for (const item of platform_orders) {
      if (!item.id || typeof item.display_order !== 'number') {
        return NextResponse.json(
          { error: 'Each item must have id and display_order fields' },
          { status: 400 }
        )
      }
    }

    // Call the database function to reorder
    const { error } = await supabase.rpc('reorder_platforms', {
      platform_orders: platform_orders,
    })

    if (error) throw error

    // Fetch updated platforms to return
    const { data: updatedPlatforms, error: fetchError } = await supabase
      .from('social_platforms')
      .select('*')
      .order('display_order', { ascending: true })

    if (fetchError) throw fetchError

    return NextResponse.json({
      success: true,
      data: updatedPlatforms
    })
  } catch (error) {
    console.error('Error reordering social platforms:', error)
    return NextResponse.json(
      { error: 'Failed to reorder social platforms' },
      { status: 500 }
    )
  }
}
