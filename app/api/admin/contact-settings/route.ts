import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/adminAuth'

export async function POST(request: Request) {
  try {
    const supabase = createAdminClient()
    const body = await request.json()

    const { whatsapp_number, instagram_handle } = body

    // Validate WhatsApp number format
    const whatsappRegex = /^[1-9][0-9]{9,14}$/
    if (!whatsappRegex.test(whatsapp_number)) {
      return NextResponse.json(
        { error: 'Invalid WhatsApp number format' },
        { status: 400 }
      )
    }

    // Validate Instagram handle
    if (!instagram_handle || instagram_handle.trim().length === 0) {
      return NextResponse.json(
        { error: 'Instagram handle cannot be empty' },
        { status: 400 }
      )
    }

    // Check if settings exist
    const { data: existing } = await supabase
      .from('contact_settings')
      .select('id')
      .single()

    if (existing) {
      // Update existing settings
      const { error } = await supabase
        .from('contact_settings')
        .update({
          whatsapp_number,
          instagram_handle,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)

      if (error) throw error
    } else {
      // Insert new settings
      const { error } = await supabase.from('contact_settings').insert({
        whatsapp_number,
        instagram_handle,
      })

      if (error) throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating contact settings:', error)
    return NextResponse.json(
      { error: 'Failed to update contact settings' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('contact_settings')
      .select('*')
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "not found" error
      throw error
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching contact settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contact settings' },
      { status: 500 }
    )
  }
}
