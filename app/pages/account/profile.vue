<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useSeoMeta({ title: 'Edit Profile — Velora Commerce' })

const supabase = useSupabase()
const { updateProfile } = useAuth()
const toast = useToast()

// ── Profile data ──────────────────────────────────────────────────────────────
const email = ref('')
const avatarUrl = ref<string | null>(null)
const fullName = ref<string | null>(null)
const fetching = ref(true)

const form = reactive({ full_name: '', phone: '' })

onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user?.id) return

  email.value = session.user.email ?? ''

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  if (data) {
    fullName.value = data.full_name
    avatarUrl.value = data.avatar_url
    form.full_name = data.full_name ?? ''
    form.phone = data.phone ?? ''
  }

  fetching.value = false
})

// ── Save ──────────────────────────────────────────────────────────────────────
const loading = ref(false)

async function save() {
  loading.value = true
  try {
    await updateProfile({ full_name: form.full_name, phone: form.phone })
    fullName.value = form.full_name
    toast.add({ title: 'Profile updated', icon: 'heroicons:check-circle', color: 'success' })
  } catch (e: unknown) {
    toast.add({ title: e instanceof Error ? e.message : 'Update failed', color: 'error' })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="velora-container py-10 max-w-2xl">
    <!-- Header -->
    <div class="mb-8 flex items-center gap-3">
      <UButton to="/account" color="neutral" variant="ghost" icon="heroicons:arrow-left" size="sm" />
      <h1 class="font-display text-2xl font-bold text-zinc-900 dark:text-white">Edit Profile</h1>
    </div>

    <!-- Loading skeleton -->
    <div v-if="fetching" class="space-y-4">
      <VCard padding="lg">
        <div class="flex items-center gap-4 mb-8 pb-8 border-b border-zinc-100 dark:border-zinc-800">
          <USkeleton class="size-16 rounded-full shrink-0" />
          <div class="space-y-2">
            <USkeleton class="h-4 w-32" />
            <USkeleton class="h-3 w-48" />
          </div>
        </div>
        <div class="space-y-4">
          <USkeleton class="h-10 w-full rounded-lg" />
          <USkeleton class="h-10 w-full rounded-lg" />
          <USkeleton class="h-10 w-full rounded-lg" />
        </div>
      </VCard>
    </div>

    <template v-else>
      <VCard padding="lg">
        <!-- Avatar row -->
        <div class="flex items-center gap-4 mb-8 pb-8 border-b border-zinc-100 dark:border-zinc-800">
          <UAvatar :src="avatarUrl ?? undefined" :alt="fullName ?? 'User'" size="xl" />
          <div>
            <p class="font-semibold text-zinc-900 dark:text-white">{{ fullName ?? '—' }}</p>
            <p class="text-sm text-zinc-400">{{ email }}</p>
          </div>
        </div>

        <!-- Form -->
        <form class="space-y-5" @submit.prevent="save">
          <UFormField label="Full Name" name="full_name">
            <UInput
              v-model="form.full_name"
              placeholder="Jane Smith"
              autocomplete="name"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Email" name="email">
            <UInput :value="email" type="email" disabled class="w-full opacity-60" />
            <template #hint>
              <span class="text-xs text-zinc-400">Contact support to change your email</span>
            </template>
          </UFormField>

          <UFormField label="Phone" name="phone">
            <UInput
              v-model="form.phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              autocomplete="tel"
              class="w-full"
            />
          </UFormField>

          <div class="pt-2">
            <UButton type="submit" :loading="loading" size="lg">Save Changes</UButton>
          </div>
        </form>
      </VCard>

      <!-- Password section -->
      <VCard padding="lg" class="mt-6">
        <h2 class="font-semibold text-zinc-900 dark:text-white mb-1">Password</h2>
        <p class="text-sm text-zinc-400 mb-4">Change your account password.</p>
        <UButton to="/auth/forgot-password" color="neutral" variant="outline" size="sm">
          Reset Password via Email
        </UButton>
      </VCard>
    </template>
  </div>
</template>
