<script setup lang="ts">
definePageMeta({ layout: 'auth', middleware: 'guest' })
useSeoMeta({ title: 'Register — Velora Commerce' })

const { t } = useI18n()
const { register } = useAuth()
const toast = useToast()

const form = reactive({ fullName: '', email: '', password: '', confirmPassword: '' })
const loading = ref(false)
const error = ref('')

async function submit() {
  error.value = ''

  if (form.password !== form.confirmPassword) {
    error.value = 'Passwords do not match'
    return
  }

  if (form.password.length < 6) {
    error.value = 'Password must be at least 6 characters'
    return
  }

  loading.value = true
  try {
    await register(form.email, form.password, form.fullName)
    toast.add({
      title: t('auth.registerSuccess'),
      description: 'Please check your email to verify your account.',
      icon: 'heroicons:envelope',
      color: 'success',
      duration: 6000,
    })
    await navigateTo('/auth/login')
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Registration failed'
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
        {{ t('auth.register') }}
      </h1>
      <p class="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        {{ t('auth.hasAccount') }}
        <NuxtLink to="/auth/login" class="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400">
          {{ t('auth.login') }}
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

        <UFormField :label="t('auth.fullName')" name="fullName" required>
          <UInput
            v-model="form.fullName"
            placeholder="Jane Smith"
            autocomplete="name"
            class="w-full"
          />
        </UFormField>

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
          <UInput
            v-model="form.password"
            type="password"
            placeholder="Min. 6 characters"
            autocomplete="new-password"
            class="w-full"
          />
        </UFormField>

        <UFormField :label="t('auth.confirmPassword')" name="confirmPassword" required>
          <UInput
            v-model="form.confirmPassword"
            type="password"
            placeholder="Repeat password"
            autocomplete="new-password"
            class="w-full"
          />
        </UFormField>

        <UButton type="submit" block size="lg" :loading="loading" class="mt-2">
          {{ t('auth.register') }}
        </UButton>

        <p class="text-center text-xs text-zinc-400 leading-relaxed">
          By registering you agree to our
          <NuxtLink to="/terms" class="underline hover:text-zinc-600">Terms</NuxtLink>
          and
          <NuxtLink to="/privacy" class="underline hover:text-zinc-600">Privacy Policy</NuxtLink>.
        </p>
      </form>
    </VCard>
  </div>
</template>
