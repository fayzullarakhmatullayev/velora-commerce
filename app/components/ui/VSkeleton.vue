<script setup lang="ts">
defineProps<{
  class?: string
  rounded?: 'sm' | 'md' | 'lg' | 'full'
}>()
</script>

<template>
  <div
    class="shimmer"
    :class="[
      $props.class,
      {
        'rounded-sm': rounded === 'sm',
        'rounded-md': rounded === 'md',
        'rounded-lg': rounded === 'lg',
        'rounded-full': rounded === 'full',
        'rounded': !rounded,
      },
    ]"
    aria-hidden="true"
  />
</template>
