import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params

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

    // Build update object
    // const updateData: Record<string, any> = {}
    type SocialLinkUpdate = Partial<{
  platform: string
  url: string
}>
const updateData: SocialLinkUpdate = {}

    if (platform) updateData.platform = platform
    if (url) updateData.url = url

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    // Update social link (only if it belongs to the user)
    const { data: updatedLink, error: updateError } = await supabase
      .from('social_links')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating social link:', updateError)
      return NextResponse.json(
        { error: 'Failed to update social link' },
        { status: 500 }
      )
    }

    if (!updatedLink) {
      return NextResponse.json(
        { error: 'Social link not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ socialLink: updatedLink })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete social link (only if it belongs to the user)
    const { error: deleteError } = await supabase
      .from('social_links')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Error deleting social link:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete social link' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Social link deleted successfully' })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
