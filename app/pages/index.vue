<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: 'Velora Commerce — Shop Beautifully. Scale Effortlessly.',
  description: 'Premium multilingual e-commerce — discover curated products for modern life.',
})

const { data: featuredData, pending } = useProducts({ featured: true, limit: 8 })
const featuredProducts = computed(() => featuredData.value?.products ?? [])

const { categories, getCategoryName } = useCategories()

const heroImage1 = computed(() => featuredProducts.value[0]?.images?.[0] ?? '')
const heroImage2 = computed(() => featuredProducts.value[1]?.images?.[0] ?? '')
const heroPrice = computed(() => featuredProducts.value[0]?.price ?? 29)
</script>

<template>
  <div>
    <!-- ── Hero ──────────────────────────────────────────────────────────────── -->
    <section class="relative overflow-hidden bg-white dark:bg-zinc-950">
      <!-- Subtle mesh background -->
      <div
        class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_oklch(95%_0.04_350)_0%,_transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top_right,_oklch(20%_0.04_350)_0%,_transparent_60%)]"
      />
      <div
        class="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_oklch(96%_0.03_30)_0%,_transparent_60%)] dark:bg-[radial-gradient(ellipse_at_bottom_left,_oklch(18%_0.03_30)_0%,_transparent_60%)]"
      />

      <div class="velora-container relative z-10">
        <div class="grid min-h-[92vh] grid-cols-1 items-center gap-12 py-16 lg:grid-cols-2 lg:py-0">
          <!-- ── Left: copy ────────────────────────────────────────────────── -->
          <div class="order-2 lg:order-1 max-w-xl">
            <!-- Pill badge -->
            <div
              class="mb-7 inline-flex items-center gap-2 rounded-full border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/60 px-4 py-1.5"
            >
              <span class="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
              <span
                class="text-xs font-semibold text-rose-700 dark:text-rose-300 uppercase tracking-wider"
              >
                {{ t('home.newCollection') }}
              </span>
            </div>

            <h1
              class="font-display text-4xl font-extrabold leading-[1.2] tracking-tight text-zinc-900 dark:text-white sm:text-5xl lg:text-[54px] mb-6"
            >
              {{ t('home.heroTitle') }}
              <span class="gradient-text block mt-1">{{ t('common.tagline').split('. ')[1] }}</span>
            </h1>

            <p class="text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed mb-10">
              {{ t('home.heroSubtitle') }}
            </p>

            <div class="flex flex-wrap items-center gap-4 mb-14">
              <UButton
                to="/shop"
                size="xl"
                class="shadow-xl shadow-rose-500/20 hover:shadow-rose-500/30 transition-all hover:-translate-y-0.5"
              >
                {{ t('home.heroCta') }}
                <UIcon name="heroicons:arrow-right" class="size-4" />
              </UButton>
              <UButton
                to="/about"
                size="xl"
                color="neutral"
                variant="ghost"
                class="hover:-translate-y-0.5 transition-transform"
              >
                {{ t('home.learnStory') }}
              </UButton>
            </div>

            <!-- Stats row -->
            <div class="flex items-center gap-8 pt-6 border-t border-zinc-100 dark:border-zinc-800">
              <div
                v-for="stat in [
                  { value: '10K+', label: t('home.statsProducts') },
                  { value: '50K+', label: t('home.statsCustomers') },
                  { value: '4.9★', label: t('home.statsRating') },
                ]"
                :key="stat.label"
              >
                <p class="font-display text-2xl font-bold text-zinc-900 dark:text-white">
                  {{ stat.value }}
                </p>
                <p class="text-xs text-zinc-400 mt-0.5">{{ stat.label }}</p>
              </div>
            </div>
          </div>

          <!-- ── Right: 3D product showcase ───────────────────────────────── -->
          <div
            class="order-1 lg:order-2 flex items-center justify-center relative h-[480px] lg:h-[600px]"
          >
            <!-- Glow blob -->
            <div
              class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-rose-400/15 dark:bg-rose-500/10 blur-3xl pointer-events-none"
            />

            <!-- Background card (second product) -->
            <div
              class="absolute z-0 w-52 lg:w-60 animate-float-delayed"
              style="
                top: 8%;
                right: 4%;
                transform: perspective(1000px) rotateY(-5deg) rotateX(4deg);
              "
            >
              <div
                class="rounded-[28px] overflow-hidden shadow-2xl shadow-zinc-900/15 dark:shadow-zinc-900/50 ring-1 ring-white/60 dark:ring-white/10 aspect-[3/4]"
              >
                <img
                  v-if="heroImage2"
                  :src="heroImage2"
                  alt="Featured product"
                  class="w-full h-full object-cover"
                />
                <div
                  v-else
                  class="w-full h-full bg-gradient-to-br from-amber-100 via-rose-50 to-pink-100 dark:from-amber-950 dark:via-rose-950 dark:to-pink-950"
                />
              </div>
            </div>

            <!-- Main card (first product — tilted) -->
            <div
              class="relative z-10 w-60 lg:w-72 animate-float"
              style="transform: perspective(1000px) rotateY(-12deg) rotateX(6deg)"
            >
              <div
                class="rounded-[28px] overflow-hidden shadow-[0_32px_64px_-12px_oklch(0%_0_0/0.25)] ring-1 ring-white/80 dark:ring-white/10 aspect-[3/4]"
              >
                <img
                  v-if="heroImage1"
                  :src="heroImage1"
                  alt="Featured product"
                  class="w-full h-full object-cover"
                />
                <div
                  v-else
                  class="w-full h-full bg-gradient-to-br from-rose-100 via-pink-50 to-fuchsia-100 dark:from-rose-950 dark:via-pink-950 dark:to-fuchsia-950"
                />
              </div>

              <!-- Price tag on card -->
              <div
                class="absolute -bottom-4 -left-5 z-20 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl ring-1 ring-zinc-100 dark:ring-zinc-800 px-4 py-3"
              >
                <p class="text-[10px] text-zinc-400 font-medium leading-none mb-1">Starting from</p>
                <p class="text-lg font-bold text-zinc-900 dark:text-white leading-none">
                  ${{ heroPrice.toFixed(0) }}
                </p>
              </div>
            </div>

            <!-- Floating rating badge -->
            <div
              class="absolute top-6 left-4 lg:left-8 z-20 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl ring-1 ring-zinc-100 dark:ring-zinc-800 px-4 py-3 animate-float"
              style="animation-delay: 0.5s"
            >
              <div class="flex items-center gap-2.5">
                <div class="flex gap-0.5">
                  <UIcon
                    v-for="s in 5"
                    :key="s"
                    name="heroicons:star-solid"
                    class="size-3.5 text-amber-400"
                  />
                </div>
                <div>
                  <p class="text-xs font-bold text-zinc-900 dark:text-white leading-none">
                    4.9 / 5
                  </p>
                  <p class="text-[10px] text-zinc-400 mt-0.5">50K+ reviews</p>
                </div>
              </div>
            </div>

            <!-- Floating shipping badge -->
            <div
              class="absolute bottom-10 right-2 lg:right-6 z-20 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl ring-1 ring-zinc-100 dark:ring-zinc-800 px-4 py-3 animate-float-delayed"
            >
              <div class="flex items-center gap-3">
                <div
                  class="h-9 w-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center shrink-0"
                >
                  <UIcon
                    name="heroicons:truck"
                    class="size-5 text-emerald-600 dark:text-emerald-400"
                  />
                </div>
                <div>
                  <p class="text-xs font-bold text-zinc-900 dark:text-white leading-none">
                    Free Shipping
                  </p>
                  <p class="text-[10px] text-zinc-400 mt-0.5">On orders over $50</p>
                </div>
              </div>
            </div>

            <!-- Dot grid decoration -->
            <div
              class="absolute bottom-4 left-4 grid grid-cols-5 gap-1.5 opacity-25 dark:opacity-15 pointer-events-none"
            >
              <div v-for="i in 25" :key="i" class="h-1 w-1 rounded-full bg-rose-400" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Trust bar ─────────────────────────────────────────────────────── -->
    <div class="border-y border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60">
      <div class="velora-container py-5">
        <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div
            v-for="item in [
              { icon: 'heroicons:truck', label: 'Free Shipping', sub: 'Orders over $50' },
              { icon: 'heroicons:arrow-uturn-left', label: 'Easy Returns', sub: '30-day policy' },
              { icon: 'heroicons:shield-check', label: 'Secure Payment', sub: '100% protected' },
              {
                icon: 'heroicons:chat-bubble-left-ellipsis',
                label: '24/7 Support',
                sub: 'Always here for you',
              },
            ]"
            :key="item.label"
            class="flex items-center gap-3 py-1"
          >
            <div
              class="h-10 w-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center shrink-0"
            >
              <UIcon :name="item.icon" class="size-5 text-rose-500 dark:text-rose-400" />
            </div>
            <div>
              <p class="text-sm font-semibold text-zinc-900 dark:text-white leading-tight">
                {{ item.label }}
              </p>
              <p class="text-xs text-zinc-400 mt-0.5">{{ item.sub }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Featured Products ─────────────────────────────────────────────── -->
    <section class="velora-container py-20">
      <div class="flex items-end justify-between mb-10">
        <div>
          <p
            class="text-xs font-semibold uppercase tracking-widest text-rose-500 dark:text-rose-400 mb-2"
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

    <!-- ── Promo Banners ──────────────────────────────────────────────────── -->
    <section class="velora-container pb-20">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <!-- Banner 1: Sale -->
        <NuxtLink
          to="/shop?sale=true"
          class="group relative overflow-hidden rounded-3xl min-h-56 flex flex-col justify-end p-8"
          style="background: linear-gradient(135deg, oklch(55% 0.22 10) 0%, oklch(60% 0.2 25) 100%)"
        >
          <div
            class="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/10 group-hover:scale-110 transition-transform duration-500"
            aria-hidden="true"
          />
          <div
            class="absolute right-8 top-8 h-24 w-24 rounded-full bg-white/8"
            aria-hidden="true"
          />
          <div
            class="absolute -right-4 bottom-0 h-32 w-32 rounded-full bg-black/10"
            aria-hidden="true"
          />
          <!-- Sale tag icon -->
          <div
            class="absolute top-6 right-6 text-5xl opacity-20 group-hover:opacity-30 group-hover:rotate-12 transition-all duration-500"
          >
            🏷️
          </div>
          <div class="relative z-10">
            <p class="text-xs font-bold uppercase tracking-widest text-white/70 mb-2">
              Limited Time
            </p>
            <h3 class="font-display text-3xl font-bold text-white mb-5 leading-tight">
              Summer Sale<br />Up to 50% Off
            </h3>
            <span
              class="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-zinc-900 group-hover:bg-zinc-100 transition-colors shadow-lg"
            >
              Shop Sale
              <UIcon
                name="heroicons:arrow-right"
                class="size-4 group-hover:translate-x-0.5 transition-transform"
              />
            </span>
          </div>
        </NuxtLink>

        <!-- Banner 2: New Arrivals -->
        <NuxtLink
          to="/shop?sort=newest"
          class="group relative overflow-hidden rounded-3xl min-h-56 flex flex-col justify-end p-8 bg-zinc-900 dark:bg-zinc-800"
        >
          <div
            class="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-rose-500/10 group-hover:scale-110 transition-transform duration-500"
            aria-hidden="true"
          />
          <div
            class="absolute right-8 top-8 h-24 w-24 rounded-full bg-rose-400/8"
            aria-hidden="true"
          />
          <div
            class="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,oklch(40%_0.08_350)_0%,transparent_70%)]"
            aria-hidden="true"
          />
          <!-- Sparkle icon -->
          <div
            class="absolute top-6 right-6 text-5xl opacity-20 group-hover:opacity-30 group-hover:rotate-12 transition-all duration-500"
          >
            ✨
          </div>
          <div class="relative z-10">
            <p class="text-xs font-bold uppercase tracking-widest text-rose-400 mb-2">
              Just Dropped
            </p>
            <h3 class="font-display text-3xl font-bold text-white mb-5 leading-tight">
              New Arrivals<br />This Season
            </h3>
            <span
              class="inline-flex items-center gap-2 rounded-full bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white group-hover:bg-rose-600 transition-colors shadow-lg shadow-rose-500/30"
            >
              Explore New
              <UIcon
                name="heroicons:arrow-right"
                class="size-4 group-hover:translate-x-0.5 transition-transform"
              />
            </span>
          </div>
        </NuxtLink>
      </div>
    </section>

    <!-- ── Categories ─────────────────────────────────────────────────────── -->
    <section
      class="border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40 py-20"
    >
      <div class="velora-container">
        <div class="text-center mb-12">
          <p
            class="text-xs font-semibold uppercase tracking-widest text-rose-500 dark:text-rose-400 mb-2"
          >
            {{ t('home.browse') }}
          </p>
          <h2 class="font-display text-3xl font-bold text-zinc-900 dark:text-white">
            {{ t('home.categories') }}
          </h2>
        </div>

        <!-- Skeletons -->
        <div v-if="!categories.length" class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <div
            v-for="i in 6"
            :key="i"
            class="rounded-2xl overflow-hidden aspect-square bg-zinc-200 dark:bg-zinc-800 animate-pulse"
          />
        </div>

        <!-- Category cards -->
        <div v-else class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <NuxtLink
            v-for="cat in categories"
            :key="cat.id"
            :to="`/shop?category=${cat.id}`"
            class="group relative overflow-hidden rounded-2xl aspect-square"
          >
            <!-- Image background -->
            <img
              v-if="cat.image"
              :src="cat.image"
              :alt="getCategoryName(cat)"
              class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <!-- Gradient fallback -->
            <div
              v-else
              class="absolute inset-0 bg-linear-to-br from-rose-100 via-pink-50 to-rose-200 dark:from-rose-950 dark:via-pink-950 dark:to-rose-900 transition-transform duration-500 group-hover:scale-105"
            >
              <div class="absolute inset-0 flex items-center justify-center">
                <UIcon
                  name="heroicons:squares-2x2"
                  class="size-10 text-rose-300 dark:text-rose-700"
                />
              </div>
            </div>

            <!-- Dark gradient overlay -->
            <div
              class="absolute inset-0 bg-linear-to-t from-zinc-900/75 via-zinc-900/20 to-zinc-900/5 group-hover:from-zinc-900/85 transition-colors duration-300"
            />

            <!-- Label -->
            <div class="absolute inset-x-0 bottom-0 p-3.5">
              <p class="text-sm font-bold text-white leading-snug drop-shadow-sm">
                {{ getCategoryName(cat) }}
              </p>
            </div>

            <!-- Hover shine -->
            <div
              class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-linear-to-tr from-transparent via-white/5 to-white/10"
            />
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
