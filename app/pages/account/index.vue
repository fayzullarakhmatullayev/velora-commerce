<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useSeoMeta({ title: 'My Account — Velora Commerce' })

const { t } = useI18n()
const { user, profile, logout } = useAuth()
</script>

<template>
  <div class="velora-container py-10">
    <div class="mb-8 flex items-center justify-between">
      <h1 class="font-display text-3xl font-bold text-zinc-900 dark:text-white">
        {{ t('nav.account') }}
      </h1>
      <UButton color="neutral" variant="ghost" icon="heroicons:arrow-right-on-rectangle" @click="logout">
        {{ t('nav.logout') }}
      </UButton>
    </div>

    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <!-- Quick links -->
      <NuxtLink
        v-for="item in [
          { label: t('nav.orders'), icon: 'heroicons:shopping-bag', to: '/account/orders', desc: 'Track your purchases' },
          { label: t('nav.wishlist'), icon: 'heroicons:heart', to: '/account/wishlist', desc: 'Saved items' },
          { label: 'Profile', icon: 'heroicons:user-circle', to: '/account/profile', desc: 'Edit your info' },
          { label: 'Addresses', icon: 'heroicons:map-pin', to: '/account/addresses', desc: 'Manage delivery addresses' },
        ]"
        :key="item.to"
        :to="item.to"
      >
        <VCard hover padding="md" class="flex items-center gap-4">
          <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-950">
            <UIcon :name="item.icon" class="size-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <p class="font-medium text-zinc-900 dark:text-white text-sm">{{ item.label }}</p>
            <p class="text-xs text-zinc-400">{{ item.desc }}</p>
          </div>
        </VCard>
      </NuxtLink>
    </div>

    <!-- Profile summary -->
    <VCard padding="md" class="mt-6 flex items-center gap-4">
      <UAvatar
        :src="profile?.avatar_url ?? undefined"
        :alt="profile?.full_name ?? 'User'"
        size="lg"
      />
      <div>
        <p class="font-semibold text-zinc-900 dark:text-white">
          {{ profile?.full_name ?? 'Welcome!' }}
        </p>
        <p class="text-sm text-zinc-400">{{ user?.email }}</p>
        <VBadge v-if="profile?.role === 'admin'" color="primary" class="mt-1">Admin</VBadge>
      </div>
      <UButton to="/account/profile" color="neutral" variant="ghost" size="sm" class="ml-auto">
        Edit profile
      </UButton>
    </VCard>
  </div>
</template>
