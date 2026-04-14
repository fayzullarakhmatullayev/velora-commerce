<script setup lang="ts">
// This page is the landing target of the Supabase password-reset email link.
// The link carries access_token + refresh_token in the URL hash; the Supabase JS
// client picks them up automatically (detectSessionInUrl: true) and fires a
// PASSWORD_RECOVERY auth event.  We listen for that event before showing the form.
definePageMeta({ layout: 'auth' })
useSeoMeta({ title: 'Set New Password — Velora Commerce' })

const { t } = useI18n()
const supabase = useSupabase()
const { updatePassword } = useAuth()
const toast = useToast()

const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const success = ref(false)
const error = ref('')
const validSession = ref(false)
const checking = ref(true)

onMounted(async () => {
  // Subscribe to auth events — PASSWORD_RECOVERY fires when Supabase processes
  // the recovery token from the URL hash.
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
    if (event === 'PASSWORD_RECOVERY') {
      validSession.value = true
      checking.value = false
    }
  })

  // If the event already fired before we subscribed (e.g. hot-reload), fall back
  // to checking for an active session.
  const { data: { session } } = await supabase.auth.getSession()
  if (session) {
    validSession.value = true
  }

  // Stop the loading state regardless after checking
  checking.value = false

  onUnmounted(() => subscription.unsubscribe())
})

async function submit() {
  error.value = ''

  if (password.value.length < 6) {
    error.value = t('auth.passwordTooShort')
    return
  }
  if (password.value !== confirmPassword.value) {
    error.value = t('auth.passwordsMismatch')
    return
  }

  loading.value = true
  try {
    await updatePassword(password.value)
    success.value = true
    toast.add({ title: t('auth.passwordUpdated'), color: 'success', icon: 'heroicons:check-circle' })
    // Sign out so the user logs in fresh with their new password
    await supabase.auth.signOut()
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : t('common.error')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="w-full max-w-sm">

    <!-- Checking session state -->
    <div v-if="checking" class="flex flex-col items-center gap-4 text-center py-8">
      <div class="flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950">
        <UIcon name="heroicons:arrow-path" class="size-8 text-rose-500 animate-spin" />
      </div>
      <p class="text-sm text-zinc-400">{{ t('common.loading') }}</p>
    </div>

    <template v-else>

      <!-- Invalid / expired link -->
      <div v-if="!validSession" class="text-center space-y-5">
        <div class="flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950 mx-auto">
          <UIcon name="heroicons:exclamation-triangle" class="size-8 text-rose-500" />
        </div>
        <div>
          <h1 class="font-display text-xl font-bold text-zinc-900 dark:text-white mb-2">
            {{ t('auth.linkExpired') }}
          </h1>
          <p class="text-sm text-zinc-500 dark:text-zinc-400">
            {{ t('auth.linkExpiredDesc') }}
          </p>
        </div>
        <UButton to="/auth/forgot-password" block size="lg">
          {{ t('auth.requestNewLink') }}
        </UButton>
        <div class="text-center">
          <NuxtLink
            to="/auth/login"
            class="text-sm text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
          >
            {{ t('auth.backToLogin') }}
          </NuxtLink>
        </div>
      </div>

      <!-- Success state -->
      <div v-else-if="success" class="text-center space-y-5">
        <div class="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 mx-auto">
          <UIcon name="heroicons:check-circle" class="size-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h1 class="font-display text-xl font-bold text-zinc-900 dark:text-white mb-2">
            {{ t('auth.passwordUpdated') }}
          </h1>
          <p class="text-sm text-zinc-500 dark:text-zinc-400">
            {{ t('auth.passwordUpdatedDesc') }}
          </p>
        </div>
        <UButton to="/auth/login" block size="lg">
          {{ t('auth.goToLogin') }}
        </UButton>
      </div>

      <!-- Set new password form -->
      <div v-else>
        <div class="mb-8 text-center">
          <div class="flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950 mx-auto mb-4">
            <UIcon name="heroicons:lock-closed" class="size-7 text-rose-500 dark:text-rose-400" />
          </div>
          <h1 class="font-display text-2xl font-bold text-zinc-900 dark:text-white">
            {{ t('auth.setNewPassword') }}
          </h1>
          <p class="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            {{ t('auth.setNewPasswordDesc') }}
          </p>
        </div>

        <VCard padding="lg">
          <form class="space-y-4" @submit.prevent="submit">
            <!-- Error banner -->
            <div
              v-if="error"
              class="flex items-center gap-2 rounded-lg bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800 px-3 py-2.5"
            >
              <UIcon name="heroicons:exclamation-circle" class="size-4 shrink-0 text-rose-500" />
              <p class="text-sm text-rose-700 dark:text-rose-300">{{ error }}</p>
            </div>

            <UFormField :label="t('auth.newPassword')" name="password" required>
              <UInput
                v-model="password"
                type="password"
                :placeholder="t('auth.passwordHint')"
                autocomplete="new-password"
                class="w-full"
              />
            </UFormField>

            <UFormField :label="t('auth.confirmNewPassword')" name="confirm_password" required>
              <UInput
                v-model="confirmPassword"
                type="password"
                :placeholder="t('auth.passwordHint')"
                autocomplete="new-password"
                class="w-full"
              />
            </UFormField>

            <UButton type="submit" block size="lg" :loading="loading">
              {{ t('auth.setNewPassword') }}
            </UButton>

            <div class="text-center">
              <NuxtLink
                to="/auth/login"
                class="text-sm text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
              >
                {{ t('auth.backToLogin') }}
              </NuxtLink>
            </div>
          </form>
        </VCard>
      </div>

    </template>
  </div>
</template>
