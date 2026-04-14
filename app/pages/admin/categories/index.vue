<script setup lang="ts">
import type { Database } from '~/types/database.types'

type Category = Database['public']['Tables']['categories']['Row']

definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Categories — Velora Admin' })

const supabase = useSupabase()
const toast = useToast()

// ── Fetch ──────────────────────────────────────────────────────────────────────
const { data, pending, refresh } = useAsyncData('admin-categories-list', async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error) throw error
  return data as Category[]
}, { getCachedData: () => undefined })

const categories = computed(() => data.value ?? [])

// Parent name lookup
function parentName(parentId: string | null) {
  if (!parentId) return null
  const parent = categories.value.find(c => c.id === parentId)
  return parent ? (parent.translations?.en?.name ?? parent.slug) : null
}

// ── Toggle active ──────────────────────────────────────────────────────────────
const togglingId = ref<string | null>(null)

async function toggleActive(cat: Category) {
  togglingId.value = cat.id
  try {
    const { error } = await (supabase.from('categories') as any)
      .update({ is_active: !cat.is_active })
      .eq('id', cat.id)
    if (error) throw error
    await refresh()
  } catch (err: any) {
    toast.add({ title: 'Failed to update', description: err.message, color: 'error', icon: 'heroicons:x-circle' })
  } finally {
    togglingId.value = null
  }
}

// ── Delete ─────────────────────────────────────────────────────────────────────
const deleteTarget = ref<Category | null>(null)
const deleteModal = ref(false)
const deleting = ref(false)

async function executeDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    const { error } = await supabase.from('categories').delete().eq('id', deleteTarget.value.id)
    if (error) throw error
    toast.add({ title: 'Category deleted', color: 'success', icon: 'heroicons:trash' })
    deleteModal.value = false
    await refresh()
  } catch (err: any) {
    toast.add({ title: 'Failed to delete', description: err.message, color: 'error', icon: 'heroicons:x-circle' })
  } finally {
    deleting.value = false
  }
}

// ── Create / Edit modal ────────────────────────────────────────────────────────
const formModal = ref(false)
const editTarget = ref<Category | null>(null)
const saving = ref(false)

const emptyDraft = (): CategoryDraft => ({
  slug: '',
  sort_order: categories.value.length,
  parent_id: 'none',
  image: '',
  is_active: true,
  translations: {
    en: { name: '', description: '' },
    uz: { name: '', description: '' },
    ru: { name: '', description: '' },
  },
})

interface CategoryDraft {
  slug: string
  sort_order: number
  parent_id: string
  image: string
  is_active: boolean
  translations: {
    en: { name: string; description: string }
    uz: { name: string; description: string }
    ru: { name: string; description: string }
  }
}

const draft = ref<CategoryDraft>(emptyDraft())
const activeLocale = ref<'en' | 'uz' | 'ru'>('en')

const localeTabs = [
  { key: 'en' as const, label: 'English' },
  { key: 'uz' as const, label: 'Uzbek' },
  { key: 'ru' as const, label: 'Russian' },
]

function openCreate() {
  editTarget.value = null
  draft.value = emptyDraft()
  activeLocale.value = 'en'
  formModal.value = true
}

function openEdit(cat: Category) {
  editTarget.value = cat
  draft.value = {
    slug: cat.slug ?? '',
    sort_order: cat.sort_order ?? 0,
    parent_id: cat.parent_id ?? 'none',
    image: cat.image ?? '',
    is_active: cat.is_active,
    translations: {
      en: { name: cat.translations?.en?.name ?? '', description: cat.translations?.en?.description ?? '' },
      uz: { name: cat.translations?.uz?.name ?? '', description: cat.translations?.uz?.description ?? '' },
      ru: { name: cat.translations?.ru?.name ?? '', description: cat.translations?.ru?.description ?? '' },
    },
  }
  activeLocale.value = 'en'
  formModal.value = true
}

// Auto-slug from EN name
watch(() => draft.value.translations.en.name, (name) => {
  if (!editTarget.value && !draft.value.slug) {
    draft.value.slug = slugify(name)
  }
})

async function saveCategory() {
  if (!draft.value.translations.en.name.trim()) {
    toast.add({ title: 'English name is required', color: 'error', icon: 'heroicons:exclamation-circle' })
    return
  }
  if (!draft.value.slug.trim()) {
    toast.add({ title: 'Slug is required', color: 'error', icon: 'heroicons:exclamation-circle' })
    return
  }

  saving.value = true
  try {
    const payload = {
      slug: draft.value.slug.trim(),
      sort_order: Number(draft.value.sort_order) || 0,
      parent_id: (draft.value.parent_id && draft.value.parent_id !== 'none') ? draft.value.parent_id : null,
      image: draft.value.image.trim() || null,
      is_active: draft.value.is_active,
      translations: draft.value.translations,
    }

    if (editTarget.value) {
      const { error } = await (supabase.from('categories') as any).update(payload).eq('id', editTarget.value.id)
      if (error) throw error
      toast.add({ title: 'Category updated', color: 'success', icon: 'heroicons:check-circle' })
    } else {
      const { error } = await supabase.from('categories').insert(payload as any)
      if (error) throw error
      toast.add({ title: 'Category created', color: 'success', icon: 'heroicons:check-circle' })
    }

    await nextTick()
    formModal.value = false
    refresh()
  } catch (err: any) {
    toast.add({ title: 'Failed to save', description: err.message, color: 'error', icon: 'heroicons:x-circle' })
  } finally {
    saving.value = false
  }
}

// Parent options for select
const parentOptions = computed(() => [
  { label: 'No parent (top-level)', value: 'none' },
  ...categories.value
    .filter(c => c.id !== editTarget.value?.id)
    .map(c => ({ label: c.translations?.en?.name ?? c.slug, value: c.id })),
])

function catName(cat: Category) {
  return cat.translations?.en?.name ?? cat.slug
}
</script>

<template>
  <div class="p-6 lg:p-8 space-y-6">

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="font-display text-2xl font-bold text-zinc-900 dark:text-white">Categories</h1>
        <p class="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
          {{ categories.length }} categor{{ categories.length !== 1 ? 'ies' : 'y' }}
        </p>
      </div>
      <UButton icon="heroicons:plus" size="sm" @click="openCreate">New Category</UButton>
    </div>

    <!-- Table -->
    <VCard padding="none">

      <!-- Loading -->
      <div v-if="pending" class="divide-y divide-zinc-100 dark:divide-zinc-800">
        <div v-for="i in 5" :key="i" class="flex items-center gap-4 px-5 py-3.5">
          <USkeleton class="size-10 rounded-lg shrink-0" />
          <USkeleton class="h-4 w-40 flex-1" />
          <USkeleton class="h-4 w-24" />
          <USkeleton class="h-4 w-16" />
          <USkeleton class="h-6 w-10 rounded-full" />
          <USkeleton class="h-8 w-16 rounded-lg" />
        </div>
      </div>

      <!-- Empty -->
      <div v-else-if="!categories.length" class="flex flex-col items-center justify-center py-20 text-center">
        <UIcon name="heroicons:squares-plus" class="size-10 text-zinc-200 dark:text-zinc-700 mb-3" />
        <p class="text-sm text-zinc-500 dark:text-zinc-400">No categories yet</p>
        <UButton size="sm" class="mt-3" icon="heroicons:plus" @click="openCreate">Create first category</UButton>
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-zinc-100 dark:border-zinc-800">
              <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Category</th>
              <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Slug</th>
              <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Parent</th>
              <th class="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-zinc-400">Order</th>
              <th class="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-zinc-400">Active</th>
              <th class="px-5 py-3" />
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-100 dark:divide-zinc-800">
            <tr
              v-for="cat in categories"
              :key="cat.id"
              class="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
            >
              <!-- Name + image -->
              <td class="px-5 py-3.5">
                <div class="flex items-center gap-3">
                  <div class="size-10 rounded-lg overflow-hidden shrink-0 bg-zinc-100 dark:bg-zinc-800">
                    <img v-if="cat.image" :src="cat.image" :alt="catName(cat)" class="size-full object-cover" />
                    <UIcon v-else name="heroicons:squares-plus" class="size-full p-2.5 text-zinc-400" />
                  </div>
                  <div>
                    <p class="font-medium text-zinc-900 dark:text-white">{{ catName(cat) }}</p>
                    <p v-if="cat.translations?.uz?.name" class="text-xs text-zinc-400">{{ cat.translations.uz.name }}</p>
                  </div>
                </div>
              </td>

              <!-- Slug -->
              <td class="px-5 py-3.5">
                <span class="font-mono text-xs text-zinc-500 dark:text-zinc-400">{{ cat.slug }}</span>
              </td>

              <!-- Parent -->
              <td class="px-5 py-3.5 text-xs text-zinc-500 dark:text-zinc-400">
                {{ parentName(cat.parent_id) ?? '—' }}
              </td>

              <!-- Sort order -->
              <td class="px-5 py-3.5 text-center text-xs text-zinc-500 dark:text-zinc-400">
                {{ cat.sort_order }}
              </td>

              <!-- Active -->
              <td class="px-5 py-3.5 text-center">
                <USwitch
                  :model-value="cat.is_active"
                  :disabled="togglingId === cat.id"
                  size="sm"
                  @update:model-value="() => toggleActive(cat)"
                />
              </td>

              <!-- Actions -->
              <td class="px-5 py-3.5 text-right">
                <div class="flex items-center justify-end gap-1">
                  <UButton size="xs" color="neutral" variant="ghost" icon="heroicons:pencil-square" @click="openEdit(cat)" />
                  <UButton size="xs" color="error" variant="ghost" icon="heroicons:trash" @click="deleteTarget = cat; deleteModal = true" />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </VCard>

    <!-- ── Create / Edit modal ───────────────────────────────────────────────── -->
    <UModal v-model:open="formModal">
      <template #content>
        <div class="p-6 space-y-5 max-h-[90vh] overflow-y-auto">
          <h2 class="font-semibold text-lg text-zinc-900 dark:text-white">
            {{ editTarget ? `Edit "${catName(editTarget)}"` : 'New Category' }}
          </h2>

          <!-- Locale tabs -->
          <div>
            <div class="flex items-center gap-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 p-0.5 w-fit mb-4">
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

            <div v-for="tab in localeTabs" :key="tab.key" class="space-y-3">
              <template v-if="activeLocale === tab.key">
                <UFormField :label="`Name (${tab.label}) *`">
                  <UInput
                    v-model="draft.translations[tab.key].name"
                    :placeholder="`Category name in ${tab.label}`"
                    size="sm"
                    :ui="{ root: 'relative flex items-center w-full' }"
                  />
                </UFormField>
                <UFormField :label="`Description (${tab.label})`">
                  <UTextarea
                    v-model="draft.translations[tab.key].description"
                    :placeholder="`Short description in ${tab.label}`"
                    :rows="2"
                    size="sm"
                    class="w-full"
                  />
                </UFormField>
              </template>
            </div>
          </div>

          <USeparator />

          <div class="grid grid-cols-2 gap-4">
            <!-- Slug -->
            <UFormField label="Slug *" class="col-span-2">
              <UInput
                v-model="draft.slug"
                placeholder="category-slug"
                size="sm"
                :ui="{ root: 'relative flex items-center w-full' }"
              />
            </UFormField>

            <!-- Parent -->
            <UFormField label="Parent Category" class="col-span-2">
              <USelect
                v-model="draft.parent_id"
                :items="parentOptions"
                size="sm"
                class="w-full"
              />
            </UFormField>

            <!-- Sort order -->
            <UFormField label="Sort Order">
              <UInput
                v-model="draft.sort_order"
                type="number"
                min="0"
                size="sm"
                :ui="{ root: 'relative flex items-center w-full' }"
              />
            </UFormField>

            <!-- Image upload -->
            <div class="col-span-2">
              <p class="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Image</p>
              <AdminImageUpload
                :model-value="draft.image"
                :index="0"
                bucket="categories"
                @update:model-value="draft.image = $event"
                @remove="draft.image = ''"
              />
            </div>

            <!-- Active -->
            <div class="col-span-2 flex items-center justify-between rounded-lg bg-zinc-50 dark:bg-zinc-800 px-4 py-3">
              <p class="text-sm font-medium text-zinc-900 dark:text-white">Active</p>
              <USwitch v-model="draft.is_active" />
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <UButton color="neutral" variant="outline" @click="formModal = false">Cancel</UButton>
            <UButton :loading="saving" icon="heroicons:check" @click="saveCategory">
              {{ editTarget ? 'Save Changes' : 'Create Category' }}
            </UButton>
          </div>
        </div>
      </template>
    </UModal>

    <!-- ── Delete modal ──────────────────────────────────────────────────────── -->
    <UModal v-model:open="deleteModal">
      <template #content>
        <div class="p-6 space-y-4">
          <div class="flex items-start gap-4">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 dark:bg-red-950">
              <UIcon name="heroicons:trash" class="size-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 class="font-semibold text-zinc-900 dark:text-white">Delete Category</h3>
              <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Delete
                <span class="font-medium text-zinc-800 dark:text-zinc-200">{{ deleteTarget ? catName(deleteTarget) : '' }}</span>?
                Products in this category will become uncategorized.
              </p>
            </div>
          </div>
          <div class="flex justify-end gap-2 pt-2">
            <UButton color="neutral" variant="outline" @click="deleteModal = false">Cancel</UButton>
            <UButton color="error" :loading="deleting" icon="heroicons:trash" @click="executeDelete">Delete</UButton>
          </div>
        </div>
      </template>
    </UModal>

  </div>
</template>
