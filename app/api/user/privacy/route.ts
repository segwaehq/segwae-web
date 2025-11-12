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

    // Fetch web preferences (includes privacy settings)
    const { data: webPreferences, error: fetchError } = await supabase
      .from('user_web_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 = no rows returned
      console.error('Error fetching web preferences:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch privacy settings' },
        { status: 500 }
      )
    }

    // Return default values if no settings exist
    return NextResponse.json({
      privacySettings: webPreferences
        ? {
            show_phone: webPreferences.show_phone,
            show_email: webPreferences.show_email,
          }
        : {
            show_phone: true,
            show_email: true,
          },
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
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
    const { show_phone, show_email } = body

    // Build update object
    // const updateData: Record<string, any> = {}
    type PrivacyUpdate = Partial<{
  show_phone: boolean
  show_email: boolean
  updated_at: string
}>
const updateData: PrivacyUpdate = {}

    if (typeof show_phone === 'boolean') updateData.show_phone = show_phone
    if (typeof show_email === 'boolean') updateData.show_email = show_email

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    // Add updated_at timestamp
    updateData.updated_at = new Date().toISOString()

    // Check if web preferences exist
    const { data: existingPrefs } = await supabase
      .from('user_web_preferences')
      .select('id')
      .eq('user_id', user.id)
      .single()

    let result

    if (existingPrefs) {
      // Update existing preferences
      const { data, error } = await supabase
        .from('user_web_preferences')
        .update(updateData)
        .eq('user_id', user.id)
        .select()
        .single()

      result = { data, error }
    } else {
      // Create new preferences with defaults
      const { data, error } = await supabase
        .from('user_web_preferences')
        .insert({
          user_id: user.id,
          background_color: '#FFFFFF',
          text_color: '#222222',
          show_phone: show_phone ?? true,
          show_email: show_email ?? true,
          show_portfolio: true,
          show_resume: true,
          show_profile_video: true,
        })
        .select()
        .single()

      result = { data, error }
    }

    if (result.error) {
      console.error('Error updating privacy settings:', result.error)
      return NextResponse.json(
        { error: 'Failed to update privacy settings' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      privacySettings: {
        show_phone: result.data.show_phone,
        show_email: result.data.show_email,
      },
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
