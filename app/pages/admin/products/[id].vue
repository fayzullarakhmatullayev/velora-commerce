<script setup lang="ts">
import { productToForm, formToPayload, useAdminCategories } from '~/composables/useAdminProductForm'
import type { ProductFormState } from '~/composables/useAdminProductForm'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const route = useRoute()
const id = route.params.id as string

const supabase = useSupabase()
const toast = useToast()

// ── Load existing product ──────────────────────────────────────────────────────
import type { Database } from '~/types/database.types'
type Product = Database['public']['Tables']['products']['Row']

const { data: product, pending } = useAsyncData(
  `admin-product-edit-${id}`,
  async () => {
    const { data, error } = await supabase.from('products').select('*').eq('id', id).single()
    if (error) throw error
    return data as Product
  },
  { getCachedData: () => undefined },
)

useSeoMeta({
  title: computed(() =>
    product.value
      ? `Edit "${product.value.translations?.en?.title ?? 'Product'}" — Velora Admin`
      : 'Edit Product — Velora Admin',
  ),
})

const form = ref<ProductFormState | null>(null)

watch(
  product,
  (p) => {
    if (p && !form.value) {
      form.value = productToForm(p as any)
    }
  },
  { immediate: true },
)

const { data: categories } = useAdminCategories()

// ── Save ───────────────────────────────────────────────────────────────────────
const saving = ref(false)

async function save() {
  if (!form.value) return
  const payload = formToPayload(form.value)

  if (!payload.sku) {
    toast.add({ title: 'SKU is required', color: 'error', icon: 'heroicons:exclamation-circle' })
    return
  }
  if (!form.value.translations.en.title.trim()) {
    toast.add({
      title: 'English title is required',
      color: 'error',
      icon: 'heroicons:exclamation-circle',
    })
    return
  }

  saving.value = true
  try {
    const { error } = await (supabase.from('products') as any).update(payload).eq('id', id)
    if (error) throw error
    toast.add({ title: 'Product saved', color: 'success', icon: 'heroicons:check-circle' })
  } catch (err: any) {
    toast.add({
      title: 'Failed to save product',
      description: err.message,
      color: 'error',
      icon: 'heroicons:x-circle',
    })
  } finally {
    saving.value = false
  }
}

// ── Delete ────────────────────────────────────────────────────────────────────
const deleteModal = ref(false)
const deleting = ref(false)

async function executeDelete() {
  deleting.value = true
  try {
    await adminDeleteProduct(id)
    toast.add({ title: 'Product deleted', color: 'success', icon: 'heroicons:trash' })
    await navigateTo('/admin/products')
  } catch (err: any) {
    toast.add({
      title: 'Failed to delete product',
      description: err.message,
      color: 'error',
      icon: 'heroicons:x-circle',
    })
  } finally {
    deleting.value = false
    deleteModal.value = false
  }
}
</script>

<template>
  <div class="p-6 lg:p-8 space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="flex items-center gap-3">
        <UButton
          to="/admin/products"
          color="neutral"
          variant="ghost"
          icon="heroicons:arrow-left"
          size="sm"
        />
        <div>
          <h1 class="font-display text-2xl font-bold text-zinc-900 dark:text-white">
            <span v-if="product">{{ product.translations?.en?.title ?? 'Edit Product' }}</span>
            <USkeleton v-else class="inline-block h-7 w-48 align-middle" />
          </h1>
          <p v-if="product" class="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400 font-mono">
            {{ product.id }}
          </p>
        </div>
      </div>
      <UButton
        color="error"
        variant="ghost"
        icon="heroicons:trash"
        size="sm"
        @click="deleteModal = true"
      >
        Delete
      </UButton>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="space-y-4">
      <USkeleton class="h-64 w-full rounded-xl" />
      <USkeleton class="h-36 w-full rounded-xl" />
      <USkeleton class="h-24 w-full rounded-xl" />
    </div>

    <!-- Form -->
    <AdminProductForm
      v-else-if="form"
      v-model="form"
      :categories="categories ?? []"
      :saving="saving"
      @submit="save"
    >
      <template #submit-button>
        <UButton type="submit" :loading="saving" icon="heroicons:check">Save Changes</UButton>
      </template>
    </AdminProductForm>

    <!-- Delete modal -->
    <UModal v-model:open="deleteModal">
      <template #content>
        <div class="p-6 space-y-4">
          <div class="flex items-start gap-4">
            <div
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 dark:bg-red-950"
            >
              <UIcon name="heroicons:trash" class="size-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 class="font-semibold text-zinc-900 dark:text-white">Delete Product</h3>
              <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Are you sure you want to delete
                <span class="font-medium text-zinc-700 dark:text-zinc-300">{{
                  product?.translations?.en?.title
                }}</span
                >? This cannot be undone.
              </p>
            </div>
          </div>
          <div class="flex justify-end gap-2 pt-2">
            <UButton color="neutral" variant="outline" @click="deleteModal = false">Cancel</UButton>
            <UButton color="error" :loading="deleting" icon="heroicons:trash" @click="executeDelete"
              >Delete</UButton
            >
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
