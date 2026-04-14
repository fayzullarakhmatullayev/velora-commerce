<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const router = useRouter()

useSeoMeta({
  title: `Shop — Velora Commerce`,
  description: 'Browse our full collection of premium products.',
})

// ── Filters (synced to URL query params) ─────────────────────────────────────
const filters = ref({
  categoryId: (route.query.category as string) || null,
  sort: (route.query.sort as string) || 'newest',
  minPrice: (route.query.min as string) || '',
  maxPrice: (route.query.max as string) || '',
})

const search = ref((route.query.q as string) || '')
const searchDebounced = refDebounced(search, 400)
const page = ref(Number(route.query.page) || 1)
const filtersOpen = ref(false)

// ── URL sync ─────────────────────────────────────────────────────────────────
// Computed URL query — Vue batches all filter/page changes into one object
// before the watcher fires, so router.replace is called only once per tick.
const urlQuery = computed(() => ({
  ...(filters.value.categoryId ? { category: filters.value.categoryId } : {}),
  ...(filters.value.sort !== 'newest' ? { sort: filters.value.sort } : {}),
  ...(filters.value.minPrice ? { min: filters.value.minPrice } : {}),
  ...(filters.value.maxPrice ? { max: filters.value.maxPrice } : {}),
  ...(searchDebounced.value ? { q: searchDebounced.value } : {}),
  ...(page.value > 1 ? { page: String(page.value) } : {}),
}))

// Single watcher on the computed — fires once even if multiple filters change together
watch(urlQuery, (query) => {
  router.replace({ query })
})

// Reset to page 1 when filters or search change (watch specific scalar fields — no deep)
watch(
  [
    () => filters.value.categoryId,
    () => filters.value.sort,
    () => filters.value.minPrice,
    () => filters.value.maxPrice,
    searchDebounced,
  ],
  () => {
    page.value = 1
  },
)

// ── Fetch products ─────────────────────────────────────────────────────────
const queryOptions = computed(() => ({
  categoryId: filters.value.categoryId,
  sort: filters.value.sort,
  search: searchDebounced.value || null,
  minPrice: filters.value.minPrice || null,
  maxPrice: filters.value.maxPrice || null,
  page: page.value,
}))

const { data, pending } = useProducts(queryOptions)

const products = computed(() => data.value?.products ?? [])
const total = computed(() => data.value?.total ?? 0)
const totalPages = computed(() => Math.ceil(total.value / 20))
</script>

<template>
  <div class="velora-container py-8 lg:py-12">
    <!-- Page header -->
    <div class="mb-8">
      <h1 class="font-display text-3xl font-bold text-zinc-900 dark:text-white">
        {{ t('nav.shop') }}
      </h1>
      <p class="mt-1 text-zinc-500 dark:text-zinc-400">
        {{ total > 0 ? t('shop.showResults', { count: total }) : t('shop.browseCollection') }}
      </p>
    </div>

    <!-- Search + filter toggle row -->
    <div class="flex items-center gap-3 mb-6">
      <UInput
        v-model="search"
        :placeholder="t('common.search') + '...'"
        icon="heroicons:magnifying-glass"
        size="md"
        class="flex-1 max-w-md"
      />
      <!-- Mobile filter toggle -->
      <UButton
        icon="heroicons:adjustments-horizontal"
        color="neutral"
        variant="outline"
        class="lg:hidden"
        @click="filtersOpen = true"
      >
        {{ t('common.filter') }}
      </UButton>
    </div>

    <div class="flex gap-8">
      <!-- ── Sidebar filters (desktop) ──────────────────────────────────── -->
      <aside class="hidden lg:block w-56 shrink-0">
        <div class="sticky top-24">
          <h3 class="mb-4 text-sm font-semibold text-zinc-900 dark:text-white">
            {{ t('common.filter') }}
          </h3>
          <ProductFilters v-model="filters" />
        </div>
      </aside>

      <!-- ── Product grid ─────────────────────────────────────────────── -->
      <main class="flex-1 min-w-0">
        <!-- Empty state -->
        <div
          v-if="!pending && products.length === 0"
          class="flex flex-col items-center justify-center py-24 text-center"
        >
          <UIcon
            name="heroicons:magnifying-glass"
            class="size-16 text-zinc-200 dark:text-zinc-700 mb-4"
          />
          <p class="font-medium text-zinc-700 dark:text-zinc-300">
            {{ t('shop.noProductsFound') }}
          </p>
          <p class="mt-1 text-sm text-zinc-400">{{ t('shop.noProductsHint') }}</p>
        </div>

        <ProductGrid :products="products" :loading="pending" />

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="mt-12 flex justify-center">
          <UPagination v-model:page="page" :total="total" :page-count="20" />
        </div>
      </main>
    </div>

    <!-- Mobile filter drawer -->
    <USlideover v-model:open="filtersOpen" side="left" :class="{ width: 'max-w-xs' }">
      <template #content>
        <div class="flex h-full flex-col bg-white dark:bg-zinc-900">
          <div
            class="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 px-5 py-4"
          >
            <h3 class="font-semibold text-zinc-900 dark:text-white">{{ t('common.filter') }}</h3>
            <UButton
              icon="heroicons:x-mark"
              color="neutral"
              variant="ghost"
              size="sm"
              @click="filtersOpen = false"
            />
          </div>
          <div class="flex-1 overflow-y-auto px-5 py-4">
            <ProductFilters v-model="filters" />
          </div>
          <div class="border-t border-zinc-100 dark:border-zinc-800 p-4">
            <UButton block @click="filtersOpen = false">{{
              t('shop.showResults', { count: total })
            }}</UButton>
          </div>
        </div>
      </template>
    </USlideover>
  </div>
</template>
