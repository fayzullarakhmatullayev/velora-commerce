// ─────────────────────────────────────────────────────────────────────────────
// Velora Commerce — Auth composable
// Provides login, register, logout, and current user state
// ─────────────────────────────────────────────────────────────────────────────
import type { Database } from '~/types/database.types'

export const useAuth = () => {
  const supabase = useSupabase()
  const user = useSupabaseUser()

  // ── Current user profile (loaded from profiles table) ─────────────────────
  const profile = useState<Database['public']['Tables']['profiles']['Row'] | null>(
    'auth.profile',
    () => null,
  )

  const isLoggedIn = computed(() => !!user.value)
  const isAdmin = computed(() => profile.value?.role === 'admin')

  // ── Load profile whenever user changes ────────────────────────────────────
  const loadProfile = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session?.user?.id) {
      profile.value = null
      return
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (!error && data) {
      profile.value = data
    }
  }

  // ── Register ──────────────────────────────────────────────────────────────
  const register = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    })

    if (error) throw error
    return data
  }

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    await loadProfile()
    return data
  }

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = async () => {
    await supabase.auth.signOut()
    profile.value = null
    await navigateTo('/')
  }

  // ── Password reset ────────────────────────────────────────────────────────
  const sendPasswordReset = async (email: string) => {
    const config = useRuntimeConfig()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${config.public.appUrl}/auth/reset-password`,
    })
    if (error) throw error
  }

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw error
  }

  // ── Profile update ────────────────────────────────────────────────────────
  const updateProfile = async (updates: Database['public']['Tables']['profiles']['Update']) => {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session?.user?.id) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', session.user.id)
      .select()
      .single()

    if (error) throw error
    profile.value = data
    return data
  }

  return {
    user,
    profile,
    isLoggedIn,
    isAdmin,
    loadProfile,
    register,
    login,
    logout,
    sendPasswordReset,
    updatePassword,
    updateProfile,
  }
}
