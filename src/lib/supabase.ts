import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://localhost:54321'
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'demo-service-key'

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

// Check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  
  console.log('Supabase config check:', {
    url: url ? `${url.substring(0, 20)}...` : 'undefined',
    urlValid: !!(url && url !== 'your_supabase_url_here' && url !== 'https://localhost:54321')
  })
  
  // For the demo, we'll check if we have a real Supabase URL
  // The service role key check happens server-side in the API routes
  const isConfigured = url && 
         url !== 'your_supabase_url_here' &&
         url !== 'https://localhost:54321' &&
         url.includes('supabase.co') // Real Supabase URLs contain this
  
  console.log('Supabase is configured:', isConfigured)
  return isConfigured
}