import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types
export interface UserProfile {
  id: string
  name: string
  title: string
  email: string
  phone: string
  bio: string
  portfolio_or_website_link: string
  profile_image_url: string | null
  cover_image_url: string | null
  resume_file_url: string | null
  profile_video_url: string | null
  profile_video_thumbnail_url: string | null
  social_links: SocialLink[]
  subscription_tier: 'free' | 'premium'
  username: string
  custom_username: string | null
  // connection_count: number
  privacy_settings: PrivacySettings
  user_web_preferences: WebPreferences | null
  created_at: string
  updated_at: string
}

export interface SocialLink {
  id: string
  user_id: string
  platform: string
  url: string
  is_enabled: boolean
}

export interface PrivacySettings {
  show_phone: boolean
  show_email: boolean
  show_resume: boolean
  show_social_links: boolean
  show_portfolio: boolean
  show_profile_video: boolean
}

export interface WebPreferences {
  user_id: string
  background_color: string
  text_color: string
  show_phone: boolean
  show_email: boolean
  show_portfolio: boolean
  show_resume: boolean
  show_profile_video: boolean
  created_at: string
  updated_at: string
}

// Fetch user profile by username
export async function getUserProfile(username: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*, social_links(*), user_web_preferences(*)')
      .or(`username.eq.${username},custom_username.eq.${username}`)
      .single()

    if (error) throw error

    // Handle the case where user_web_preferences is an array with one item
    if (data && Array.isArray(data.user_web_preferences) && data.user_web_preferences.length > 0) {
      data.user_web_preferences = data.user_web_preferences[0]
    } else if (Array.isArray(data.user_web_preferences) && data.user_web_preferences.length === 0) {
      data.user_web_preferences = null
    }

    return data
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
}

// Submit waitlist entry
export async function submitToWaitlist(name: string, email: string, state: string) {
  try {
    const { data, error } = await supabase
      .from('waitlist')
      .insert([{ name, email, state }])
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}