'use strict'

import { NextRequest, NextResponse } from 'next/server'
import { trackLinkClick } from '@/lib/analytics'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { profileId, eventType, linkType } = body

    if (!profileId || !eventType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (eventType === 'link_click' && linkType) {
      await trackLinkClick(profileId, linkType)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Analytics tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to track analytics' },
      { status: 500 }
    )
  }
}
