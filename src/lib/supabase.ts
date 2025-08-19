import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://localhost:54321'
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'demo-service-key'

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

// Check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  console.log('Supabase config check:', {
    url: url ? `${url.substring(0, 20)}...` : 'undefined',
    key: key ? `${key.substring(0, 20)}...` : 'undefined',
    urlValid: !!(url && url !== 'your_supabase_url_here' && url !== 'https://localhost:54321'),
    keyValid: !!(key && key !== 'demo-service-key')
  })
  
  const isConfigured = url && 
         url !== 'your_supabase_url_here' &&
         url !== 'https://localhost:54321' &&
         key &&
         key !== 'demo-service-key'
  
  console.log('Supabase is configured:', isConfigured)
  return isConfigured
}