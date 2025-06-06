import { createClient } from '@supabase/supabase-js';

// Verify Supabase environment variables are loaded
if (!import.meta.env.VITE_SUPABASE_URL) {
  console.error('Supabase environment variables not found. Check your .env file.');
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

export default supabase;