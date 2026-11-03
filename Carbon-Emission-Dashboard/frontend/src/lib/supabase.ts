// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          country: string | null
          city: string | null
          bio: string | null
          theme_preference: 'dark' | 'light' | 'system'
          receive_reports: boolean
          onboarding_complete: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      electricity_usage: {
        Row: {
          id: string
          user_id: string
          units_kwh: number
          bill_amount: number | null
          period_start: string
          period_end: string
          source: string
          notes: string | null
          carbon_kg: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['electricity_usage']['Row'], 'id' | 'carbon_kg' | 'created_at'>
        Update: Partial<Database['public']['Tables']['electricity_usage']['Insert']>
      }
      transportation_logs: {
        Row: {
          id: string
          user_id: string
          transport_type: string
          distance_km: number
          fuel_type: string
          passengers: number
          trip_date: string
          purpose: string | null
          carbon_kg: number | null
          notes: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['transportation_logs']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['transportation_logs']['Insert']>
      }
      waste_records: {
        Row: {
          id: string
          user_id: string
          waste_type: string
          weight_kg: number
          disposal_method: string
          record_date: string
          carbon_kg: number | null
          notes: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['waste_records']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['waste_records']['Insert']>
      }
      activities: {
        Row: {
          id: string
          user_id: string
          activity_type: string
          title: string
          description: string | null
          carbon_kg: number
          activity_date: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['activities']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['activities']['Insert']>
      }
    }
  }
}
