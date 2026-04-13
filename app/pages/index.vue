<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: 'Velora Commerce — Shop Beautifully. Scale Effortlessly.',
  description: 'Premium multilingual e-commerce — discover curated products for modern life.',
})

// Fetch featured products and categories for home page
const { data: featuredData, pending } = useProducts({ featured: true, limit: 8 })
const featuredProducts = computed(() => featuredData.value?.products ?? [])

const { categories, getCategoryName } = useCategories()
</script>

<template>
  <div>
    <!-- ── Hero Section ───────────────────────────────────────────────────── -->
    <section class="relative overflow-hidden">
      <!-- Gradient background -->
      <div
        class="absolute inset-0 bg-gradient-to-br from-zinc-50 via-white to-primary-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-primary-950"
      />
      <!-- Decorative orbs -->
      <div
        class="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-primary-400/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        class="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-violet-400/10 blur-3xl"
        aria-hidden="true"
      />

      <div class="velora-container relative py-24 lg:py-36">
        <div class="max-w-3xl">
          <!-- Tag line -->
          <div
            class="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-950 px-4 py-1.5"
          >
            <span class="h-1.5 w-1.5 rounded-full bg-primary-500 animate-pulse" />
            <span
              class="text-xs font-semibold text-primary-700 dark:text-primary-300 uppercase tracking-wider"
            >
              New collection live
            </span>
          </div>

          <!-- Headline -->
          <h1
            class="font-display text-5xl font-extrabold leading-[1.1] tracking-tight text-zinc-900 dark:text-white sm:text-6xl lg:text-7xl mb-6"
          >
            {{ t('home.heroTitle') }}
            <span class="gradient-text block">Scale Effortlessly.</span>
          </h1>

          <p class="text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xl mb-10">
            {{ t('home.heroSubtitle') }}
          </p>

          <!-- CTA buttons -->
          <div class="flex flex-wrap items-center gap-4">
            <UButton
              to="/shop"
              size="xl"
              class="shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-shadow"
            >
              {{ t('home.heroCta') }}
              <UIcon name="heroicons:arrow-right" class="size-4" />
            </UButton>
            <UButton to="/about" size="xl" color="neutral" variant="ghost">
              Learn our story
              <UIcon name="heroicons:arrow-right" class="size-4" />
            </UButton>
          </div>

          <!-- Stats -->
          <div class="mt-16 grid grid-cols-3 gap-8 max-w-sm">
            <div
              v-for="stat in [
                { value: '10K+', label: 'Products' },
                { value: '50K+', label: 'Customers' },
                { value: '4.9★', label: 'Rating' },
              ]"
              :key="stat.label"
            >
              <div class="font-display text-2xl font-bold text-zinc-900 dark:text-white">
                {{ stat.value }}
              </div>
              <div class="text-xs text-zinc-400 mt-0.5">{{ stat.label }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Featured Products ─────────────────────────────────────────────── -->
    <section class="velora-container py-20">
      <div class="flex items-end justify-between mb-10">
        <div>
          <p
            class="text-xs font-semibold uppercase tracking-widest text-primary-600 dark:text-primary-400 mb-2"
          >
            Curated for you
          </p>
          <h2 class="font-display text-3xl font-bold text-zinc-900 dark:text-white">
            {{ t('home.featuredTitle') }}
          </h2>
        </div>
        <UButton to="/shop" color="neutral" variant="ghost" trailing-icon="heroicons:arrow-right">
          {{ t('common.viewAll') }}
        </UButton>
      </div>

      <ProductGrid :products="featuredProducts" :loading="pending" :skeleton-count="8" />
    </section>

    <!-- ── Categories ─────────────────────────────────────────────────────── -->
    <section class="bg-zinc-50 dark:bg-zinc-900/50 py-20">
      <div class="velora-container">
        <div class="text-center mb-10">
          <p
            class="text-xs font-semibold uppercase tracking-widest text-primary-600 dark:text-primary-400 mb-2"
          >
            Browse
          </p>
          <h2 class="font-display text-3xl font-bold text-zinc-900 dark:text-white">
            {{ t('home.categories') }}
          </h2>
        </div>

        <!-- Skeleton while loading -->
        <div v-if="!categories.length" class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <div
            v-for="i in 6"
            :key="i"
            class="flex flex-col items-center gap-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6"
          >
            <VSkeleton class="h-12 w-12" rounded="full" />
            <VSkeleton class="h-3 w-16" rounded="md" />
          </div>
        </div>

        <!-- Real categories -->
        <div v-else class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <NuxtLink
            v-for="cat in categories"
            :key="cat.id"
            :to="`/shop?category=${cat.id}`"
            class="group flex flex-col items-center gap-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md transition-all"
          >
            <div
              class="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-950 group-hover:bg-primary-100 dark:group-hover:bg-primary-900 transition-colors"
            >
              <img
                v-if="cat.image"
                :src="cat.image"
                :alt="getCategoryName(cat)"
                class="h-8 w-8 object-contain"
              />
              <UIcon v-else name="heroicons:squares-2x2" class="size-6 text-primary-500" />
            </div>
            <span class="text-xs font-medium text-zinc-700 dark:text-zinc-300 text-center">
              {{ getCategoryName(cat) }}
            </span>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
