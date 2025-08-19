// This file is now only used for client-side code
// Server-side Supabase operations are handled via API routes

// Client-side configuration check
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

if (!supabaseUrl) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

console.log('Client Supabase configuration:', {
  url: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'undefined'
})

// Export URL for client-side use
export const SUPABASE_URL = supabaseUrl