'use strict'

// Database record types
export interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  status: 'new' | 'read' | 'replied' | 'archived'
  created_at: string
  ip_address?: string
  user_agent?: string
  admin_notes?: string
}

export interface WaitlistSubscriber {
  id: string
  email: string
  state: string
  created_at: string
}

export interface User {
  id: string
  name: string
  email: string
  username: string
  custom_username: string | null
  subscription_tier: 'free' | 'premium'
  // connection_count: number
  created_at: string
}

export interface Order {
  id: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  quantity: number
  created_at: string
  users?: {
    name: string
    email: string
  }
  products?: {
    name: string
    price: number
  }
  addresses?: {
    full_name: string
    address_line1: string
    address_line2?: string
    city: string
    state: string
    postal_code: string
    country: string
    phone: string
  }
}

export interface BugReport {
  id: string
  title: string
  description: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  created_at: string
}

export interface AnalyticsEvent {
  id: string
  event_type: 'profile_view' | 'qr_scan' | 'link_click'
  created_at: string
  users?: {
    name: string
    username: string
  }
}

// ─── Hiring Platform ──────────────────────────────────────────────────────────

export interface Company {
  id: string
  owner_id: string
  name: string
  logo_url: string | null
  industry: string | null
  description: string | null
  website: string | null
  size: '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1000+' | null
  location: string | null
  is_verified: boolean
  created_at: string
  updated_at: string
}

export interface Job {
  id: string
  company_id: string | null
  company_name: string | null
  posted_by: string
  title: string
  description: string
  requirements: string | null
  location: string | null
  job_type: 'full_time' | 'part_time' | 'contract' | 'internship'
  work_mode: 'remote' | 'onsite' | 'hybrid'
  posting_mode: 'internal' | 'external'
  external_url: string | null
  status: 'draft' | 'active' | 'paused' | 'archived'
  salary_min: number | null
  salary_max: number | null
  salary_currency: string
  salary_visible: boolean
  experience_years_min: number
  tags: string[]
  application_deadline: string | null
  created_at: string
  updated_at: string
  companies?: Company
  application_count?: number
}

export interface ApplicantProfile {
  id: string
  name: string
  title: string | null
  bio: string | null
  profile_image_url: string | null
  email: string
  phone: string | null
  years_experience: number | null
  resume_file_url: string | null
  portfolio_or_website_link: string | null
  open_to_work?: boolean
  job_seeking_status?: string | null
  social_links?: { platform: string; url: string; is_enabled: boolean }[]
}

export interface JobApplication {
  id: string
  job_id: string
  applicant_id: string
  status: 'applied' | 'under_review' | 'shortlisted' | 'accepted' | 'rejected'
  cover_note: string | null
  resume_url: string | null
  ad_watched: boolean
  applied_at: string
  reviewed_at: string | null
  decided_at: string | null
  jobs?: {
    id: string
    title: string
    company_id: string
    companies?: Company
  }
  users?: ApplicantProfile
  interview_schedules?: InterviewSchedule | null
}

export interface EmailTemplate {
  id: string
  company_id: string
  type: 'rejection' | 'acceptance' | 'general'
  label: string
  subject: string
  body: string
  is_default: boolean
  is_seeded: boolean
  created_at: string
  updated_at: string
}

export interface ApplicationEmail {
  id: string
  application_id: string
  template_id: string | null
  sent_by: string
  recipient_email: string
  subject: string
  body: string
  sent_at: string
}

export interface Resume {
  id: string
  user_id: string
  label: string
  file_url: string
  is_default: boolean
  created_at: string
}

export interface InterviewSchedule {
  id: string
  application_id: string
  scheduled_by: string
  scheduled_at: string
  duration_minutes: number
  meet_link: string | null
  notes: string | null
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'
  created_at: string
  updated_at: string
}

export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string | null
  body_html: string
  cover_image_url: string | null
  category: string | null
  tags: string[]
  author_name: string
  author_avatar_url: string | null
  reading_minutes: number
  seo_title: string | null
  seo_description: string | null
  status: 'draft' | 'published'
  published_at: string | null
  created_at: string
  updated_at: string
}
