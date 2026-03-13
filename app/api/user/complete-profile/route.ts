import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
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

    // Call the Supabase RPC function to update profile completion
    const { data: completion, error: rpcError } = await supabase.rpc(
      'update_my_profile_completion'
    )

    if (rpcError) {
      console.error('RPC error:', rpcError)
      // Fallback to manual calculation if RPC fails
      return await manuallyUpdateCompletion(supabase, user.id)
    }

    // The RPC returns an array, get the first result
    const result = Array.isArray(completion) ? completion[0] : completion
    const isComplete = result?.is_complete ?? false

    console.log('Profile completion result:', result)

    if (!isComplete) {
      return NextResponse.json(
        {
          error: 'Profile not yet complete. Please fill in all required fields.',
          completion: {
            percent: result?.percent ?? 0,
            is_complete: isComplete,
            breakdown: result?.details ?? {}
          }
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      completion: result
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Fallback function if RPC is not available
async function manuallyUpdateCompletion(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
) {
  try {
    // Fetch user profile and social links
    const { data: profile } = await supabase
      .from('users')
      .select('name, email, phone, bio, title, profile_image_url, portfolio_or_website_link')
      .eq('id', userId)
      .single()

    const { data: socialLinks } = await supabase
      .from('social_links')
      .select('id')
      .eq('user_id', userId)

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Calculate completion (same logic as mobile app)
    let completedFields = 0
    const totalFields = 8
    const breakdown: Record<string, boolean> = {}

    breakdown.name = !!profile.name
    if (breakdown.name) completedFields++

    breakdown.email = !!profile.email
    if (breakdown.email) completedFields++

    breakdown.phone = !!profile.phone
    if (breakdown.phone) completedFields++

    breakdown.bio = !!(profile.bio && profile.bio.length >= 50)
    if (breakdown.bio) completedFields++

    breakdown.title = !!profile.title
    if (breakdown.title) completedFields++

    breakdown.profile_image = !!profile.profile_image_url
    if (breakdown.profile_image) completedFields++

    breakdown.social_links = !!(socialLinks && socialLinks.length >= 3)
    if (breakdown.social_links) completedFields++

    breakdown.portfolio = !!profile.portfolio_or_website_link
    if (breakdown.portfolio) completedFields++

    const percentage = (completedFields / totalFields) * 100
    const isComplete = percentage >= 80

    console.log('Manual completion check:', { completedFields, totalFields, percentage, isComplete, breakdown })

    // Update the user's profile completion status
    const { error: updateError } = await supabase
      .from('users')
      .update({
        is_profile_complete: isComplete,
        profile_completion_percentage: percentage,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update profile completion' },
        { status: 500 }
      )
    }

    if (!isComplete) {
      return NextResponse.json(
        {
          error: 'Profile not yet complete. Please fill in all required fields.',
          completion: { percent: percentage, is_complete: isComplete, breakdown }
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      completion: { percent: percentage, is_complete: isComplete }
    })
  } catch (error) {
    console.error('Manual completion error:', error)
    return NextResponse.json(
      { error: 'Failed to calculate profile completion' },
      { status: 500 }
    )
  }
}
