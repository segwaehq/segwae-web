'use strict'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, subject, message } = body

    // Validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Get IP address for rate limiting
    const ip = request.headers.get('x-forwarded-for') ||
                request.headers.get('x-real-ip') ||
                'unknown'

    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Check rate limit
    const { data: rateLimitAllowed, error: rateLimitError } = await supabase
      .rpc('check_contact_rate_limit', { p_ip_address: ip })

    if (rateLimitError) {
      console.error('Rate limit check error:', rateLimitError)
    }

    if (!rateLimitAllowed) {
      return NextResponse.json(
        { error: 'Too many submissions. Please try again later.' },
        { status: 429 }
      )
    }

    // Store in database
    const { data: messageData, error: dbError } = await supabase
      .from('contact_messages')
      .insert([
        {
          name,
          email,
          subject,
          message,
          ip_address: ip,
          user_agent: userAgent,
          status: 'new',
        },
      ])
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      throw new Error('Failed to save message')
    }

    // Call Supabase Edge Function to send email
    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/send-contact-email`

    const emailResponse = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({ name, email, subject, message }),
    })

    if (!emailResponse.ok) {
      console.error('Email sending failed:', await emailResponse.text())
      // Don't fail the request if email fails - message is still saved
    }

    return NextResponse.json({
      success: true,
      message: 'Your message has been sent successfully!',
    })
  } catch (error: any) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: error.message || 'Something went wrong' },
      { status: 500 }
    )
  }
}