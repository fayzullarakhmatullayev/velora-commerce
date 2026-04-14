// ─────────────────────────────────────────────────────────────────────────────
// Velora Commerce — Auth session plugin (client-only)
//
// Calls getSession() on app boot so the Supabase client has the JWT loaded
// before any route middleware runs. Without this, the anon key is used for
// the first request window, causing 403s on RLS-protected tables.
// ─────────────────────────────────────────────────────────────────────────────
export default defineNuxtPlugin({
  name: 'auth-session',
  enforce: 'pre',
  async setup() {
    const supabase = useSupabaseClient()
    const { loadProfile } = useAuth()

    // Restore session — after this resolves the client sends the user JWT
    // on every subsequent request instead of the anon key.
    await supabase.auth.getSession()

    // Load profile on boot so header/components have it immediately.
    await loadProfile()

    // Keep profile in sync on sign-in / sign-out / token refresh.
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        loadProfile()
      } else if (event === 'SIGNED_OUT') {
        const { profile } = useAuth()
        profile.value = null
      }
    })
  },
})
