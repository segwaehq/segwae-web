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
