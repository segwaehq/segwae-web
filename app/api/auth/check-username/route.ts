import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { username } = await request.json()

    if (!username || username.length < 3) {
      return NextResponse.json(
        { error: 'Username must be at least 3 characters' },
        { status: 400 }
      )
    }

    // Call the check_username_availability function
    const { data, error } = await supabase.rpc('check_username_availability', {
      check_username: username.toLowerCase(),
    })

    if (error) {
      console.error('Error checking username:', error)
      return NextResponse.json(
        { error: 'Failed to check username availability' },
        { status: 500 }
      )
    }

    return NextResponse.json({ available: data })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
