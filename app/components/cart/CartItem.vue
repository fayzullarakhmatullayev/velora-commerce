<script setup lang="ts">
import type { CartItem } from '~/types/cart'

const props = defineProps<{ item: CartItem }>()
const { t } = useI18n()
const { store } = useCart()

function increment() {
  store.updateQuantity(props.item.id, props.item.quantity + 1)
}

function decrement() {
  store.updateQuantity(props.item.id, props.item.quantity - 1)
}
</script>

<template>
  <div class="flex gap-3 py-3">
    <!-- Image -->
    <NuxtLink :to="`/product/${item.slug}`" class="shrink-0">
      <div class="h-20 w-16 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
        <img
          v-if="item.image"
          :src="item.image"
          :alt="item.title"
          class="h-full w-full object-cover"
        />
        <div v-else class="flex h-full w-full items-center justify-center">
          <UIcon name="heroicons:photo" class="size-8 text-zinc-300" />
        </div>
      </div>
    </NuxtLink>

    <!-- Details -->
    <div class="flex flex-1 flex-col justify-between min-w-0">
      <div class="flex items-start justify-between gap-2">
        <NuxtLink
          :to="`/product/${item.slug}`"
          class="text-sm font-medium text-zinc-800 dark:text-zinc-200 line-clamp-2 hover:text-primary-600 transition-colors"
        >
          {{ item.title }}
        </NuxtLink>
        <button
          class="shrink-0 text-zinc-400 hover:text-rose-500 transition-colors"
          :aria-label="t('cart.remove')"
          @click="store.removeItem(item.id)"
        >
          <UIcon name="heroicons:x-mark" class="size-4" />
        </button>
      </div>

      <div class="flex items-center justify-between mt-2">
        <!-- Quantity controls -->
        <div class="flex items-center gap-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
          <button
            class="flex h-7 w-7 items-center justify-center rounded-l-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Decrease"
            @click="decrement"
          >
            <UIcon name="heroicons:minus" class="size-3" />
          </button>
          <span class="w-8 text-center text-sm font-medium tabular-nums">
            {{ item.quantity }}
          </span>
          <button
            class="flex h-7 w-7 items-center justify-center rounded-r-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Increase"
            @click="increment"
          >
            <UIcon name="heroicons:plus" class="size-3" />
          </button>
        </div>

        <!-- Price -->
        <span class="text-sm font-semibold text-zinc-900 dark:text-white">
          ${{ (item.price * item.quantity).toFixed(2) }}
        </span>
      </div>
    </div>
  </div>
</template>
