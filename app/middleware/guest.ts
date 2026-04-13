// ─────────────────────────────────────────────────────────────────────────────
// Velora Commerce — Guest middleware
// Redirects already-logged-in users away from auth pages
// Usage: definePageMeta({ middleware: 'guest' })
// ─────────────────────────────────────────────────────────────────────────────
export default defineNuxtRouteMiddleware(() => {
  const user = useSupabaseUser()

  if (user.value) {
    return navigateTo('/account')
  }
})
