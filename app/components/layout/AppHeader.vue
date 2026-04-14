<script setup lang="ts">
const user = useSupabaseUser()
const { profile, logout } = useAuth()
const { t } = useI18n()

const mobileOpen = ref(false)

// Frosted glass effect on scroll
const isScrolled = ref(false)
onMounted(() => {
  const handler = () => {
    isScrolled.value = window.scrollY > 10
  }
  window.addEventListener('scroll', handler, { passive: true })
  onUnmounted(() => window.removeEventListener('scroll', handler))
})

const isAdmin = computed(() => profile.value?.role === 'admin')

// User dropdown items
const accountItems = computed(() => [
  [
    {
      label: profile.value?.full_name || user.value?.email || 'Account',
      disabled: true,
    },
  ],
  ...(isAdmin.value
    ? [[{ label: 'Admin Panel', icon: 'heroicons:squares-2x2', to: '/admin' }]]
    : []),
  [
    { label: t('nav.account'), icon: 'heroicons:user-circle', to: '/account' },
    { label: t('nav.orders'), icon: 'heroicons:shopping-bag', to: '/account/orders' },
    { label: t('nav.wishlist'), icon: 'heroicons:heart', to: '/account/wishlist' },
  ],
  [
    {
      label: t('nav.logout'),
      icon: 'heroicons:arrow-right-on-rectangle',
      onSelect: logout,
    },
  ],
])
</script>

<template>
  <header
    class="sticky top-0 z-50 transition-all duration-300"
    :class="
      isScrolled
        ? 'glass border-b border-zinc-200/60 dark:border-zinc-800/60 shadow-sm'
        : 'bg-white/90 dark:bg-zinc-950/90 backdrop-blur-sm'
    "
  >
    <div class="velora-container flex h-16 items-center gap-4">

      <!-- ── Logo ──────────────────────────────────────────────────────── -->
      <NuxtLink to="/" class="flex shrink-0 items-center gap-2.5 group mr-6">
        <div
          class="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white text-sm font-bold shadow-sm shadow-primary-500/30 transition-transform group-hover:scale-105"
        >
          V
        </div>
        <span class="font-display font-bold text-zinc-900 dark:text-white text-lg leading-none">
          Velora
          <span class="text-primary-600 dark:text-primary-400">.</span>
        </span>
      </NuxtLink>

      <!-- ── Desktop navigation (center) ──────────────────────────────── -->
      <AppNavigation class="hidden lg:flex" />

      <!-- ── Right actions ─────────────────────────────────────────────── -->
      <div class="ml-auto flex items-center gap-1">
        <!-- Theme toggle -->
        <ThemeToggle />

        <!-- Language switcher -->
        <div class="hidden sm:block">
          <LanguageSwitcher />
        </div>

        <USeparator orientation="vertical" class="hidden sm:block h-5 mx-1" />

        <!-- Wishlist -->
        <WishlistButton />

        <!-- Cart -->
        <CartButton />

        <!-- Account — ClientOnly prevents SSR/client avatar hydration mismatch
             (profile is null on server, loaded on client after auth plugin runs) -->
        <ClientOnly>
          <template v-if="user">
            <UDropdownMenu :items="accountItems">
              <UButton color="neutral" variant="ghost" size="sm" class="hidden sm:flex">
                <UAvatar
                  :src="profile?.avatar_url ?? undefined"
                  :alt="profile?.full_name ?? 'Account'"
                  size="xs"
                />
              </UButton>
            </UDropdownMenu>
          </template>

          <template v-else>
            <UButton
              to="/auth/login"
              color="neutral"
              variant="ghost"
              size="sm"
              class="hidden sm:flex"
            >
              {{ t('nav.login') }}
            </UButton>
            <UButton to="/auth/register" size="sm" class="hidden sm:flex">
              {{ t('nav.register') }}
            </UButton>
          </template>

          <!-- Placeholder shown during SSR so layout doesn't shift -->
          <template #fallback>
            <div class="hidden sm:flex items-center gap-1">
              <USkeleton class="h-8 w-8 rounded-full" />
            </div>
          </template>
        </ClientOnly>

        <!-- Mobile menu trigger -->
        <UButton
          icon="heroicons:bars-3"
          color="neutral"
          variant="ghost"
          size="sm"
          class="flex lg:hidden ml-1"
          :aria-label="t('common.close')"
          @click="mobileOpen = true"
        />
      </div>
    </div>
  </header>

  <!-- Mobile drawer -->
  <AppMobileMenu v-model:open="mobileOpen" />
</template>
