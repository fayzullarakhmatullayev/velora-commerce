<script setup lang="ts">
defineProps<{
  color?: 'primary' | 'success' | 'warning' | 'error' | 'neutral'
}>()
</script>

<template>
  <span
    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
    :class="{
      'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300': !$props.color || $props.color === 'primary',
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300': $props.color === 'success',
      'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300': $props.color === 'warning',
      'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300': $props.color === 'error',
      'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300': $props.color === 'neutral',
    }"
  >
    <slot />
  </span>
</template>
