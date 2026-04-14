<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Orders — Velora Admin' })

const status = ref('')
const search = ref('')
const page = ref(1)

// Reset page when filters change
watch([status, search], () => { page.value = 1 })

const { orders, total, totalPages, pending, refresh } = useAdminOrders({ status, search, page })

// Explicit watch — more reliable than useAsyncData's built-in watch in Nuxt 4
watch([status, search, page], () => refresh())

const statusOptions = [
  { label: 'All Statuses', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Paid', value: 'paid' },
  { label: 'Processing', value: 'processing' },
  { label: 'Shipped', value: 'shipped' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Refunded', value: 'refunded' },
]

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
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const pageFrom = computed(() => (page.value - 1) * 20 + 1)
const pageTo = computed(() => Math.min(page.value * 20, total.value))
</script>

<template>
  <div class="p-6 lg:p-8 space-y-6">

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="font-display text-2xl font-bold text-zinc-900 dark:text-white">Orders</h1>
        <p class="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
          {{ total.toLocaleString() }} order{{ total !== 1 ? 's' : '' }} total
        </p>
      </div>
      <UButton icon="heroicons:arrow-path" color="neutral" variant="outline" size="sm" :loading="pending" @click="() => refresh()">
        Refresh
      </UButton>
    </div>

    <!-- Filters -->
    <VCard padding="md">
      <div class="flex flex-col sm:flex-row gap-3">
        <!-- Search -->
        <div class="flex-1">
          <UInput
            v-model="search"
            placeholder="Search by order ID…"
            icon="heroicons:magnifying-glass"
            size="sm"
            :ui="{ base: 'w-full' }"
          />
        </div>
        <!-- Status filter -->
        <USelect
          v-model="status"
          :items="statusOptions"
          size="sm"
          class="w-full sm:w-48"
        />
      </div>
    </VCard>

    <!-- Table card -->
    <VCard padding="none">
      <!-- Loading -->
      <div v-if="pending" class="divide-y divide-zinc-100 dark:divide-zinc-800">
        <div v-for="i in 8" :key="i" class="flex items-center gap-4 px-5 py-3.5">
          <USkeleton class="h-4 w-24" />
          <USkeleton class="h-4 w-36 flex-1" />
          <USkeleton class="h-5 w-20 rounded-full" />
          <USkeleton class="h-5 w-16 rounded-full" />
          <USkeleton class="h-4 w-20" />
          <USkeleton class="h-8 w-8 rounded-lg" />
        </div>
      </div>

      <!-- Empty -->
      <div v-else-if="!orders.length" class="flex flex-col items-center justify-center py-20 text-center">
        <UIcon name="heroicons:shopping-bag" class="size-10 text-zinc-200 dark:text-zinc-700 mb-3" />
        <p class="text-sm text-zinc-500 dark:text-zinc-400">No orders found</p>
        <UButton v-if="status || search" variant="ghost" size="sm" class="mt-2" @click="status = ''; search = ''">
          Clear filters
        </UButton>
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-zinc-100 dark:border-zinc-800">
              <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Order</th>
              <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Date</th>
              <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Customer</th>
              <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Status</th>
              <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Payment</th>
              <th class="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-400">Total</th>
              <th class="px-5 py-3" />
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-100 dark:divide-zinc-800">
            <tr
              v-for="order in orders"
              :key="order.id"
              class="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
            >
              <td class="px-5 py-3.5">
                <span class="font-mono font-semibold text-zinc-900 dark:text-white">
                  #{{ order.id.slice(0, 8).toUpperCase() }}
                </span>
              </td>
              <td class="px-5 py-3.5 text-zinc-500 dark:text-zinc-400 whitespace-nowrap text-xs">
                {{ formatDate(order.created_at) }}
              </td>
              <td class="px-5 py-3.5">
                <span class="font-mono text-xs text-zinc-400">
                  {{ order.user_id.slice(0, 8) }}…
                </span>
              </td>
              <td class="px-5 py-3.5">
                <UBadge :color="(statusColor[order.status] as any) ?? 'neutral'" variant="subtle" size="sm">
                  {{ order.status }}
                </UBadge>
              </td>
              <td class="px-5 py-3.5">
                <UBadge
                  :color="order.payment_status === 'paid' ? 'success' : 'warning'"
                  variant="subtle"
                  size="sm"
                >
                  {{ order.payment_status }}
                </UBadge>
              </td>
              <td class="px-5 py-3.5 text-right font-semibold text-zinc-900 dark:text-white">
                {{ formatPrice(order.total) }}
              </td>
              <td class="px-5 py-3.5 text-right">
                <NuxtLink :to="`/admin/orders/${order.id}`">
                  <UButton size="xs" color="neutral" variant="ghost" icon="heroicons:arrow-top-right-on-square" />
                </NuxtLink>
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
            <UButton
              size="xs"
              color="neutral"
              variant="outline"
              icon="heroicons:chevron-left"
              :disabled="page <= 1"
              @click="page--"
            />
            <span class="text-xs font-medium text-zinc-600 dark:text-zinc-400 px-2">
              {{ page }} / {{ totalPages }}
            </span>
            <UButton
              size="xs"
              color="neutral"
              variant="outline"
              icon="heroicons:chevron-right"
              :disabled="page >= totalPages"
              @click="page++"
            />
          </div>
        </div>
      </div>
    </VCard>

  </div>
</template>
