<script setup lang="ts">
import type { ProductRow } from '~/composables/useProducts'

defineProps<{
  products: ProductRow[]
  loading?: boolean
  skeletonCount?: number
}>()
</script>

<template>
  <div class="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
    <!-- Real product cards -->
    <template v-if="!loading">
      <ProductCard
        v-for="product in products"
        :key="product.id"
        :product="product"
      />
    </template>

    <!-- Skeleton loaders -->
    <template v-else>
      <div
        v-for="i in (skeletonCount ?? 8)"
        :key="`skel-${i}`"
        class="flex flex-col gap-3"
      >
        <VSkeleton class="aspect-[3/4] w-full rounded-xl" />
        <VSkeleton class="h-3 w-1/3 rounded" />
        <VSkeleton class="h-4 w-2/3 rounded" />
        <VSkeleton class="h-4 w-1/4 rounded" />
      </div>
    </template>
  </div>
</template>
