<script setup lang="ts">
import type { Database } from '~/types/database.types'

definePageMeta({ middleware: 'auth' })

type Order = Database['public']['Tables']['orders']['Row']
type OrderItem = Database['public']['Tables']['order_items']['Row']

const route = useRoute()
const supabase = useSupabase()

const { data, pending } = useAsyncData(`order-${route.params.id}`, async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user?.id) return null

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', route.params.id as string)
    .eq('user_id', session.user.id)
    .single()

  if (orderError) throw orderError

  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', order.id)

  if (itemsError) throw itemsError

  return { order: order as Order, items: items as OrderItem[] }
})

useSeoMeta({ title: computed(() => data.value ? `Order #${data.value.order.id.slice(0, 8).toUpperCase()} — Velora Commerce` : 'Order — Velora Commerce') })

const statusColor: Record<string, string> = {
  pending: 'warning',
  paid: 'success',
  processing: 'info',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'error',
  refunded: 'neutral',
}

const statusSteps = ['pending', 'paid', 'processing', 'shipped', 'delivered']

const currentStep = computed(() => {
  const status = data.value?.order.status ?? 'pending'
  const idx = statusSteps.indexOf(status)
  return idx === -1 ? 0 : idx
})

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function formatPrice(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}
</script>

<template>
  <div class="velora-container py-10">
    <!-- Header -->
    <div class="mb-8 flex items-center gap-3">
      <UButton to="/account/orders" color="neutral" variant="ghost" icon="heroicons:arrow-left" size="sm" />
      <div>
        <h1 class="font-display text-2xl font-bold text-zinc-900 dark:text-white">
          Order <span v-if="data" class="font-mono">#{{ data.order.id.slice(0, 8).toUpperCase() }}</span>
        </h1>
        <p v-if="data" class="mt-0.5 text-sm text-zinc-400">Placed {{ formatDate(data.order.created_at) }}</p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="space-y-4">
      <USkeleton class="h-20 w-full rounded-xl" />
      <USkeleton class="h-48 w-full rounded-xl" />
      <USkeleton class="h-32 w-full rounded-xl" />
    </div>

    <div v-else-if="data" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left: items + tracking -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Status tracker -->
        <VCard padding="md">
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-semibold text-zinc-900 dark:text-white">Status</h2>
            <UBadge :color="(statusColor[data.order.status] as any) ?? 'neutral'" variant="subtle">
              {{ data.order.status }}
            </UBadge>
          </div>
          <div v-if="!['cancelled', 'refunded'].includes(data.order.status)" class="flex items-center gap-0">
            <template v-for="(step, i) in statusSteps" :key="step">
              <div class="flex flex-col items-center gap-1 flex-1">
                <div
                  class="size-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors"
                  :class="
                    i <= currentStep
                      ? 'bg-primary-600 border-primary-600 text-white'
                      : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-400'
                  "
                >
                  <UIcon v-if="i < currentStep" name="heroicons:check" class="size-3.5" />
                  <span v-else>{{ i + 1 }}</span>
                </div>
                <span class="text-[10px] capitalize text-zinc-500 dark:text-zinc-400">{{ step }}</span>
              </div>
              <div
                v-if="i < statusSteps.length - 1"
                class="h-0.5 flex-1 -mt-5 transition-colors"
                :class="i < currentStep ? 'bg-primary-600' : 'bg-zinc-200 dark:bg-zinc-700'"
              />
            </template>
          </div>
        </VCard>

        <!-- Order items -->
        <VCard padding="md">
          <h2 class="font-semibold text-zinc-900 dark:text-white mb-4">Items ({{ data.items.length }})</h2>
          <ul class="divide-y divide-zinc-100 dark:divide-zinc-800">
            <li v-for="item in data.items" :key="item.id" class="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
              <div class="size-14 rounded-lg overflow-hidden shrink-0 bg-zinc-100 dark:bg-zinc-800">
                <img v-if="item.image" :src="item.image" :alt="item.title" class="size-full object-cover" />
                <UIcon v-else name="heroicons:photo" class="size-full p-3 text-zinc-400" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-zinc-900 dark:text-white truncate">{{ item.title }}</p>
                <p class="text-xs text-zinc-400 mt-0.5">Qty: {{ item.quantity }}</p>
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
            <p>{{ data.order.shipping_address.city }}, {{ data.order.shipping_address.state }} {{ data.order.shipping_address.postal_code }}</p>
            <p>{{ data.order.shipping_address.country }}</p>
            <p class="text-zinc-400 mt-1">{{ data.order.shipping_address.phone }}</p>
          </address>
        </VCard>
      </div>

      <!-- Right: summary -->
      <div class="space-y-6">
        <VCard padding="md">
          <h2 class="font-semibold text-zinc-900 dark:text-white mb-4">Order Summary</h2>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between text-zinc-600 dark:text-zinc-400">
              <span>Subtotal</span>
              <span>{{ formatPrice(data.order.subtotal) }}</span>
            </div>
            <div v-if="data.order.discount > 0" class="flex justify-between text-green-600 dark:text-green-400">
              <span>Discount <span v-if="data.order.coupon_code" class="font-mono text-xs">({{ data.order.coupon_code }})</span></span>
              <span>-{{ formatPrice(data.order.discount) }}</span>
            </div>
            <div class="flex justify-between text-zinc-600 dark:text-zinc-400">
              <span>Shipping</span>
              <span class="text-green-600 dark:text-green-400">Free</span>
            </div>
            <USeparator class="my-2" />
            <div class="flex justify-between font-semibold text-zinc-900 dark:text-white text-base">
              <span>Total</span>
              <span>{{ formatPrice(data.order.total) }}</span>
            </div>
          </div>
        </VCard>

        <VCard padding="md">
          <h2 class="font-semibold text-zinc-900 dark:text-white mb-3">Payment</h2>
          <div class="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
            <div class="flex justify-between">
              <span>Method</span>
              <span class="font-medium text-zinc-900 dark:text-white">Card</span>
            </div>
            <div class="flex justify-between">
              <span>Status</span>
              <UBadge :color="data.order.payment_status === 'paid' ? 'success' : 'warning'" variant="subtle" size="sm">
                {{ data.order.payment_status }}
              </UBadge>
            </div>
          </div>
        </VCard>
      </div>
    </div>

    <!-- Not found -->
    <div v-else class="flex flex-col items-center justify-center py-24 text-center">
      <UIcon name="heroicons:exclamation-circle" class="size-16 text-zinc-200 dark:text-zinc-700 mb-4" />
      <p class="font-medium text-zinc-700 dark:text-zinc-300">Order not found</p>
      <UButton to="/account/orders" class="mt-6" color="neutral" variant="outline">Back to Orders</UButton>
    </div>
  </div>
</template>
