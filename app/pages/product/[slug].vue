<script setup lang="ts">
import type { ProductVariantRow } from '~/composables/useProduct'

const route = useRoute()
const { t } = useI18n()
const { addProduct } = useCart()
const { store: wishlistStore, toggleProduct } = useWishlist()

const slug = computed(() => route.params.slug as string)
const { product, variants, pending, title, description, isOnSale, discountPercent, inStock } =
  useProduct(slug)

// SEO
useSeoMeta({
  title: computed(() => (title.value ? `${title.value} — Velora Commerce` : 'Product')),
  description: computed(() => description.value?.slice(0, 160) || ''),
  ogImage: computed(() => product.value?.images?.[0] || ''),
})

// ── State ────────────────────────────────────────────────────────────────────
const quantity = ref(1)
const selectedVariant = ref<ProductVariantRow | null>(null)
const addingToCart = ref(false)

const inWishlist = computed(() =>
  product.value ? wishlistStore.isInWishlist(product.value.id) : false,
)

const effectivePrice = computed(
  () => selectedVariant.value?.price ?? product.value?.price ?? 0,
)

async function handleAddToCart() {
  if (!product.value || !inStock.value) return
  addingToCart.value = true
  await nextTick()

  for (let i = 0; i < quantity.value; i++) {
    addProduct(product.value, 1, selectedVariant.value ?? undefined)
  }

  addingToCart.value = false
}

function handleWishlist() {
  if (!product.value) return
  toggleProduct(product.value)
}

// 404 guard
if (!pending.value && !product.value) {
  throw createError({ statusCode: 404, statusMessage: 'Product not found' })
}
</script>

<template>
  <div class="velora-container py-8 lg:py-12">

    <!-- Loading -->
    <div v-if="pending" class="grid grid-cols-1 gap-10 lg:grid-cols-2">
      <VSkeleton class="aspect-square w-full rounded-2xl" />
      <div class="space-y-4">
        <VSkeleton class="h-8 w-3/4 rounded" />
        <VSkeleton class="h-5 w-1/4 rounded" />
        <VSkeleton class="h-6 w-1/3 rounded" />
        <VSkeleton class="h-32 w-full rounded" />
        <VSkeleton class="h-12 w-full rounded-xl" />
      </div>
    </div>

    <template v-else-if="product">
      <!-- Breadcrumb -->
      <nav class="mb-6 flex items-center gap-2 text-sm text-zinc-400">
        <NuxtLink to="/" class="hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">Home</NuxtLink>
        <UIcon name="heroicons:chevron-right" class="size-3.5" />
        <NuxtLink to="/shop" class="hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">{{ t('nav.shop') }}</NuxtLink>
        <UIcon name="heroicons:chevron-right" class="size-3.5" />
        <span class="text-zinc-600 dark:text-zinc-300 truncate max-w-[200px]">{{ title }}</span>
      </nav>

      <!-- Main layout -->
      <div class="grid grid-cols-1 gap-10 lg:grid-cols-2">

        <!-- ── Image gallery ────────────────────────────────────────────── -->
        <div>
          <ProductImageGallery
            :images="product.images"
            :title="title"
          />
        </div>

        <!-- ── Product details ──────────────────────────────────────────── -->
        <div class="space-y-6">

          <!-- Brand + title -->
          <div>
            <p v-if="product.brand" class="mb-1 text-sm font-medium text-zinc-400 uppercase tracking-wider">
              {{ product.brand }}
            </p>
            <h1 class="font-display text-3xl font-bold text-zinc-900 dark:text-white leading-tight">
              {{ title }}
            </h1>
          </div>

          <!-- Price -->
          <div class="flex items-center gap-3">
            <span class="text-3xl font-bold text-zinc-900 dark:text-white">
              ${{ effectivePrice.toFixed(2) }}
            </span>
            <span
              v-if="isOnSale && product.compare_price"
              class="text-lg text-zinc-400 line-through"
            >
              ${{ product.compare_price.toFixed(2) }}
            </span>
            <VBadge v-if="isOnSale" color="error">Save {{ discountPercent }}%</VBadge>
          </div>

          <!-- Stock status -->
          <div class="flex items-center gap-2">
            <div
              class="h-2 w-2 rounded-full"
              :class="inStock ? 'bg-emerald-500' : 'bg-zinc-300'"
            />
            <span
              class="text-sm font-medium"
              :class="inStock ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400'"
            >
              {{ inStock ? `${t('common.inStock')} (${product.stock} left)` : t('common.outOfStock') }}
            </span>
          </div>

          <USeparator />

          <!-- Variants -->
          <div v-if="variants && variants.length > 0" class="space-y-3">
            <label class="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Variant
            </label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="v in variants"
                :key="v.id"
                class="rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all"
                :class="
                  selectedVariant?.id === v.id
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-950 text-primary-700'
                    : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-400'
                "
                :disabled="v.stock === 0"
                @click="selectedVariant = v"
              >
                {{ Object.values(v.attributes).join(' / ') }}
                <span v-if="v.stock === 0" class="ml-1 text-zinc-400">(sold out)</span>
              </button>
            </div>
          </div>

          <!-- Quantity + Add to Cart -->
          <div class="flex items-center gap-3">
            <!-- Quantity -->
            <div class="flex items-center rounded-xl border border-zinc-200 dark:border-zinc-700">
              <button
                class="flex h-11 w-11 items-center justify-center rounded-l-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                @click="quantity = Math.max(1, quantity - 1)"
              >
                <UIcon name="heroicons:minus" class="size-4" />
              </button>
              <span class="w-10 text-center font-semibold tabular-nums">{{ quantity }}</span>
              <button
                class="flex h-11 w-11 items-center justify-center rounded-r-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                @click="quantity = Math.min(product.stock, quantity + 1)"
              >
                <UIcon name="heroicons:plus" class="size-4" />
              </button>
            </div>

            <!-- Add to cart -->
            <UButton
              class="flex-1 shadow-lg shadow-primary-500/20"
              size="lg"
              :disabled="!inStock"
              :loading="addingToCart"
              @click="handleAddToCart"
            >
              <UIcon name="heroicons:shopping-bag" class="size-5" />
              {{ inStock ? t('common.addToCart') : t('common.outOfStock') }}
            </UButton>

            <!-- Wishlist -->
            <UButton
              :icon="inWishlist ? 'heroicons:heart-solid' : 'heroicons:heart'"
              color="neutral"
              variant="outline"
              size="lg"
              :class="inWishlist ? 'text-rose-500 border-rose-300' : ''"
              :aria-label="inWishlist ? 'Remove from wishlist' : 'Add to wishlist'"
              @click="handleWishlist"
            />
          </div>

          <!-- Buy now -->
          <UButton
            to="/checkout"
            color="neutral"
            variant="outline"
            block
            size="lg"
            @click="handleAddToCart"
          >
            {{ t('common.buyNow') }}
          </UButton>

          <USeparator />

          <!-- Description -->
          <div class="space-y-2">
            <h3 class="font-semibold text-zinc-900 dark:text-white">{{ t('product.description') }}</h3>
            <p class="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-line">
              {{ description || 'No description available.' }}
            </p>
          </div>

          <!-- Meta (SKU, tags, category) -->
          <div class="space-y-1.5 text-xs text-zinc-400">
            <p v-if="product.sku">
              <span class="font-medium text-zinc-500">{{ t('product.sku') }}:</span> {{ product.sku }}
            </p>
            <p v-if="product.tags.length">
              <span class="font-medium text-zinc-500">{{ t('product.tags') }}:</span>
              {{ product.tags.join(', ') }}
            </p>
          </div>

        </div>
      </div>
    </template>
  </div>
</template>
