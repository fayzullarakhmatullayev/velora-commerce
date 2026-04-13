<script setup lang="ts">
definePageMeta({ layout: 'auth', middleware: 'guest' })
useSeoMeta({ title: 'Login — Velora Commerce' })

const { t } = useI18n()
const { login } = useAuth()
const toast = useToast()

const form = reactive({ email: '', password: '' })
const loading = ref(false)
const error = ref('')

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await login(form.email, form.password)
    toast.add({ title: t('auth.loginSuccess'), icon: 'heroicons:check-circle', color: 'success' })
    await navigateTo('/account')
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="w-full max-w-sm">
    <!-- Header -->
    <div class="mb-8 text-center">
      <h1 class="font-display text-2xl font-bold text-zinc-900 dark:text-white">
        {{ t('auth.login') }}
      </h1>
      <p class="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        {{ t('auth.noAccount') }}
        <NuxtLink to="/auth/register" class="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400">
          {{ t('auth.register') }}
        </NuxtLink>
      </p>
    </div>

    <VCard padding="lg">
      <form class="space-y-4" @submit.prevent="submit">
        <!-- Error alert -->
        <div
          v-if="error"
          class="flex items-center gap-2 rounded-lg bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800 px-3 py-2.5"
        >
          <UIcon name="heroicons:exclamation-circle" class="size-4 shrink-0 text-rose-500" />
          <p class="text-sm text-rose-700 dark:text-rose-300">{{ error }}</p>
        </div>

        <UFormField :label="t('auth.email')" name="email" required>
          <UInput
            v-model="form.email"
            type="email"
            placeholder="you@example.com"
            autocomplete="email"
            class="w-full"
          />
        </UFormField>

        <UFormField :label="t('auth.password')" name="password" required>
          <template #hint>
            <NuxtLink
              to="/auth/forgot-password"
              class="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400"
            >
              {{ t('auth.forgotPassword') }}
            </NuxtLink>
          </template>
          <UInput
            v-model="form.password"
            type="password"
            placeholder="••••••••"
            autocomplete="current-password"
            class="w-full"
          />
        </UFormField>

        <UButton type="submit" block size="lg" :loading="loading" class="mt-2">
          {{ t('auth.login') }}
        </UButton>
      </form>
    </VCard>
  </div>
</template>
