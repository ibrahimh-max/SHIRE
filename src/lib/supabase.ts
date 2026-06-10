// Supabase client configuration
// This file sets up the Supabase client for authentication and database operations

import { createClient } from '@supabase/supabase-js';

// Environment variables for Supabase connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types for TypeScript support
export interface Profile {
  id: string;
  name: string;
  role: 'worker' | 'employer';
  phone?: string;
  location?: string;
  age?: number;
  address?: string;
  experience?: string;
  availability?: 'Full Time' | 'Part Time' | 'Both';
  preferred_role?: 'Waiter' | 'Chef' | 'Kitchen Helper' | 'Receptionist' | 'Housekeeping' | 'Barista' | 'Delivery Staff';
  photo_url?: string;
  is_available?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: string;
  company_id: string;
  title: string;
  description: string;
  pay: string;
  job_type: 'full-time' | 'part-time' | 'contract' | 'temporary';
  location: string;
  shift_timing: 'morning' | 'afternoon' | 'evening' | 'night' | 'flexible';
  workers_needed: number;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  owner_id: string;
  name: string;
  location: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  job_id: string;
  user_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
}
