<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const route = useRoute()
const id = route.params.id as string

const { data, pending, refresh } = useAdminOrderDetail(id)

useSeoMeta({
  title: computed(() =>
    data.value ? `Order #${data.value.order.id.slice(0, 8).toUpperCase()} — Velora Admin` : 'Order — Velora Admin'
  ),
})

const toast = useToast()

// ── Status update ─────────────────────────────────────────────────────────────
const statusOptions = [
  { label: 'Pending', value: 'pending' },
  { label: 'Paid', value: 'paid' },
  { label: 'Processing', value: 'processing' },
  { label: 'Shipped', value: 'shipped' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Refunded', value: 'refunded' },
]

const selectedStatus = ref('')
const updating = ref(false)

// Sync local status when data loads
watch(
  () => data.value?.order.status,
  (val) => { if (val) selectedStatus.value = val },
  { immediate: true },
)

const statusChanged = computed(() => selectedStatus.value !== data.value?.order.status)

async function saveStatus() {
  if (!statusChanged.value) return
  updating.value = true
  try {
    await adminUpdateOrderStatus(id, selectedStatus.value)
    await refresh()
    toast.add({ title: 'Status updated', color: 'success', icon: 'heroicons:check-circle' })
  } catch (err: any) {
    toast.add({ title: 'Failed to update status', description: err.message, color: 'error', icon: 'heroicons:x-circle' })
  } finally {
    updating.value = false
  }
}

// ── Sync with Stripe ──────────────────────────────────────────────────────────
const syncing = ref(false)

async function syncStripe() {
  const intentId = data.value?.order.stripe_payment_intent_id
  if (!intentId) return
  syncing.value = true
  try {
    const result = await $fetch('/api/admin/sync-stripe', {
      method: 'POST',
      body: { paymentIntentId: intentId },
    }) as { payment_status: string; order_status: string }
    toast.add({
      title: 'Synced with Stripe',
      description: `Payment: ${result.payment_status} · Order: ${result.order_status}`,
      color: 'success',
      icon: 'heroicons:check-circle',
    })
    await refresh()
  } catch (err: any) {
    toast.add({ title: 'Sync failed', description: err.data?.message ?? err.message, color: 'error', icon: 'heroicons:x-circle' })
  } finally {
    syncing.value = false
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const statusColor: Record<string, string> = {
  pending: 'warning',
  paid: 'success',
  processing: 'info',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'error',
  refunded: 'neutral',
}

function formatPrice(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}
</script>

<template>
  <div class="p-6 lg:p-8 space-y-6">

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="flex items-center gap-3">
        <UButton to="/admin/orders" color="neutral" variant="ghost" icon="heroicons:arrow-left" size="sm" />
        <div>
          <h1 class="font-display text-2xl font-bold text-zinc-900 dark:text-white">
            Order
            <span v-if="data" class="font-mono">#{{ data.order.id.slice(0, 8).toUpperCase() }}</span>
            <USkeleton v-else class="inline-block h-7 w-28 ml-2 align-middle" />
          </h1>
          <p v-if="data" class="mt-0.5 text-sm text-zinc-400">
            Placed {{ formatDate(data.order.created_at) }}
          </p>
        </div>
      </div>

      <!-- Status update control -->
      <div v-if="data" class="flex items-center gap-2 shrink-0">
        <USelect
          v-model="selectedStatus"
          :items="statusOptions"
          size="sm"
          class="w-40"
        />
        <UButton
          size="sm"
          :disabled="!statusChanged"
          :loading="updating"
          @click="saveStatus"
        >
          Save
        </UButton>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-4">
        <USkeleton class="h-32 w-full rounded-xl" />
        <USkeleton class="h-48 w-full rounded-xl" />
        <USkeleton class="h-32 w-full rounded-xl" />
      </div>
      <div class="space-y-4">
        <USkeleton class="h-40 w-full rounded-xl" />
        <USkeleton class="h-32 w-full rounded-xl" />
      </div>
    </div>

    <!-- Content -->
    <div v-else-if="data" class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- Left column -->
      <div class="lg:col-span-2 space-y-6">

        <!-- Order items -->
        <VCard padding="md">
          <h2 class="font-semibold text-zinc-900 dark:text-white mb-4">
            Items ({{ data.items.length }})
          </h2>
          <ul class="divide-y divide-zinc-100 dark:divide-zinc-800">
            <li
              v-for="item in data.items"
              :key="item.id"
              class="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
            >
              <div class="size-14 rounded-lg overflow-hidden shrink-0 bg-zinc-100 dark:bg-zinc-800">
                <img
                  v-if="item.image"
                  :src="item.image"
                  :alt="item.title"
                  class="size-full object-cover"
                />
                <UIcon v-else name="heroicons:photo" class="size-full p-3 text-zinc-400" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-zinc-900 dark:text-white truncate">{{ item.title }}</p>
                <!-- Variant attributes snapshot -->
                <div v-if="(item as any).variant_attributes && Object.keys((item as any).variant_attributes).length" class="flex flex-wrap gap-1 mt-1">
                  <span
                    v-for="[k, v] in Object.entries((item as any).variant_attributes)"
                    :key="k"
                    class="inline-flex items-center rounded-md bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 dark:text-zinc-400"
                  >
                    {{ k }}: {{ v }}
                  </span>
                </div>
                <p class="text-xs text-zinc-400 mt-0.5">
                  {{ formatPrice(item.price) }} × {{ item.quantity }}
                </p>
                <p v-if="item.product_id" class="text-[10px] text-zinc-300 dark:text-zinc-600 font-mono mt-0.5">
                  {{ item.product_id.slice(0, 12) }}…
                </p>
              </div>
              <p class="text-sm font-semibold text-zinc-900 dark:text-white shrink-0">
                {{ formatPrice(item.price * item.quantity) }}
              </p>
            </li>
          </ul>
        </VCard>

        <!-- Shipping address -->
        <VCard padding="md">
          <h2 class="font-semibold text-zinc-900 dark:text-white mb-3">Shipping Address</h2>
          <address class="not-italic text-sm text-zinc-600 dark:text-zinc-300 space-y-0.5">
            <p class="font-medium">{{ data.order.shipping_address.full_name }}</p>
            <p>{{ data.order.shipping_address.street }}</p>
            <p>
              {{ data.order.shipping_address.city }}, {{ data.order.shipping_address.state }}
              {{ data.order.shipping_address.postal_code }}
            </p>
            <p>{{ data.order.shipping_address.country }}</p>
            <p v-if="data.order.shipping_address.phone" class="text-zinc-400 mt-1">
              {{ data.order.shipping_address.phone }}
            </p>
          </address>
        </VCard>

        <!-- Notes -->
        <VCard v-if="data.order.notes" padding="md">
          <h2 class="font-semibold text-zinc-900 dark:text-white mb-2">Notes</h2>
          <p class="text-sm text-zinc-600 dark:text-zinc-300">{{ data.order.notes }}</p>
        </VCard>

      </div>

      <!-- Right column -->
      <div class="space-y-6">

        <!-- Order summary -->
        <VCard padding="md">
          <h2 class="font-semibold text-zinc-900 dark:text-white mb-4">Order Summary</h2>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between text-zinc-600 dark:text-zinc-400">
              <span>Subtotal</span>
              <span>{{ formatPrice(data.order.subtotal) }}</span>
            </div>
            <div v-if="data.order.discount > 0" class="flex justify-between text-emerald-600 dark:text-emerald-400">
              <span>
                Discount
                <span v-if="data.order.coupon_code" class="font-mono text-xs ml-1">({{ data.order.coupon_code }})</span>
              </span>
              <span>−{{ formatPrice(data.order.discount) }}</span>
            </div>
            <div class="flex justify-between text-zinc-600 dark:text-zinc-400">
              <span>Shipping</span>
              <span class="text-emerald-600 dark:text-emerald-400">Free</span>
            </div>
            <USeparator class="my-2" />
            <div class="flex justify-between font-semibold text-zinc-900 dark:text-white text-base">
              <span>Total</span>
              <span>{{ formatPrice(data.order.total) }}</span>
            </div>
          </div>
        </VCard>

        <!-- Payment info -->
        <VCard padding="md">
          <h2 class="font-semibold text-zinc-900 dark:text-white mb-3">Payment</h2>
          <div class="space-y-2 text-sm">
            <div class="flex items-center justify-between">
              <span class="text-zinc-500 dark:text-zinc-400">Status</span>
              <UBadge
                :color="data.order.payment_status === 'paid' ? 'success' : 'warning'"
                variant="subtle"
                size="sm"
              >
                {{ data.order.payment_status }}
              </UBadge>
            </div>
            <div v-if="data.order.stripe_payment_intent_id" class="flex items-center justify-between gap-2">
              <span class="text-zinc-500 dark:text-zinc-400 shrink-0">Intent ID</span>
              <span class="font-mono text-[11px] text-zinc-400 truncate">
                {{ data.order.stripe_payment_intent_id }}
              </span>
            </div>
            <UButton
              v-if="data.order.stripe_payment_intent_id"
              size="xs"
              color="neutral"
              variant="outline"
              icon="heroicons:arrow-path"
              class="mt-1 w-full"
              :loading="syncing"
              @click="syncStripe"
            >
              Sync with Stripe
            </UButton>
          </div>
        </VCard>

        <!-- Customer info -->
        <VCard padding="md">
          <h2 class="font-semibold text-zinc-900 dark:text-white mb-3">Customer</h2>
          <div class="space-y-2 text-sm">
            <div class="flex items-center justify-between gap-2">
              <span class="text-zinc-500 dark:text-zinc-400 shrink-0">Name</span>
              <span class="font-medium text-zinc-900 dark:text-white truncate">
                {{ data.customer?.full_name ?? '—' }}
              </span>
            </div>
            <div v-if="data.customer?.phone" class="flex items-center justify-between gap-2">
              <span class="text-zinc-500 dark:text-zinc-400 shrink-0">Phone</span>
              <span class="text-zinc-700 dark:text-zinc-300">{{ data.customer.phone }}</span>
            </div>
            <div class="flex items-center justify-between gap-2">
              <span class="text-zinc-500 dark:text-zinc-400 shrink-0">User ID</span>
              <span class="font-mono text-[11px] text-zinc-400 truncate">{{ data.order.user_id }}</span>
            </div>
            <NuxtLink :to="`/admin/users?id=${data.order.user_id}`">
              <UButton size="xs" color="neutral" variant="outline" icon="heroicons:user" class="mt-1 w-full">
                View Customer
              </UButton>
            </NuxtLink>
          </div>
        </VCard>

        <!-- Timestamps -->
        <VCard padding="md">
          <h2 class="font-semibold text-zinc-900 dark:text-white mb-3">Timestamps</h2>
          <div class="space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
            <div class="flex justify-between gap-2">
              <span>Created</span>
              <span class="text-zinc-700 dark:text-zinc-300">{{ formatDate(data.order.created_at) }}</span>
            </div>
            <div class="flex justify-between gap-2">
              <span>Updated</span>
              <span class="text-zinc-700 dark:text-zinc-300">{{ formatDate(data.order.updated_at) }}</span>
            </div>
          </div>
        </VCard>

      </div>
    </div>

    <!-- Not found -->
    <div v-else class="flex flex-col items-center justify-center py-24 text-center">
      <UIcon name="heroicons:exclamation-circle" class="size-12 text-zinc-200 dark:text-zinc-700 mb-4" />
      <p class="font-medium text-zinc-700 dark:text-zinc-300">Order not found</p>
      <UButton to="/admin/orders" class="mt-4" color="neutral" variant="outline">
        Back to Orders
      </UButton>
    </div>

  </div>
</template>
