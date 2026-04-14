<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useSeoMeta({ title: 'Edit Profile — Velora Commerce' })

const { t } = useI18n()
const supabase = useSupabase()
const { updateProfile } = useAuth()
const toast = useToast()

// ── Profile data ──────────────────────────────────────────────────────────────
const userId = ref<string | null>(null)
const email = ref('')
const avatarUrl = ref<string | null>(null)
const fullName = ref<string | null>(null)
const fetching = ref(true)

const form = reactive({ full_name: '', phone: '' })

onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user?.id) return

  userId.value = session.user.id
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

// ── Avatar upload ─────────────────────────────────────────────────────────────
const fileInput = ref<HTMLInputElement | null>(null)
const uploading = ref(false)
const dragOver = ref(false)
const previewUrl = ref<string | null>(null)

function openFilePicker() {
  fileInput.value?.click()
}

function onDragOver(e: DragEvent) {
  e.preventDefault()
  dragOver.value = true
}

function onDragLeave() {
  dragOver.value = false
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  dragOver.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) uploadAvatar(file)
}

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) uploadAvatar(file)
}

async function uploadAvatar(file: File) {
  if (!userId.value) return
  if (!file.type.startsWith('image/')) {
    toast.add({ title: 'Please select an image file', color: 'error', icon: 'heroicons:x-circle' })
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    toast.add({ title: 'Image must be under 5 MB', color: 'error', icon: 'heroicons:x-circle' })
    return
  }

  // Local preview immediately
  previewUrl.value = URL.createObjectURL(file)
  uploading.value = true

  try {
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${userId.value}/avatar.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, contentType: file.type })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)

    // Bust cache by appending timestamp
    const busted = `${publicUrl}?t=${Date.now()}`

    await updateProfile({ avatar_url: busted })
    avatarUrl.value = busted
    previewUrl.value = null

    toast.add({ title: 'Avatar updated!', color: 'success', icon: 'heroicons:check-circle' })
  } catch (err: any) {
    previewUrl.value = null
    toast.add({ title: 'Upload failed', description: err.message, color: 'error', icon: 'heroicons:x-circle' })
  } finally {
    uploading.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}

// ── Save profile ──────────────────────────────────────────────────────────────
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

const displayAvatar = computed(() => previewUrl.value ?? avatarUrl.value)
const displayName = computed(() => form.full_name || fullName.value || '—')

function initials(name: string | null) {
  if (!name) return '?'
  return name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
}
</script>

<template>
  <div class="velora-container py-10 max-w-2xl">
    <!-- Header -->
    <div class="mb-8 flex items-center gap-3">
      <UButton to="/account" color="neutral" variant="ghost" icon="heroicons:arrow-left" size="sm" />
      <h1 class="font-display text-2xl font-bold text-zinc-900 dark:text-white">{{ t('account.editProfileTitle') }}</h1>
    </div>

    <!-- Loading skeleton -->
    <div v-if="fetching" class="space-y-4">
      <VCard padding="lg">
        <div class="flex items-center gap-5 mb-8 pb-8 border-b border-zinc-100 dark:border-zinc-800">
          <USkeleton class="size-20 rounded-full shrink-0" />
          <div class="space-y-2">
            <USkeleton class="h-4 w-32" />
            <USkeleton class="h-3 w-48" />
            <USkeleton class="h-8 w-28 rounded-lg" />
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

        <!-- ── Avatar upload section ─────────────────────────────────────── -->
        <div class="mb-8 pb-8 border-b border-zinc-100 dark:border-zinc-800">
          <div class="flex flex-col sm:flex-row sm:items-center gap-6">

            <!-- Avatar with upload overlay -->
            <div class="relative shrink-0 self-start sm:self-center">
              <!-- Drop zone -->
              <div
                class="relative size-24 rounded-full cursor-pointer group"
                :class="dragOver ? 'ring-2 ring-rose-400 ring-offset-2' : ''"
                @click="openFilePicker"
                @dragover="onDragOver"
                @dragleave="onDragLeave"
                @drop="onDrop"
              >
                <!-- Avatar image or initials -->
                <div class="size-24 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center ring-2 ring-white dark:ring-zinc-900 shadow-md">
                  <img
                    v-if="displayAvatar"
                    :src="displayAvatar"
                    :alt="displayName"
                    class="size-full object-cover transition-opacity duration-300"
                    :class="uploading ? 'opacity-40' : 'opacity-100'"
                  />
                  <span v-else class="text-xl font-bold text-zinc-400 dark:text-zinc-500 select-none">
                    {{ initials(displayName) }}
                  </span>
                </div>

                <!-- Upload spinner overlay -->
                <div v-if="uploading" class="absolute inset-0 rounded-full flex items-center justify-center">
                  <UIcon name="heroicons:arrow-path" class="size-6 text-rose-500 animate-spin" />
                </div>

                <!-- Camera hover overlay -->
                <div
                  v-else
                  class="absolute inset-0 rounded-full bg-zinc-900/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <UIcon name="heroicons:camera" class="size-6 text-white" />
                </div>

                <!-- Drag-over state -->
                <div
                  v-if="dragOver"
                  class="absolute inset-0 rounded-full bg-rose-500/20 border-2 border-dashed border-rose-400 flex items-center justify-center"
                >
                  <UIcon name="heroicons:arrow-up-tray" class="size-6 text-rose-500" />
                </div>
              </div>

              <!-- Hidden file input -->
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                class="hidden"
                @change="onFileChange"
              />
            </div>

            <!-- Info + upload button -->
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-zinc-900 dark:text-white text-lg leading-tight truncate">
                {{ displayName }}
              </p>
              <p class="text-sm text-zinc-400 mt-0.5 mb-4">{{ email }}</p>

              <div class="flex flex-wrap items-center gap-2">
                <UButton
                  size="sm"
                  color="neutral"
                  variant="outline"
                  icon="heroicons:arrow-up-tray"
                  :loading="uploading"
                  @click="openFilePicker"
                >
                  {{ uploading ? 'Uploading…' : 'Upload Photo' }}
                </UButton>
                <p class="text-xs text-zinc-400">JPG, PNG, WebP · Max 5 MB</p>
              </div>

              <!-- Drag hint -->
              <p class="text-xs text-zinc-400 mt-2 hidden sm:block">
                Or drag & drop an image onto your avatar
              </p>
            </div>
          </div>
        </div>

        <!-- ── Profile form ───────────────────────────────────────────────── -->
        <form class="space-y-5" @submit.prevent="save">
          <UFormField :label="t('account.fullNameLabel')" name="full_name">
            <UInput
              v-model="form.full_name"
              placeholder="Jane Smith"
              autocomplete="name"
              class="w-full"
            />
          </UFormField>

          <UFormField :label="t('account.emailLabel')" name="email">
            <UInput :value="email" type="email" disabled class="w-full opacity-60" />
            <template #hint>
              <span class="text-xs text-zinc-400">{{ t('account.emailHint') }}</span>
            </template>
          </UFormField>

          <UFormField :label="t('account.phoneLabel')" name="phone">
            <UInput
              v-model="form.phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              autocomplete="tel"
              class="w-full"
            />
          </UFormField>

          <div class="pt-2">
            <UButton type="submit" :loading="loading" size="lg">{{ t('common.saveChanges') }}</UButton>
          </div>
        </form>
      </VCard>

      <!-- Password section -->
      <VCard padding="lg" class="mt-6">
        <h2 class="font-semibold text-zinc-900 dark:text-white mb-1">{{ t('account.passwordLabel') }}</h2>
        <p class="text-sm text-zinc-400 mb-4">{{ t('account.passwordDesc') }}</p>
        <UButton to="/auth/forgot-password" color="neutral" variant="outline" size="sm">
          {{ t('account.resetViaEmail') }}
        </UButton>
      </VCard>
    </template>
  </div>
</template>
