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

    // Restore session — after this resolves the client sends the user JWT
    // on every subsequent request instead of the anon key.
    await supabase.auth.getSession()

    // Keep state in sync for the lifetime of the app
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        const route = useRoute()
        const protectedPrefixes = ['/account', '/checkout']
        if (protectedPrefixes.some((p) => route.path.startsWith(p))) {
          navigateTo('/auth/login')
        }
      }
    })
  },
})
