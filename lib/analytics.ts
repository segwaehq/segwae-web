'use strict'

import { supabase } from './supabase'

// Track profile view
export async function trackProfileView(profileId: string) {
  try {
    await supabase.rpc('track_analytics_event', {
      p_profile_id: profileId,
      p_event_type: 'profile_view',
      p_metadata: null,
    })
  } catch (error) {
    console.error('Error tracking profile view:', error)
  }
}

// Track link click
export async function trackLinkClick(profileId: string, linkType: string) {
  try {
    await supabase.rpc('track_analytics_event', {
      p_profile_id: profileId,
      p_event_type: 'link_click',
      p_metadata: { link_type: linkType },
    })
  } catch (error) {
    console.error('Error tracking link click:', error)
  }
}