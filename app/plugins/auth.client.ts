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

    // No navigation side-effects here — logout() handles explicit sign-out,
    // and the auth middleware handles session-expiry redirects on navigation.
  },
})
