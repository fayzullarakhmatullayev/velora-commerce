<script setup lang="ts">
const { t } = useI18n()
const { store } = useCart()

useSeoMeta({ title: 'Cart — Velora Commerce' })
</script>

<template>
  <div class="velora-container py-8 lg:py-12">
    <h1 class="font-display text-3xl font-bold text-zinc-900 dark:text-white mb-8">
      {{ t('cart.title') }}
    </h1>

    <!-- Empty -->
    <div
      v-if="store.items.length === 0"
      class="flex flex-col items-center justify-center py-24 text-center"
    >
      <div class="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
        <UIcon name="heroicons:shopping-bag" class="size-12 text-zinc-300 dark:text-zinc-600" />
      </div>
      <p class="text-lg font-medium text-zinc-700 dark:text-zinc-300">{{ t('cart.empty') }}</p>
      <p class="mt-1 text-zinc-400">{{ 'Start adding items to your cart' }}</p>
      <UButton to="/shop" size="lg" class="mt-6">{{ t('cart.continueShopping') }}</UButton>
    </div>

    <div v-else class="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <!-- Items list -->
      <div class="lg:col-span-2">
        <VCard padding="none">
          <div class="divide-y divide-zinc-100 dark:divide-zinc-800 px-5">
            <CartItem v-for="item in store.items" :key="item.id" :item="item" />
          </div>
          <div class="border-t border-zinc-100 dark:border-zinc-800 px-5 py-3">
            <UButton
              color="neutral"
              variant="ghost"
              size="sm"
              icon="heroicons:trash"
              class="text-rose-500 hover:text-rose-700"
              @click="store.clear()"
            >
              Clear cart
            </UButton>
          </div>
        </VCard>
      </div>

      <!-- Order summary -->
      <div class="space-y-4">
        <VCard>
          <h2 class="font-display font-semibold text-zinc-900 dark:text-white mb-4">
            Order Summary
          </h2>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between text-zinc-500">
              <span>{{ t('cart.subtotal') }}</span>
              <span>${{ store.subtotal.toFixed(2) }}</span>
            </div>
            <div v-if="store.discount > 0" class="flex justify-between text-emerald-600">
              <span>{{ t('cart.discount') }} ({{ store.couponCode }})</span>
              <span>-${{ store.discount.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-zinc-500">
              <span>{{ t('cart.shipping') }}</span>
              <span class="text-emerald-600">{{ t('cart.free') }}</span>
            </div>
            <USeparator class="my-2" />
            <div class="flex justify-between font-bold text-zinc-900 dark:text-white text-base">
              <span>{{ t('cart.total') }}</span>
              <span>${{ store.total.toFixed(2) }}</span>
            </div>
          </div>
        </VCard>

        <UButton to="/checkout" block size="lg">
          {{ t('cart.checkout') }}
          <UIcon name="heroicons:lock-closed" class="size-4" />
        </UButton>

        <NuxtLink
          to="/shop"
          class="block text-center text-sm text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
        >
          ← {{ t('cart.continueShopping') }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
