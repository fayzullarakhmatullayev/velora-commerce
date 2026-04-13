<script setup lang="ts">
defineProps<{
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}>()
</script>

<template>
  <div
    class="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-all duration-200"
    :class="[
      hover && 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer',
      {
        '': padding === 'none',
        'p-3': padding === 'sm',
        'p-5': padding === 'md' || !padding,
        'p-8': padding === 'lg',
      },
    ]"
  >
    <slot />
  </div>
</template>
