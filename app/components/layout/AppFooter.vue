<script setup lang="ts">
const { t } = useI18n()

const shopLinks = computed(() => [
  { label: t('nav.shop'), to: '/shop' },
  { label: t('home.newArrivals'), to: '/shop?sort=newest' },
  { label: t('home.featuredTitle'), to: '/shop?featured=true' },
])

const companyLinks = computed(() => [
  { label: t('nav.about'), to: '/about' },
  { label: t('nav.contact'), to: '/contact' },
])

const legalLinks = computed(() => [
  { label: t('footer.privacy'), to: '/privacy' },
  { label: t('footer.terms'), to: '/terms' },
])

const socials = [
  { icon: 'simple-icons:instagram', href: '#', label: 'Instagram' },
  { icon: 'simple-icons:x', href: '#', label: 'X (Twitter)' },
  { icon: 'simple-icons:telegram', href: '#', label: 'Telegram' },
]
</script>

<template>
  <footer class="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
    <div class="velora-container py-12 lg:py-16">

      <!-- Main grid -->
      <div class="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">

        <!-- Brand column -->
        <div class="space-y-4">
          <NuxtLink to="/" class="inline-flex items-center gap-2.5 group">
            <div
              class="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white text-sm font-bold"
            >
              V
            </div>
            <span class="font-display font-bold text-zinc-900 dark:text-white text-lg leading-none">
              Velora<span class="text-primary-600">.</span>
            </span>
          </NuxtLink>
          <p class="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xs">
            {{ t('common.tagline') }}
          </p>
          <!-- Socials -->
          <div class="flex items-center gap-3">
            <a
              v-for="s in socials"
              :key="s.label"
              :href="s.href"
              :aria-label="s.label"
              target="_blank"
              rel="noopener noreferrer"
              class="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            >
              <UIcon :name="s.icon" class="size-4" />
            </a>
          </div>
        </div>

        <!-- Shop links -->
        <div class="space-y-4">
          <h4 class="text-sm font-semibold text-zinc-900 dark:text-white uppercase tracking-wider">
            {{ t('nav.shop') }}
          </h4>
          <ul class="space-y-2">
            <li v-for="link in shopLinks" :key="link.to">
              <NuxtLink
                :to="link.to"
                class="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Company links -->
        <div class="space-y-4">
          <h4 class="text-sm font-semibold text-zinc-900 dark:text-white uppercase tracking-wider">
            Company
          </h4>
          <ul class="space-y-2">
            <li v-for="link in companyLinks" :key="link.to">
              <NuxtLink
                :to="link.to"
                class="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Legal + language -->
        <div class="space-y-4">
          <h4 class="text-sm font-semibold text-zinc-900 dark:text-white uppercase tracking-wider">
            Legal
          </h4>
          <ul class="space-y-2">
            <li v-for="link in legalLinks" :key="link.to">
              <NuxtLink
                :to="link.to"
                class="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>

      </div>

      <!-- Bottom bar -->
      <div
        class="mt-10 flex flex-col items-center justify-between gap-4 border-t border-zinc-200 dark:border-zinc-800 pt-8 sm:flex-row"
      >
        <p class="text-xs text-zinc-400">
          &copy; {{ new Date().getFullYear() }} Velora Commerce. {{ t('footer.rights') }}
        </p>
        <div class="flex items-center gap-4">
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
      </div>

    </div>
  </footer>
</template>
