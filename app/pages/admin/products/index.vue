<script setup lang="ts">
import type { AdminProductRow } from '~/composables/useAdminProducts'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Products — Velora Admin' })

const search = ref('')
const statusFilter = ref('all')
const page = ref(1)

watch([search, statusFilter], () => { page.value = 1 })

const { products, total, totalPages, pending, refresh } = useAdminProducts({ search, statusFilter, page })

const toast = useToast()

// ── Status toggle ─────────────────────────────────────────────────────────────
const togglingId = ref<string | null>(null)

async function toggleActive(product: AdminProductRow) {
  togglingId.value = product.id
  try {
    await adminToggleProductActive(product.id, !product.is_active)
    await refresh()
  } catch (err: any) {
    toast.add({ title: 'Failed to update product', description: err.message, color: 'error', icon: 'heroicons:x-circle' })
  } finally {
    togglingId.value = null
  }
}

// ── Delete ────────────────────────────────────────────────────────────────────
const deleteTarget = ref<AdminProductRow | null>(null)
const deleteModal = ref(false)
const deleting = ref(false)

function confirmDelete(product: AdminProductRow) {
  deleteTarget.value = product
  deleteModal.value = true
}

async function executeDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    await adminDeleteProduct(deleteTarget.value.id)
    toast.add({ title: 'Product deleted', color: 'success', icon: 'heroicons:trash' })
    deleteModal.value = false
    await refresh()
  } catch (err: any) {
    toast.add({ title: 'Failed to delete product', description: err.message, color: 'error', icon: 'heroicons:x-circle' })
  } finally {
    deleting.value = false
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function productTitle(p: AdminProductRow) {
  return p.translations?.en?.title ?? 'Untitled'
}

function productThumb(p: AdminProductRow) {
  return Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : null
}

function stockColor(stock: number) {
  if (stock === 0) return 'error'
  if (stock < 5) return 'warning'
  return 'success'
}

function formatPrice(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

const statusOptions = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
]

const pageFrom = computed(() => (page.value - 1) * 20 + 1)
const pageTo = computed(() => Math.min(page.value * 20, total.value))
</script>

<template>
  <div class="p-6 lg:p-8 space-y-6">

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="font-display text-2xl font-bold text-zinc-900 dark:text-white">Products</h1>
        <p class="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
          {{ total.toLocaleString() }} product{{ total !== 1 ? 's' : '' }} total
        </p>
      </div>
      <div class="flex items-center gap-2">
        <UButton icon="heroicons:arrow-path" color="neutral" variant="outline" size="sm" :loading="pending" @click="() => refresh()">
          Refresh
        </UButton>
        <UButton to="/admin/products/new" icon="heroicons:plus" size="sm">
          New Product
        </UButton>
      </div>
    </div>

    <!-- Filters -->
    <VCard padding="md">
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="flex-1">
          <UInput
            v-model="search"
            placeholder="Search by title…"
            icon="heroicons:magnifying-glass"
            size="sm"
            :ui="{ root: 'relative flex items-center w-full' }"
          />
        </div>
        <USelect
          v-model="statusFilter"
          :items="statusOptions"
          size="sm"
          class="w-full sm:w-36"
        />
      </div>
    </VCard>

    <!-- Table -->
    <VCard padding="none">

      <!-- Loading -->
      <div v-if="pending" class="divide-y divide-zinc-100 dark:divide-zinc-800">
        <div v-for="i in 8" :key="i" class="flex items-center gap-4 px-5 py-3.5">
          <USkeleton class="size-10 rounded-lg shrink-0" />
          <USkeleton class="h-4 w-40 flex-1" />
          <USkeleton class="h-4 w-16" />
          <USkeleton class="h-5 w-14 rounded-full" />
          <USkeleton class="h-5 w-14 rounded-full" />
          <USkeleton class="h-6 w-10 rounded-full" />
          <USkeleton class="h-8 w-16 rounded-lg" />
        </div>
      </div>

      <!-- Empty -->
      <div v-else-if="!products.length" class="flex flex-col items-center justify-center py-20 text-center">
        <UIcon name="heroicons:tag" class="size-10 text-zinc-200 dark:text-zinc-700 mb-3" />
        <p class="text-sm text-zinc-500 dark:text-zinc-400">No products found</p>
        <div class="flex gap-2 mt-3">
          <UButton v-if="search || statusFilter !== 'all'" variant="ghost" size="sm" @click="search = ''; statusFilter = 'all'">
            Clear filters
          </UButton>
          <UButton to="/admin/products/new" size="sm" icon="heroicons:plus">
            New Product
          </UButton>
        </div>
      </div>

      <!-- Product table -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-zinc-100 dark:border-zinc-800">
              <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Product</th>
              <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">SKU</th>
              <th class="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-400">Price</th>
              <th class="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-zinc-400">Stock</th>
              <th class="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-zinc-400">Featured</th>
              <th class="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-zinc-400">Active</th>
              <th class="px-5 py-3" />
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-100 dark:divide-zinc-800">
            <tr
              v-for="product in products"
              :key="product.id"
              class="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
            >
              <!-- Product name + thumbnail -->
              <td class="px-5 py-3.5">
                <div class="flex items-center gap-3">
                  <div class="size-10 rounded-lg overflow-hidden shrink-0 bg-zinc-100 dark:bg-zinc-800">
                    <img
                      v-if="productThumb(product)"
                      :src="productThumb(product)!"
                      :alt="productTitle(product)"
                      class="size-full object-cover"
                    />
                    <UIcon v-else name="heroicons:photo" class="size-full p-2 text-zinc-400" />
                  </div>
                  <div class="min-w-0">
                    <p class="font-medium text-zinc-900 dark:text-white truncate max-w-50">
                      {{ productTitle(product) }}
                    </p>
                    <p v-if="product.brand" class="text-xs text-zinc-400 truncate">{{ product.brand }}</p>
                  </div>
                </div>
              </td>

              <!-- SKU -->
              <td class="px-5 py-3.5">
                <span class="font-mono text-xs text-zinc-500 dark:text-zinc-400">{{ product.sku }}</span>
              </td>

              <!-- Price -->
              <td class="px-5 py-3.5 text-right">
                <div>
                  <span class="font-semibold text-zinc-900 dark:text-white">{{ formatPrice(product.price) }}</span>
                  <span v-if="product.compare_price" class="ml-1.5 text-xs text-zinc-400 line-through">
                    {{ formatPrice(product.compare_price) }}
                  </span>
                </div>
              </td>

              <!-- Stock -->
              <td class="px-5 py-3.5 text-center">
                <UBadge :color="(stockColor(product.stock) as any)" variant="subtle" size="sm">
                  {{ product.stock === 0 ? 'Out' : product.stock }}
                </UBadge>
              </td>

              <!-- Featured -->
              <td class="px-5 py-3.5 text-center">
                <UIcon
                  :name="product.is_featured ? 'heroicons:star-solid' : 'heroicons:star'"
                  :class="product.is_featured ? 'text-amber-400' : 'text-zinc-300 dark:text-zinc-600'"
                  class="size-4 mx-auto"
                />
              </td>

              <!-- Active toggle -->
              <td class="px-5 py-3.5 text-center">
                <USwitch
                  :model-value="product.is_active"
                  size="sm"
                  :disabled="togglingId === product.id"
                  @update:model-value="() => toggleActive(product)"
                />
              </td>

              <!-- Actions -->
              <td class="px-5 py-3.5 text-right">
                <div class="flex items-center justify-end gap-1">
                  <NuxtLink :to="`/admin/products/${product.id}`">
                    <UButton size="xs" color="neutral" variant="ghost" icon="heroicons:pencil-square" />
                  </NuxtLink>
                  <UButton
                    size="xs"
                    color="error"
                    variant="ghost"
                    icon="heroicons:trash"
                    @click="confirmDelete(product)"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div class="flex items-center justify-between px-5 py-3.5 border-t border-zinc-100 dark:border-zinc-800">
          <p class="text-xs text-zinc-400">
            Showing {{ pageFrom }}–{{ pageTo }} of {{ total.toLocaleString() }}
          </p>
          <div class="flex items-center gap-1.5">
            <UButton size="xs" color="neutral" variant="outline" icon="heroicons:chevron-left" :disabled="page <= 1" @click="page--" />
            <span class="text-xs font-medium text-zinc-600 dark:text-zinc-400 px-2">{{ page }} / {{ totalPages }}</span>
            <UButton size="xs" color="neutral" variant="outline" icon="heroicons:chevron-right" :disabled="page >= totalPages" @click="page++" />
          </div>
        </div>
      </div>
    </VCard>

    <!-- Delete confirmation modal -->
    <UModal v-model:open="deleteModal">
      <template #content>
        <div class="p-6 space-y-4">
          <div class="flex items-start gap-4">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 dark:bg-red-950">
              <UIcon name="heroicons:trash" class="size-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 class="font-semibold text-zinc-900 dark:text-white">Delete Product</h3>
              <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Are you sure you want to delete
                <span class="font-medium text-zinc-700 dark:text-zinc-300">{{ deleteTarget ? productTitle(deleteTarget) : '' }}</span>?
                This action cannot be undone.
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
