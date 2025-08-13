import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://localhost:54321'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  console.log('Supabase config check:', {
    url: url ? `${url.substring(0, 20)}...` : 'undefined',
    key: key ? `${key.substring(0, 20)}...` : 'undefined',
    urlValid: !!(url && url !== 'your_supabase_url_here' && url !== 'https://localhost:54321'),
    keyValid: !!(key && key !== 'your_supabase_anon_key_here' && key !== 'demo-key')
  })
  
  const isConfigured = url && 
         url !== 'your_supabase_url_here' &&
         url !== 'https://localhost:54321' &&
         key &&
         key !== 'your_supabase_anon_key_here' &&
         key !== 'demo-key'
  
  console.log('Supabase is configured:', isConfigured)
  return isConfigured
}