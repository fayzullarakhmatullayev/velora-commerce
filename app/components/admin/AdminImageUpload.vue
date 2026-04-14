<script setup lang="ts">
// Single image slot: shows preview, click to replace, drag-and-drop supported.
// On file pick → uploads to Supabase `products` bucket → emits public URL.

const props = defineProps<{
  modelValue: string   // current URL (empty string = no image)
  index: number        // position in the images array (used for unique filenames)
}>()

const emit = defineEmits<{
  'update:modelValue': [url: string]
  'remove': []
}>()

const supabase = useSupabase()
const toast = useToast()

const uploading = ref(false)
const dragOver = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)

function openPicker() {
  inputRef.value?.click()
}

async function handleFile(file: File) {
  if (!file.type.startsWith('image/')) {
    toast.add({ title: 'Please select an image file', color: 'error', icon: 'heroicons:exclamation-circle' })
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    toast.add({ title: 'Image must be under 5 MB', color: 'error', icon: 'heroicons:exclamation-circle' })
    return
  }

  uploading.value = true
  try {
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(path, file, { cacheControl: '3600', upsert: false })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(path)
    emit('update:modelValue', publicUrl)
  } catch (err: any) {
    toast.add({ title: 'Upload failed', description: err.message, color: 'error', icon: 'heroicons:x-circle' })
  } finally {
    uploading.value = false
  }
}

function onFileInput(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) handleFile(file)
}

function onDrop(e: DragEvent) {
  dragOver.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) handleFile(file)
}

function onUrlInput(val: string) {
  emit('update:modelValue', val)
}
</script>

<template>
  <div class="flex items-start gap-3">
    <!-- Hidden file input -->
    <input
      ref="inputRef"
      type="file"
      accept="image/*"
      class="hidden"
      @change="onFileInput"
    />

    <!-- Drop zone / preview -->
    <div
      class="relative size-20 shrink-0 rounded-xl overflow-hidden border-2 transition-colors cursor-pointer"
      :class="dragOver
        ? 'border-primary-500 bg-primary-50 dark:bg-primary-950'
        : 'border-dashed border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:border-primary-400'"
      @click="openPicker"
      @dragover.prevent="dragOver = true"
      @dragleave="dragOver = false"
      @drop.prevent="onDrop"
    >
      <!-- Preview image -->
      <img
        v-if="modelValue"
        :src="modelValue"
        class="size-full object-cover"
        @error="($event.target as HTMLImageElement).style.opacity = '0.3'"
      />

      <!-- Upload overlay / placeholder -->
      <div
        class="absolute inset-0 flex flex-col items-center justify-center gap-0.5 transition-opacity"
        :class="modelValue && !uploading ? 'opacity-0 hover:opacity-100 bg-black/40' : 'opacity-100'"
      >
        <UIcon
          v-if="!uploading"
          name="heroicons:arrow-up-tray"
          class="size-5"
          :class="modelValue ? 'text-white' : 'text-zinc-400'"
        />
        <UIcon v-else name="heroicons:arrow-path" class="size-5 text-primary-500 animate-spin" />
        <span
          v-if="!modelValue && !uploading"
          class="text-[10px] text-zinc-400 text-center leading-tight px-1"
        >
          Click or drag
        </span>
      </div>
    </div>

    <!-- URL input + remove -->
    <div class="flex-1 min-w-0 space-y-1.5">
      <UInput
        :model-value="modelValue"
        placeholder="https://… or upload ↑"
        size="sm"
        class="w-full"
        @update:model-value="onUrlInput($event)"
      />
      <div class="flex items-center gap-2">
        <UButton
          type="button"
          size="xs"
          color="neutral"
          variant="ghost"
          icon="heroicons:arrow-up-tray"
          :loading="uploading"
          @click="openPicker"
        >
          Upload
        </UButton>
        <UButton
          type="button"
          size="xs"
          color="error"
          variant="ghost"
          icon="heroicons:trash"
          @click="emit('remove')"
        >
          Remove
        </UButton>
      </div>
    </div>
  </div>
</template>
