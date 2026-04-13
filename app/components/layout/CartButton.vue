<script setup lang="ts">
const { store, open } = useCart()
</script>

<template>
  <UButton
    icon="heroicons:shopping-bag"
    color="neutral"
    variant="ghost"
    size="sm"
    aria-label="Cart"
    class="relative"
    @click="open"
  >
    <span
      v-if="store.count > 0"
      class="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white"
    >
      {{ store.count > 99 ? '99+' : store.count }}
    </span>
  </UButton>
</template>
