<script setup lang="ts">
useSeoMeta({ title: 'Order Confirmed — Velora Commerce' })

const route = useRoute()
const orderId = computed(() => route.query.order as string | undefined)
</script>

<template>
  <div class="velora-container py-20 flex flex-col items-center text-center">
    <!-- Animated checkmark -->
    <div class="relative mb-8">
      <div class="size-24 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
        <UIcon name="heroicons:check-circle-solid" class="size-14 text-green-500" />
      </div>
    </div>

    <h1 class="font-display text-3xl font-bold text-zinc-900 dark:text-white mb-3">
      Order Confirmed!
    </h1>
    <p class="text-zinc-500 dark:text-zinc-400 max-w-md">
      Thank you for your purchase. We've received your order and will begin processing it shortly.
      You'll receive an email confirmation soon.
    </p>

    <div v-if="orderId" class="mt-6 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-6 py-4">
      <p class="text-xs text-zinc-400 uppercase tracking-wider mb-1">Order Reference</p>
      <p class="font-mono font-semibold text-zinc-900 dark:text-white text-lg">
        #{{ orderId.slice(0, 8).toUpperCase() }}
      </p>
    </div>

    <div class="mt-8 flex items-center gap-3 flex-wrap justify-center">
      <UButton :to="orderId ? `/account/orders/${orderId}` : '/account/orders'" size="lg">
        View Order
      </UButton>
      <UButton to="/shop" color="neutral" variant="outline" size="lg">
        Continue Shopping
      </UButton>
    </div>
  </div>
</template>
