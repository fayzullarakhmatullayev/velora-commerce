<script setup lang="ts">
import type { Database } from '~/types/database.types'

type Coupon = Database['public']['Tables']['coupons']['Row']

definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Coupons — Velora Admin' })

const supabase = useSupabase()
const toast = useToast()

// ── Fetch ──────────────────────────────────────────────────────────────────────
const search = ref('')
const statusFilter = ref('all')

watch([search, statusFilter], () => refresh())

const { data, pending, refresh } = useAsyncData('admin-coupons', async () => {
  let query = supabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false })

  if (search.value.trim()) {
    query = query.ilike('code', `%${search.value.trim()}%`)
  }
  if (statusFilter.value === 'active') query = query.eq('is_active', true)
  if (statusFilter.value === 'inactive') query = query.eq('is_active', false)

  const { data, error } = await query
  if (error) throw error
  return data as Coupon[]
}, { getCachedData: () => undefined })

const coupons = computed(() => data.value ?? [])

// ── Toggle active ──────────────────────────────────────────────────────────────
const togglingId = ref<string | null>(null)

async function toggleActive(coupon: Coupon) {
  togglingId.value = coupon.id
  try {
    const { error } = await (supabase.from('coupons') as any)
      .update({ is_active: !coupon.is_active })
      .eq('id', coupon.id)
    if (error) throw error
    await refresh()
  } catch (err: any) {
    toast.add({ title: 'Failed to update coupon', description: err.message, color: 'error', icon: 'heroicons:x-circle' })
  } finally {
    togglingId.value = null
  }
}

// ── Delete ─────────────────────────────────────────────────────────────────────
const deleteTarget = ref<Coupon | null>(null)
const deleteModal = ref(false)
const deleting = ref(false)

async function executeDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    const { error } = await supabase.from('coupons').delete().eq('id', deleteTarget.value.id)
    if (error) throw error
    toast.add({ title: 'Coupon deleted', color: 'success', icon: 'heroicons:trash' })
    deleteModal.value = false
    await refresh()
  } catch (err: any) {
    toast.add({ title: 'Failed to delete', description: err.message, color: 'error', icon: 'heroicons:x-circle' })
  } finally {
    deleting.value = false
  }
}

// ── Create coupon ──────────────────────────────────────────────────────────────
const createModal = ref(false)
const saving = ref(false)

const emptyDraft = () => ({
  code: '',
  type: 'percentage' as 'percentage' | 'fixed',
  value: '',
  min_order_amount: '',
  max_uses: '',
  expires_at: '',
  is_active: true,
})

const draft = ref(emptyDraft())

function openCreate() {
  draft.value = emptyDraft()
  createModal.value = true
}

async function saveCoupon() {
  if (!draft.value.code.trim()) {
    toast.add({ title: 'Coupon code is required', color: 'error', icon: 'heroicons:exclamation-circle' })
    return
  }
  const val = parseFloat(draft.value.value)
  if (isNaN(val) || val <= 0) {
    toast.add({ title: 'Discount value must be greater than 0', color: 'error', icon: 'heroicons:exclamation-circle' })
    return
  }
  if (draft.value.type === 'percentage' && val > 100) {
    toast.add({ title: 'Percentage cannot exceed 100', color: 'error', icon: 'heroicons:exclamation-circle' })
    return
  }

  saving.value = true
  try {
    const payload = {
      code: draft.value.code.trim().toUpperCase(),
      type: draft.value.type,
      value: val,
      min_order_amount: draft.value.min_order_amount ? parseFloat(draft.value.min_order_amount) : null,
      max_uses: draft.value.max_uses ? parseInt(draft.value.max_uses) : null,
      expires_at: draft.value.expires_at || null,
      is_active: draft.value.is_active,
    }

    const { error } = await supabase.from('coupons').insert(payload as any)
    if (error) throw error

    toast.add({ title: 'Coupon created', color: 'success', icon: 'heroicons:check-circle' })
    createModal.value = false
    await refresh()
  } catch (err: any) {
    toast.add({ title: 'Failed to create coupon', description: err.message, color: 'error', icon: 'heroicons:x-circle' })
  } finally {
    saving.value = false
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function formatDiscount(coupon: Coupon) {
  return coupon.type === 'percentage'
    ? `${coupon.value}%`
    : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(coupon.value)
}

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function isExpired(d: string | null) {
  if (!d) return false
  return new Date(d) < new Date()
}

const statusOptions = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
]

const typeOptions = [
  { label: 'Percentage (%)', value: 'percentage' },
  { label: 'Fixed ($)', value: 'fixed' },
]
</script>

<template>
  <div class="p-6 lg:p-8 space-y-6">

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="font-display text-2xl font-bold text-zinc-900 dark:text-white">Coupons</h1>
        <p class="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
          {{ coupons.length }} coupon{{ coupons.length !== 1 ? 's' : '' }}
        </p>
      </div>
      <UButton icon="heroicons:plus" size="sm" @click="openCreate">New Coupon</UButton>
    </div>

    <!-- Filters -->
    <VCard padding="md">
      <div class="flex flex-col sm:flex-row gap-3">
        <UInput
          v-model="search"
          placeholder="Search by code…"
          icon="heroicons:magnifying-glass"
          size="sm"
          :ui="{ root: 'relative flex items-center w-full' }"
        />
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
        <div v-for="i in 5" :key="i" class="flex items-center gap-4 px-5 py-3.5">
          <USkeleton class="h-4 w-28" />
          <USkeleton class="h-5 w-16 rounded-full" />
          <USkeleton class="h-4 w-16 flex-1" />
          <USkeleton class="h-4 w-20" />
          <USkeleton class="h-4 w-20" />
          <USkeleton class="h-6 w-10 rounded-full" />
          <USkeleton class="h-8 w-8 rounded-lg" />
        </div>
      </div>

      <!-- Empty -->
      <div v-else-if="!coupons.length" class="flex flex-col items-center justify-center py-20 text-center">
        <UIcon name="heroicons:ticket" class="size-10 text-zinc-200 dark:text-zinc-700 mb-3" />
        <p class="text-sm text-zinc-500 dark:text-zinc-400">No coupons found</p>
        <UButton size="sm" class="mt-3" icon="heroicons:plus" @click="openCreate">Create first coupon</UButton>
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-zinc-100 dark:border-zinc-800">
              <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Code</th>
              <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Type</th>
              <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Discount</th>
              <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Min Order</th>
              <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Uses</th>
              <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Expires</th>
              <th class="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-zinc-400">Active</th>
              <th class="px-5 py-3" />
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-100 dark:divide-zinc-800">
            <tr
              v-for="coupon in coupons"
              :key="coupon.id"
              class="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
            >
              <!-- Code -->
              <td class="px-5 py-3.5">
                <span class="font-mono font-semibold text-zinc-900 dark:text-white tracking-wider">
                  {{ coupon.code }}
                </span>
              </td>

              <!-- Type badge -->
              <td class="px-5 py-3.5">
                <UBadge
                  :color="coupon.type === 'percentage' ? 'info' : 'success'"
                  variant="subtle"
                  size="sm"
                >
                  {{ coupon.type === 'percentage' ? '%' : '$' }} {{ coupon.type }}
                </UBadge>
              </td>

              <!-- Discount value -->
              <td class="px-5 py-3.5 font-semibold text-zinc-900 dark:text-white">
                {{ formatDiscount(coupon) }}
              </td>

              <!-- Min order -->
              <td class="px-5 py-3.5 text-zinc-500 dark:text-zinc-400 text-xs">
                {{ coupon.min_order_amount
                  ? `$${coupon.min_order_amount}`
                  : '—' }}
              </td>

              <!-- Uses -->
              <td class="px-5 py-3.5 text-xs">
                <span class="text-zinc-900 dark:text-white font-medium">{{ coupon.used_count }}</span>
                <span class="text-zinc-400"> / {{ coupon.max_uses ?? '∞' }}</span>
              </td>

              <!-- Expires -->
              <td class="px-5 py-3.5 text-xs whitespace-nowrap"
                :class="isExpired(coupon.expires_at) ? 'text-red-500' : 'text-zinc-500 dark:text-zinc-400'"
              >
                {{ formatDate(coupon.expires_at) }}
                <span v-if="isExpired(coupon.expires_at)" class="ml-1 font-medium">(expired)</span>
              </td>

              <!-- Active toggle -->
              <td class="px-5 py-3.5 text-center">
                <USwitch
                  :model-value="coupon.is_active"
                  :disabled="togglingId === coupon.id"
                  size="sm"
                  @update:model-value="() => toggleActive(coupon)"
                />
              </td>

              <!-- Delete -->
              <td class="px-5 py-3.5 text-right">
                <UButton
                  size="xs"
                  color="error"
                  variant="ghost"
                  icon="heroicons:trash"
                  @click="deleteTarget = coupon; deleteModal = true"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </VCard>

    <!-- ── Create modal ──────────────────────────────────────────────────────── -->
    <UModal v-model:open="createModal">
      <template #content>
        <div class="p-6 space-y-5">
          <h2 class="font-semibold text-lg text-zinc-900 dark:text-white">New Coupon</h2>

          <div class="grid grid-cols-2 gap-4">
            <!-- Code -->
            <UFormField label="Code *" class="col-span-2">
              <UInput
                v-model="draft.code"
                placeholder="SUMMER20"
                size="sm"
                :ui="{ root: 'relative flex items-center w-full' }"
                @input="draft.code = draft.code.toUpperCase()"
              />
            </UFormField>

            <!-- Type -->
            <UFormField label="Type">
              <USelect
                v-model="draft.type"
                :items="typeOptions"
                size="sm"
                class="w-full"
              />
            </UFormField>

            <!-- Value -->
            <UFormField :label="draft.type === 'percentage' ? 'Percentage (%)' : 'Amount ($)'">
              <UInput
                v-model="draft.value"
                type="number"
                min="0"
                :max="draft.type === 'percentage' ? 100 : undefined"
                step="0.01"
                placeholder="0"
                size="sm"
                :ui="{ root: 'relative flex items-center w-full' }"
              />
            </UFormField>

            <!-- Min order -->
            <UFormField label="Min Order Amount ($)">
              <UInput
                v-model="draft.min_order_amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0 (no minimum)"
                size="sm"
                :ui="{ root: 'relative flex items-center w-full' }"
              />
            </UFormField>

            <!-- Max uses -->
            <UFormField label="Max Uses">
              <UInput
                v-model="draft.max_uses"
                type="number"
                min="1"
                step="1"
                placeholder="∞ (unlimited)"
                size="sm"
                :ui="{ root: 'relative flex items-center w-full' }"
              />
            </UFormField>

            <!-- Expiry date -->
            <UFormField label="Expires At" class="col-span-2">
              <UInput
                v-model="draft.expires_at"
                type="date"
                size="sm"
                :ui="{ root: 'relative flex items-center w-full' }"
              />
            </UFormField>

            <!-- Active -->
            <div class="col-span-2 flex items-center justify-between rounded-lg bg-zinc-50 dark:bg-zinc-800 px-4 py-3">
              <div>
                <p class="text-sm font-medium text-zinc-900 dark:text-white">Active</p>
                <p class="text-xs text-zinc-400">Allow customers to use this coupon immediately</p>
              </div>
              <USwitch v-model="draft.is_active" />
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <UButton color="neutral" variant="outline" @click="createModal = false">Cancel</UButton>
            <UButton :loading="saving" icon="heroicons:ticket" @click="saveCoupon">Create Coupon</UButton>
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
              <h3 class="font-semibold text-zinc-900 dark:text-white">Delete Coupon</h3>
              <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Delete coupon
                <span class="font-mono font-semibold text-zinc-800 dark:text-zinc-200">{{ deleteTarget?.code }}</span>?
                This cannot be undone.
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
