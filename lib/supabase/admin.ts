import { createClient } from "@supabase/supabase-js"

// Cliente con service role — bypasa RLS, solo usar en server actions
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key, { auth: { persistSession: false } })
}
