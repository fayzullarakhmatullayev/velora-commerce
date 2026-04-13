<script setup lang="ts">
// Supabase auth callback page — handles email confirmation & OAuth redirects.
// @nuxtjs/supabase exchanges the token automatically, then we redirect.
definePageMeta({ layout: 'auth' })
useSeoMeta({ title: 'Confirming… — Velora Commerce' })
</script>

<template>
  <div class="flex flex-col items-center gap-4 text-center">
    <div class="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-950">
      <UIcon name="heroicons:arrow-path" class="size-8 text-primary-600 dark:text-primary-400 animate-spin" />
    </div>
    <p class="font-medium text-zinc-700 dark:text-zinc-300">Confirming your account…</p>
    <p class="text-sm text-zinc-400">You'll be redirected shortly.</p>
  </div>
</template>
