<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
  icon: string
  iconColor?: string
  trend?: string
  trendUp?: boolean
  loading?: boolean
}>()
</script>

<template>
  <VCard padding="md">
    <div class="flex items-start justify-between">
      <div class="flex-1 min-w-0">
        <p class="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
          {{ label }}
        </p>
        <USkeleton v-if="loading" class="h-8 w-28 mt-1" />
        <p v-else class="font-display text-2xl font-bold text-zinc-900 dark:text-white truncate">
          {{ value }}
        </p>
        <p v-if="trend && !loading" class="mt-1 text-xs" :class="trendUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'">
          {{ trend }}
        </p>
      </div>
      <div
        class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ml-3"
        :class="iconColor ?? 'bg-primary-100 dark:bg-primary-950'"
      >
        <UIcon :name="icon" class="size-5" :class="iconColor ? 'text-white' : 'text-primary-600 dark:text-primary-400'" />
      </div>
    </div>
  </VCard>
</template>
