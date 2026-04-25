import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export interface Branch {
  id: string
  name: string
  location: string
  created_at: string
}

export interface Feedback {
  id: string
  branch_id: string
  overall_rating: number
  service_speed: number
  staff_friendliness: number
  cleanliness: number
  comment: string | null
  shift: 'morning' | 'afternoon' | 'evening'
  created_at: string
}

export interface FeedbackWithBranch extends Feedback {
  branches: Branch
}

export interface AnalyticsData {
  avg_overall: number
  avg_speed: number
  avg_staff: number
  avg_cleanliness: number
  total_responses: number
  negative_count: number
  negative_percentage: number
}
