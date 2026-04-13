<script setup lang="ts">
import type { Database } from '~/types/database.types'

definePageMeta({ middleware: 'auth' })
useSeoMeta({ title: 'My Orders — Velora Commerce' })

type Order = Database['public']['Tables']['orders']['Row']

const supabase = useSupabase()
const user = useSupabaseUser()

const { data: orders, pending } = useAsyncData('account-orders', async () => {
  if (!user.value?.id) return [] as Order[]

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.value.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Order[]
}, { default: () => [] as Order[], watch: [user] })

const statusColor: Record<string, string> = {
  pending: 'warning',
  paid: 'success',
  processing: 'info',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'error',
  refunded: 'neutral',
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatPrice(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}
</script>

<template>
  <div class="velora-container py-10">
    <!-- Header -->
    <div class="mb-8 flex items-center gap-3">
      <UButton to="/account" color="neutral" variant="ghost" icon="heroicons:arrow-left" size="sm" />
      <h1 class="font-display text-2xl font-bold text-zinc-900 dark:text-white">My Orders</h1>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="space-y-3">
      <USkeleton v-for="i in 3" :key="i" class="h-24 w-full rounded-xl" />
    </div>

    <!-- Empty -->
    <div
      v-else-if="orders.length === 0"
      class="flex flex-col items-center justify-center py-24 text-center"
    >
      <UIcon name="heroicons:shopping-bag" class="size-16 text-zinc-200 dark:text-zinc-700 mb-4" />
      <p class="font-medium text-zinc-700 dark:text-zinc-300">No orders yet</p>
      <p class="mt-1 text-sm text-zinc-400">When you place orders, they'll appear here.</p>
      <UButton to="/shop" class="mt-6">Start Shopping</UButton>
    </div>

    <!-- Orders list -->
    <div v-else class="space-y-3">
      <NuxtLink
        v-for="order in orders"
        :key="order.id"
        :to="`/account/orders/${order.id}`"
      >
        <VCard hover padding="md" class="flex items-center gap-4">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <p class="font-mono text-sm font-semibold text-zinc-900 dark:text-white">
                #{{ order.id.slice(0, 8).toUpperCase() }}
              </p>
              <UBadge :color="(statusColor[order.status] as any) ?? 'neutral'" variant="subtle" size="sm">
                {{ order.status }}
              </UBadge>
            </div>
            <p class="mt-1 text-xs text-zinc-400">{{ formatDate(order.created_at) }}</p>
          </div>
          <div class="text-right shrink-0">
            <p class="font-semibold text-zinc-900 dark:text-white">{{ formatPrice(order.total) }}</p>
            <p class="text-xs text-zinc-400 mt-0.5">{{ order.payment_status }}</p>
          </div>
          <UIcon name="heroicons:chevron-right" class="size-4 text-zinc-400 shrink-0" />
        </VCard>
      </NuxtLink>
    </div>
  </div>
</template>
