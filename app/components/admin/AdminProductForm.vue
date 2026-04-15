<script setup lang="ts">
import type { ProductFormState } from '~/composables/useAdminProductForm'

const props = defineProps<{
  modelValue: ProductFormState
  categories: { id: string; translations: Record<string, { name: string }>; slug: string }[]
  saving?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [val: ProductFormState]
  submit: []
}>()

const form = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

// Convenience patcher — mutate only the changed key
function patch(updates: Partial<ProductFormState>) {
  emit('update:modelValue', { ...props.modelValue, ...updates })
}
function patchTranslation(
  locale: 'en' | 'uz' | 'ru',
  updates: Partial<ProductFormState['translations']['en']>,
) {
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
  { label: 'No category', value: 'none' },
  ...props.categories.map((c) => ({
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
  patch({ tags: props.modelValue.tags.filter((t) => t !== tag) })
}
function onTagKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault()
    addTag()
  }
}

// ── Variants ──────────────────────────────────────────────────────────────────
const hasVariants = computed(() => props.modelValue.variantOption.values.length > 0)

// Preset suggestion groups keyed by option name (case-insensitive match)
const presetGroups: Record<string, string[]> = {
  size:         ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
  'shoe size':  ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
  color:        ['Black', 'White', 'Gray', 'Navy', 'Red', 'Green', 'Blue', 'Yellow', 'Pink', 'Brown'],
  storage:      ['64GB', '128GB', '256GB', '512GB', '1TB'],
  ram:          ['4GB', '8GB', '16GB', '32GB', '64GB'],
  material:     ['Cotton', 'Polyester', 'Wool', 'Linen', 'Silk', 'Leather'],
  weight:       ['250g', '500g', '1kg', '2kg', '5kg'],
}

const currentPresets = computed(() => {
  const key = props.modelValue.variantOption.optionName.toLowerCase().trim()
  return presetGroups[key] ?? []
})

const addedValues = computed(() => props.modelValue.variantOption.values.map(v => v.value))

function patchVariantOption(updates: Partial<ProductFormState['variantOption']>) {
  patch({
    variantOption: { ...props.modelValue.variantOption, ...updates },
  })
}

function addPreset(value: string) {
  if (addedValues.value.includes(value)) return
  patchVariantOption({
    values: [...props.modelValue.variantOption.values, { value, stock: 0 }],
  })
}

function removeVariantValue(index: number) {
  const vals = [...props.modelValue.variantOption.values]
  vals.splice(index, 1)
  patchVariantOption({ values: vals })
}

function updateVariantStock(index: number, stock: number) {
  const vals = props.modelValue.variantOption.values.map((v, i) =>
    i === index ? { ...v, stock: Math.max(0, stock) } : v,
  )
  patchVariantOption({ values: vals })
}

function updateVariantValue(index: number, value: string) {
  const vals = props.modelValue.variantOption.values.map((v, i) =>
    i === index ? { ...v, value } : v,
  )
  patchVariantOption({ values: vals })
}

const newValueInput = ref('')
function addCustomValue() {
  const val = newValueInput.value.trim()
  if (!val || addedValues.value.includes(val)) return
  patchVariantOption({
    values: [...props.modelValue.variantOption.values, { value: val, stock: 0 }],
  })
  newValueInput.value = ''
}
function onValueKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') { e.preventDefault(); addCustomValue() }
}

const totalVariantStock = computed(() =>
  props.modelValue.variantOption.values.reduce((s, v) => s + (v.stock || 0), 0),
)
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
            :class="
              activeLocale === tab.key
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
            "
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
        <!-- Stock: locked when variants manage it -->
        <UFormField label="Stock" class="col-span-1">
          <UInput
            :model-value="hasVariants ? String(totalVariantStock) : form.stock"
            type="number"
            min="0"
            step="1"
            placeholder="0"
            size="sm"
            class="w-full"
            :disabled="hasVariants"
            @update:model-value="!hasVariants && patch({ stock: $event })"
          />
          <p v-if="hasVariants" class="mt-1 text-[11px] text-zinc-400">
            Managed by variants below
          </p>
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

    <!-- ── Variants (Options) ───────────────────────────────────────────────── -->
    <VCard padding="md">
      <div class="flex items-start justify-between mb-4">
        <div>
          <h2 class="font-semibold text-zinc-900 dark:text-white">Variants</h2>
          <p class="text-xs text-zinc-400 mt-0.5">
            Add options like size, color, or storage. Each gets its own stock count.
          </p>
        </div>
        <UBadge v-if="hasVariants" color="success" variant="subtle" size="sm">
          {{ form.variantOption.values.length }} variant{{ form.variantOption.values.length === 1 ? '' : 's' }}
        </UBadge>
      </div>

      <!-- Option name -->
      <div class="mb-4">
        <p class="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Option Name</p>
        <div class="flex flex-wrap gap-2 mb-2">
          <button
            v-for="preset in ['Size', 'Color', 'Storage', 'Material', 'RAM', 'Shoe Size', 'Weight']"
            :key="preset"
            type="button"
            class="px-3 py-1 rounded-full text-xs font-medium border transition-colors"
            :class="form.variantOption.optionName === preset
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300'
              : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400'"
            @click="patchVariantOption({ optionName: preset })"
          >
            {{ preset }}
          </button>
        </div>
        <UInput
          :model-value="form.variantOption.optionName"
          placeholder="Custom option name…"
          size="sm"
          class="w-48"
          @update:model-value="patchVariantOption({ optionName: $event })"
        />
      </div>

      <!-- Preset value quick-add -->
      <div v-if="currentPresets.length" class="mb-4">
        <p class="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
          Quick Add — {{ form.variantOption.optionName }}
        </p>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="preset in currentPresets"
            :key="preset"
            type="button"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all"
            :class="addedValues.includes(preset)
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300 cursor-default'
              : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-primary-400 hover:text-primary-600'"
            :disabled="addedValues.includes(preset)"
            @click="addPreset(preset)"
          >
            <UIcon v-if="addedValues.includes(preset)" name="heroicons:check" class="size-3 mr-1" />
            {{ preset }}
          </button>
        </div>
      </div>

      <!-- Variant value rows -->
      <div v-if="hasVariants" class="mb-4 space-y-2">
        <div class="grid grid-cols-[1fr_120px_32px] gap-2 mb-1">
          <p class="text-xs font-medium text-zinc-400 uppercase tracking-wider">{{ form.variantOption.optionName }}</p>
          <p class="text-xs font-medium text-zinc-400 uppercase tracking-wider">Stock</p>
          <span />
        </div>

        <div
          v-for="(v, index) in form.variantOption.values"
          :key="index"
          class="grid grid-cols-[1fr_120px_32px] gap-2 items-center"
        >
          <UInput
            :model-value="v.value"
            size="sm"
            :placeholder="`${form.variantOption.optionName} value`"
            @update:model-value="updateVariantValue(index, $event)"
          />
          <UInput
            :model-value="String(v.stock)"
            type="number"
            min="0"
            step="1"
            size="sm"
            placeholder="0"
            @update:model-value="updateVariantStock(index, parseInt($event) || 0)"
          />
          <button
            type="button"
            class="flex items-center justify-center size-8 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
            @click="removeVariantValue(index)"
          >
            <UIcon name="heroicons:x-mark" class="size-4" />
          </button>
        </div>

        <!-- Total stock indicator -->
        <div class="flex justify-end pt-1 border-t border-zinc-100 dark:border-zinc-800 mt-3">
          <p class="text-xs text-zinc-500">
            Total stock: <span class="font-semibold text-zinc-900 dark:text-white">{{ totalVariantStock }}</span>
          </p>
        </div>
      </div>

      <!-- Add custom value -->
      <div class="flex gap-2">
        <UInput
          v-model="newValueInput"
          :placeholder="`Add ${form.variantOption.optionName} value…`"
          size="sm"
          class="flex-1"
          @keydown="onValueKeydown"
        />
        <UButton
          type="button"
          size="sm"
          color="neutral"
          variant="outline"
          icon="heroicons:plus"
          @click="addCustomValue"
        >
          Add
        </UButton>
      </div>

      <p v-if="!hasVariants" class="mt-3 text-xs text-zinc-400">
        No variants added — product uses the global stock field above.
      </p>
    </VCard>

    <!-- ── Organization ──────────────────────────────────────────────────────── -->
    <VCard padding="md">
      <h2 class="font-semibold text-zinc-900 dark:text-white mb-4">Organization</h2>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <UFormField label="Category">
          <USelect
            :model-value="form.category_id"
            :items="categoryOptions"
            size="sm"
            class="w-full"
            @update:model-value="patch({ category_id: ($event as string) === 'none' ? '' : (($event as string) ?? '') })"
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
            <button
              type="button"
              class="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              @click="removeTag(tag)"
            >
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
          <UButton
            type="button"
            size="sm"
            color="neutral"
            variant="outline"
            icon="heroicons:plus"
            @click="addTag"
          />
        </div>
      </div>
    </VCard>

    <!-- ── Images ────────────────────────────────────────────────────────────── -->
    <VCard padding="md">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="font-semibold text-zinc-900 dark:text-white">Images</h2>
          <p class="text-xs text-zinc-400 mt-0.5">
            Upload files or paste URLs. First image is the thumbnail.
          </p>
        </div>
        <UButton
          type="button"
          size="xs"
          color="neutral"
          variant="outline"
          icon="heroicons:plus"
          @click="addImage"
        >
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
