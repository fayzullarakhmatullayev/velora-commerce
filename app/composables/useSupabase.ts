// ─────────────────────────────────────────────────────────────────────────────
// Velora Commerce — Typed Supabase client composable
// Wraps @nuxtjs/supabase with our Database type for full type-safety
// ─────────────────────────────────────────────────────────────────────────────
import type { Database } from '~/types/database.types'

export const useSupabase = () => {
  // useSupabaseClient is auto-imported by @nuxtjs/supabase
  return useSupabaseClient<Database>()
}
