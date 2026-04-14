<script setup lang="ts">
const open = defineModel<boolean>('open', { default: false })
const { t } = useI18n()
const route = useRoute()
const user = useSupabaseUser()
const { profile, logout } = useAuth()

const isAdmin = computed(() => profile.value?.role === 'admin')

const links = computed(() => [
  { label: t('nav.home'), to: '/', icon: 'heroicons:home' },
  { label: t('nav.shop'), to: '/shop', icon: 'heroicons:shopping-bag' },
  { label: t('nav.about'), to: '/about', icon: 'heroicons:information-circle' },
  { label: t('nav.contact'), to: '/contact', icon: 'heroicons:envelope' },
])

// Close menu on route change
watch(() => route.path, () => { open.value = false })

async function handleLogout() {
  open.value = false
  await logout()
}
</script>

<template>
  <USlideover v-model:open="open" side="left" :ui="{ width: 'max-w-xs' }">
    <template #content>
      <div class="flex h-full flex-col bg-white dark:bg-zinc-900">

        <!-- Header -->
        <div class="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 px-5 py-4">
          <NuxtLink to="/" class="flex items-center gap-2" @click="open = false">
            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white text-sm font-bold">
              V
            </div>
            <span class="font-display font-semibold text-zinc-900 dark:text-white">Velora</span>
          </NuxtLink>
          <UButton
            icon="heroicons:x-mark"
            color="neutral"
            variant="ghost"
            size="sm"
            @click="open = false"
          />
        </div>

        <!-- Nav links -->
        <nav class="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <NuxtLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
            :class="
              route.path === link.to
                ? 'bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300'
                : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            "
          >
            <UIcon :name="link.icon" class="size-5 shrink-0" />
            {{ link.label }}
          </NuxtLink>
        </nav>

        <!-- Bottom: Language + auth -->
        <div class="border-t border-zinc-100 dark:border-zinc-800 px-4 py-4 space-y-3">
          <LanguageSwitcher />

          <USeparator />

          <div v-if="user" class="space-y-1">
            <NuxtLink
              v-if="isAdmin"
              to="/admin"
              class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950 transition-colors"
              @click="open = false"
            >
              <UIcon name="heroicons:squares-2x2" class="size-5" />
              Admin Panel
            </NuxtLink>
            <NuxtLink
              to="/account"
              class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              @click="open = false"
            >
              <UIcon name="heroicons:user-circle" class="size-5" />
              {{ t('nav.account') }}
            </NuxtLink>
            <button
              class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
              @click="handleLogout"
            >
              <UIcon name="heroicons:arrow-right-on-rectangle" class="size-5" />
              {{ t('nav.logout') }}
            </button>
          </div>

          <div v-else class="grid grid-cols-2 gap-2">
            <UButton
              to="/auth/login"
              color="neutral"
              variant="outline"
              block
              @click="open = false"
            >
              {{ t('nav.login') }}
            </UButton>
            <UButton to="/auth/register" block @click="open = false">
              {{ t('nav.register') }}
            </UButton>
          </div>
        </div>

      </div>
    </template>
  </USlideover>
</template>
