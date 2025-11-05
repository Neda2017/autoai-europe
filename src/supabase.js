import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL
const service = process.env.SUPABASE_SERVICE_ROLE

if (!url || !service) {
  console.warn('[supabase] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE')
}

export const sb = createClient(url, service, {
  auth: { persistSession: false }
})
