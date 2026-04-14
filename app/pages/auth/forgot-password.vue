<script setup lang="ts">
definePageMeta({ layout: 'auth', middleware: 'guest' })
useSeoMeta({ title: 'Reset Password — Velora Commerce' })

const { t } = useI18n()
const { sendPasswordReset } = useAuth()
const toast = useToast()

const email = ref('')
const loading = ref(false)
const sent = ref(false)
const error = ref('')

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await sendPasswordReset(email.value)
    sent.value = true
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Failed to send reset email'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="w-full max-w-sm">
    <div class="mb-8 text-center">
      <h1 class="font-display text-2xl font-bold text-zinc-900 dark:text-white">
        {{ t('auth.forgotPassword') }}
      </h1>
      <p class="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        {{ t('auth.resetInstructions') }}
      </p>
    </div>

    <VCard padding="lg">
      <!-- Success -->
      <div v-if="sent" class="text-center space-y-4">
        <div class="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 mx-auto">
          <UIcon name="heroicons:envelope-open" class="size-7 text-emerald-600 dark:text-emerald-400" />
        </div>
        <p class="text-sm text-zinc-600 dark:text-zinc-300">
          {{ t('auth.resetSent', { email }) }}
        </p>
        <NuxtLink to="/auth/login" class="text-sm font-medium text-primary-600 dark:text-primary-400">
          {{ t('auth.backToLogin') }}
        </NuxtLink>
      </div>

      <!-- Form -->
      <form v-else class="space-y-4" @submit.prevent="submit">
        <div
          v-if="error"
          class="flex items-center gap-2 rounded-lg bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800 px-3 py-2.5"
        >
          <UIcon name="heroicons:exclamation-circle" class="size-4 shrink-0 text-rose-500" />
          <p class="text-sm text-rose-700 dark:text-rose-300">{{ error }}</p>
        </div>

        <UFormField :label="t('auth.email')" name="email" required>
          <UInput v-model="email" type="email" placeholder="you@example.com" autocomplete="email" class="w-full" />
        </UFormField>

        <UButton type="submit" block size="lg" :loading="loading">
          {{ t('auth.resetPassword') }}
        </UButton>

        <div class="text-center">
          <NuxtLink to="/auth/login" class="text-sm text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">
            {{ t('auth.backToLogin') }}
          </NuxtLink>
        </div>
      </form>
    </VCard>
  </div>
</template>
