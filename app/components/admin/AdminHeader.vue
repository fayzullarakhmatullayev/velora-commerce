<script setup lang="ts">
const route = useRoute()
const { profile } = useAuth()

// Build breadcrumb from route path
const breadcrumbs = computed(() => {
  const parts = route.path.split('/').filter(Boolean) // ['admin', 'products', '123']
  const crumbs: { label: string; to?: string }[] = []

  let path = ''
  for (const part of parts) {
    path += `/${part}`
    const label = part === 'admin'
      ? 'Admin'
      : part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ')
    crumbs.push({ label, to: path })
  }

  // Last crumb is current page — no link
  if (crumbs.length > 0) delete crumbs[crumbs.length - 1].to

  return crumbs
})

const pageTitle = computed(() => breadcrumbs.value.at(-1)?.label ?? 'Admin')
</script>

<template>
  <header class="flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6">
    <!-- Breadcrumb -->
    <nav class="flex items-center gap-1.5 text-sm">
      <template v-for="(crumb, i) in breadcrumbs" :key="crumb.label">
        <NuxtLink
          v-if="crumb.to"
          :to="crumb.to"
          class="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
        >
          {{ crumb.label }}
        </NuxtLink>
        <span v-else class="font-semibold text-zinc-900 dark:text-white">{{ crumb.label }}</span>
        <UIcon
          v-if="i < breadcrumbs.length - 1"
          name="heroicons:chevron-right"
          class="size-3.5 text-zinc-300 dark:text-zinc-600"
        />
      </template>
    </nav>

    <!-- Right side -->
    <div class="flex items-center gap-3">
      <ThemeToggle />

      <!-- Admin user info -->
      <div class="flex items-center gap-2.5 pl-3 border-l border-zinc-200 dark:border-zinc-800">
        <UAvatar
          :src="profile?.avatar_url ?? undefined"
          :alt="profile?.full_name ?? 'Admin'"
          size="sm"
        />
        <div class="hidden sm:block leading-tight">
          <p class="text-xs font-semibold text-zinc-900 dark:text-white">{{ profile?.full_name ?? 'Admin' }}</p>
          <p class="text-[10px] text-zinc-400 uppercase tracking-wider">Administrator</p>
        </div>
      </div>
    </div>
  </header>
</template>
