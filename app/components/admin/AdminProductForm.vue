<script setup lang="ts">
import type { ProductFormState } from '~/composables/useAdminProductForm'

const props = defineProps<{
  modelValue: ProductFormState
  categories: { id: string; translations: Record<string, { name: string }>; slug: string }[]
  saving?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [val: ProductFormState]
  'submit': []
}>()

const form = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

// Convenience patcher — mutate only the changed key
function patch(updates: Partial<ProductFormState>) {
  emit('update:modelValue', { ...props.modelValue, ...updates })
}
function patchTranslation(locale: 'en' | 'uz' | 'ru', updates: Partial<ProductFormState['translations']['en']>) {
  emit('update:modelValue', {
    ...props.modelValue,
    translations: {
      ...props.modelValue.translations,
      [locale]: { ...props.modelValue.translations[locale], ...updates },
    },
  })
}

// ── Locale tabs ────────────────────────────────────────────────────────────────
const activeLocale = ref<'en' | 'uz' | 'ru'>('en')
const localeTabs = [
  { key: 'en', label: 'English' },
  { key: 'uz', label: 'Uzbek' },
  { key: 'ru', label: 'Russian' },
] as const

// Auto-slug from EN title (only when slug is empty)
watch(
  () => props.modelValue.translations.en.title,
  (title) => {
    if (!props.modelValue.translations.en.slug) {
      patchTranslation('en', { slug: slugify(title) })
    }
  },
)

// ── Category options ──────────────────────────────────────────────────────────
const categoryOptions = computed(() => [
  { label: 'No category', value: '' },
  ...props.categories.map(c => ({
    label: c.translations?.en?.name ?? c.slug,
    value: c.id,
  })),
])

// ── Images ────────────────────────────────────────────────────────────────────
function addImage() {
  patch({ images: [...props.modelValue.images, ''] })
}
function removeImage(index: number) {
  const imgs = [...props.modelValue.images]
  imgs.splice(index, 1)
  if (imgs.length === 0) imgs.push('')
  patch({ images: imgs })
}
function updateImage(index: number, value: string) {
  const imgs = [...props.modelValue.images]
  imgs[index] = value
  patch({ images: imgs })
}

// ── Tags ──────────────────────────────────────────────────────────────────────
const tagInput = ref('')
function addTag() {
  const tag = tagInput.value.trim()
  if (tag && !props.modelValue.tags.includes(tag)) {
    patch({ tags: [...props.modelValue.tags, tag] })
  }
  tagInput.value = ''
}
function removeTag(tag: string) {
  patch({ tags: props.modelValue.tags.filter(t => t !== tag) })
}
function onTagKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault()
    addTag()
  }
}
</script>

<template>
  <form class="space-y-6" @submit.prevent="emit('submit')">

    <!-- ── Translations (tabbed) ─────────────────────────────────────────────── -->
    <VCard padding="md">
      <div class="flex items-center justify-between mb-4">
        <h2 class="font-semibold text-zinc-900 dark:text-white">Content</h2>
        <!-- Locale tabs -->
        <div class="flex items-center gap-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 p-0.5">
          <button
            v-for="tab in localeTabs"
            :key="tab.key"
            type="button"
            class="px-3 py-1 rounded-md text-xs font-medium transition-colors"
            :class="activeLocale === tab.key
              ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'"
            @click="activeLocale = tab.key"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>

      <template v-for="tab in localeTabs" :key="tab.key">
        <div v-show="activeLocale === tab.key" class="space-y-4">
          <UFormField :label="`Title (${tab.label})`" required>
            <UInput
              :model-value="form.translations[tab.key].title"
              :placeholder="`Product title in ${tab.label}`"
              size="sm"
              class="w-full"
              @update:model-value="patchTranslation(tab.key, { title: $event })"
            />
          </UFormField>

          <UFormField :label="`Slug (${tab.label})`">
            <UInput
              :model-value="form.translations[tab.key].slug"
              :placeholder="`url-friendly-slug`"
              size="sm"
              class="w-full"
              @update:model-value="patchTranslation(tab.key, { slug: slugify($event) })"
            />
          </UFormField>

          <UFormField :label="`Description (${tab.label})`">
            <UTextarea
              :model-value="form.translations[tab.key].description"
              :placeholder="`Product description in ${tab.label}`"
              :rows="4"
              size="sm"
              class="w-full"
              @update:model-value="patchTranslation(tab.key, { description: $event })"
            />
          </UFormField>
        </div>
      </template>
    </VCard>

    <!-- ── Pricing & Inventory ───────────────────────────────────────────────── -->
    <VCard padding="md">
      <h2 class="font-semibold text-zinc-900 dark:text-white mb-4">Pricing & Inventory</h2>
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <UFormField label="Price *" class="col-span-1">
          <UInput
            :model-value="form.price"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            size="sm"
            class="w-full"
            @update:model-value="patch({ price: $event })"
          />
        </UFormField>
        <UFormField label="Compare Price" class="col-span-1">
          <UInput
            :model-value="form.compare_price"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            size="sm"
            class="w-full"
            @update:model-value="patch({ compare_price: $event })"
          />
        </UFormField>
        <UFormField label="Stock" class="col-span-1">
          <UInput
            :model-value="form.stock"
            type="number"
            min="0"
            step="1"
            placeholder="0"
            size="sm"
            class="w-full"
            @update:model-value="patch({ stock: $event })"
          />
        </UFormField>
        <UFormField label="SKU *" class="col-span-1">
          <UInput
            :model-value="form.sku"
            placeholder="VLR-001"
            size="sm"
            class="w-full"
            @update:model-value="patch({ sku: $event })"
          />
        </UFormField>
      </div>
    </VCard>

    <!-- ── Organization ──────────────────────────────────────────────────────── -->
    <VCard padding="md">
      <h2 class="font-semibold text-zinc-900 dark:text-white mb-4">Organization</h2>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <UFormField label="Category">
          <USelect
            :model-value="form.category_id"
            :options="categoryOptions"
            option-attribute="label"
            value-attribute="value"
            size="sm"
            class="w-full"
            @update:model-value="patch({ category_id: ($event as string) ?? '' })"
          />
        </UFormField>
        <UFormField label="Brand">
          <UInput
            :model-value="form.brand"
            placeholder="Brand name"
            size="sm"
            class="w-full"
            @update:model-value="patch({ brand: $event })"
          />
        </UFormField>
      </div>

      <!-- Tags -->
      <div class="mt-4">
        <p class="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Tags</p>
        <!-- Current tags -->
        <div v-if="form.tags.length" class="flex flex-wrap gap-1.5 mb-2">
          <span
            v-for="tag in form.tags"
            :key="tag"
            class="inline-flex items-center gap-1 rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:text-zinc-300"
          >
            {{ tag }}
            <button type="button" class="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200" @click="removeTag(tag)">
              <UIcon name="heroicons:x-mark" class="size-3" />
            </button>
          </span>
        </div>
        <div class="flex gap-2">
          <UInput
            v-model="tagInput"
            placeholder="Add tag, press Enter"
            size="sm"
            class="flex-1"
            @keydown="onTagKeydown"
          />
          <UButton type="button" size="sm" color="neutral" variant="outline" icon="heroicons:plus" @click="addTag" />
        </div>
      </div>
    </VCard>

    <!-- ── Images ────────────────────────────────────────────────────────────── -->
    <VCard padding="md">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="font-semibold text-zinc-900 dark:text-white">Images</h2>
          <p class="text-xs text-zinc-400 mt-0.5">Upload files or paste URLs. First image is the thumbnail.</p>
        </div>
        <UButton type="button" size="xs" color="neutral" variant="outline" icon="heroicons:plus" @click="addImage">
          Add slot
        </UButton>
      </div>

      <div class="space-y-3">
        <AdminImageUpload
          v-for="(img, index) in form.images"
          :key="index"
          :model-value="img"
          :index="index"
          @update:model-value="updateImage(index, $event)"
          @remove="removeImage(index)"
        />
      </div>
    </VCard>

    <!-- ── Settings ───────────────────────────────────────────────────────────── -->
    <VCard padding="md">
      <h2 class="font-semibold text-zinc-900 dark:text-white mb-4">Settings</h2>
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-zinc-900 dark:text-white">Active</p>
            <p class="text-xs text-zinc-400">Visible to customers in the store</p>
          </div>
          <USwitch
            :model-value="form.is_active"
            @update:model-value="patch({ is_active: $event })"
          />
        </div>
        <USeparator />
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-zinc-900 dark:text-white">Featured</p>
            <p class="text-xs text-zinc-400">Shown on homepage and featured sections</p>
          </div>
          <USwitch
            :model-value="form.is_featured"
            @update:model-value="patch({ is_featured: $event })"
          />
        </div>
      </div>
    </VCard>

    <!-- ── Submit ─────────────────────────────────────────────────────────────── -->
    <div class="flex justify-end gap-2 pt-2">
      <UButton to="/admin/products" color="neutral" variant="outline">Cancel</UButton>
      <slot name="submit-button">
        <UButton type="submit" :loading="saving" icon="heroicons:check">Save Product</UButton>
      </slot>
    </div>

  </form>
</template>
