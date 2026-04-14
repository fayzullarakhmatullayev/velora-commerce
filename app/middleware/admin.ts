// ─────────────────────────────────────────────────────────────────────────────
// Velora Commerce — Admin middleware
// Protects admin-only routes
// Usage: definePageMeta({ middleware: 'admin' })
// ─────────────────────────────────────────────────────────────────────────────
export default defineNuxtRouteMiddleware(async () => {
  const supabase = useSupabaseClient()

  // Always resolve from the live session — useSupabaseUser() may not have
  // the user.id populated yet when the middleware fires on cold navigation.
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.user?.id) {
    return navigateTo('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (profile?.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }
})
