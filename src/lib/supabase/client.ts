import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  auth: {
    persistSession: false
  }
})

// Complete Database Types
export interface Message {
  id: string
  device_id: string
  content: string
  emoji: string | null
  mood: string | null  // Add this
  latitude: number
  longitude: number
  upvotes: number
  downvotes: number
  created_at: string
  expires_at: string
  country?: string
  is_time_capsule?: boolean  // Add this
  unlock_at?: string  // Add this
}


export interface Vote {
  id: string
  message_id: string
  device_id: string
  vote_type: 'up' | 'down'
  created_at: string
}

export interface UserStreak {
  device_id: string
  current_streak: number
  longest_streak: number
  countries_visited: string[]
  last_post_date: string
  total_messages: number
  total_upvotes: number
}

