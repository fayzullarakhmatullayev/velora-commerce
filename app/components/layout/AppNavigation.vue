<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()

const links = computed(() => [
  { label: t('nav.home'), to: '/' },
  { label: t('nav.shop'), to: '/shop' },
  { label: t('nav.about'), to: '/about' },
  { label: t('nav.contact'), to: '/contact' },
])

function isActive(to: string) {
  if (to === '/') return route.path === '/'
  return route.path.startsWith(to)
}
</script>

<template>
  <nav class="flex items-center gap-1">
    <NuxtLink
      v-for="link in links"
      :key="link.to"
      :to="link.to"
      class="relative px-3 py-1.5 text-sm font-medium transition-colors duration-200 rounded-md"
      :class="
        isActive(link.to)
          ? 'text-zinc-900 dark:text-white'
          : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
      "
    >
      {{ link.label }}
      <!-- Active indicator dot -->
      <span
        v-if="isActive(link.to)"
        class="absolute bottom-0 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-primary-600"
      />
    </NuxtLink>
  </nav>
</template>
