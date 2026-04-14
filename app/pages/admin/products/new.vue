<script setup lang="ts">
import { emptyForm, formToPayload, useAdminCategories } from '~/composables/useAdminProductForm'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'New Product — Velora Admin' })

const supabase = useSupabase()
const toast = useToast()

const form = ref(emptyForm())
const saving = ref(false)

const { data: categories } = useAdminCategories()

async function save() {
  const payload = formToPayload(form.value)

  if (!payload.sku) {
    toast.add({ title: 'SKU is required', color: 'error', icon: 'heroicons:exclamation-circle' })
    return
  }
  if (!payload.price) {
    toast.add({ title: 'Price is required', color: 'error', icon: 'heroicons:exclamation-circle' })
    return
  }
  if (!form.value.translations.en.title.trim()) {
    toast.add({ title: 'English title is required', color: 'error', icon: 'heroicons:exclamation-circle' })
    return
  }

  saving.value = true
  try {
    const { data, error } = await supabase.from('products').insert(payload as any).select('id').single()
    if (error) throw error
    toast.add({ title: 'Product created', color: 'success', icon: 'heroicons:check-circle' })
    await navigateTo(`/admin/products/${(data as any).id}`)
  } catch (err: any) {
    toast.add({ title: 'Failed to save product', description: err.message, color: 'error', icon: 'heroicons:x-circle' })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="p-6 lg:p-8 space-y-6">

    <!-- Header -->
    <div class="flex items-center gap-3">
      <UButton to="/admin/products" color="neutral" variant="ghost" icon="heroicons:arrow-left" size="sm" />
      <div>
        <h1 class="font-display text-2xl font-bold text-zinc-900 dark:text-white">New Product</h1>
        <p class="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">Fill in the details below to create a new product.</p>
      </div>
    </div>

    <AdminProductForm
      v-model="form"
      :categories="categories ?? []"
      :saving="saving"
      @submit="save"
    />

  </div>
</template>
