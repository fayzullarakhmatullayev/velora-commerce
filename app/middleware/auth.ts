// ─────────────────────────────────────────────────────────────────────────────
// Velora Commerce — Auth middleware
// Protects routes that require a logged-in user.
//
// In SPA mode the Supabase session restore from localStorage is async, so
// useSupabaseUser() can be null for a brief moment on first load.
// We call getSession() as a fallback before deciding to redirect, which
// ensures the Supabase client has the JWT loaded for all subsequent requests.
// ─────────────────────────────────────────────────────────────────────────────
export default defineNuxtRouteMiddleware(async () => {
  const user = useSupabaseUser()

  // Fast path: user already in state
  if (user.value) return

  // Slow path: restore session from localStorage / cookie
  const supabase = useSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return navigateTo('/auth/login')
  }

  // Session restored — user.value will be populated by the module's listener
})
