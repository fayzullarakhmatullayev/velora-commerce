// ─────────────────────────────────────────────────────────────────────────────
// Velora Commerce — Server-side Supabase admin client
// Uses service role key — bypasses RLS. Only use in server API routes.
// NEVER expose this to the client.
// ─────────────────────────────────────────────────────────────────────────────
import { createClient } from '@supabase/supabase-js'
import type { Database } from '~/types/database.types'

export const useServerSupabase = () => {
  const config = useRuntimeConfig()

  // @nuxtjs/supabase manages secretKey via NUXT_SUPABASE_SECRET_KEY
  const url = config.public.supabaseUrl as string
  const key = (config.supabase as { secretKey?: string })?.secretKey

  if (!url || !key) {
    throw createError({
      statusCode: 500,
      message: 'Supabase server configuration is missing. Set NUXT_SUPABASE_SECRET_KEY in .env',
    })
  }

  return createClient<Database>(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
