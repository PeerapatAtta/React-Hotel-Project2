import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('[supabaseClient] Initializing Supabase client...', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  urlPrefix: supabaseUrl ? supabaseUrl.substring(0, 20) + '...' : 'missing'
})

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[supabaseClient] Missing environment variables!')
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
console.log('[supabaseClient] Supabase client initialized successfully')

