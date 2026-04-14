<script setup lang="ts">
import type { ProductVariantRow } from '~/composables/useProduct'

const route = useRoute()
const { t } = useI18n()
const { addProduct } = useCart()
const { store: wishlistStore, toggleProduct } = useWishlist()
const user = useSupabaseUser()

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

// ── Reviews ──────────────────────────────────────────────────────────────────
const productId = computed(() => product.value?.id)
const { reviews, userReview, avgRating, pending: reviewsPending, refresh: refreshReviews } = useProductReviews(productId)
const { submitReview, submitting } = useSubmitReview()

const reviewRating = ref(0)
const reviewHover = ref(0)
const reviewComment = ref('')
const showForm = ref(false)

const canReview = computed(() => !!user.value && !userReview.value)

async function handleSubmitReview() {
  if (!product.value || reviewRating.value === 0) return
  await submitReview(product.value.id, reviewRating.value, reviewComment.value, () => {
    reviewRating.value = 0
    reviewComment.value = ''
    showForm.value = false
    refreshReviews()
  })
}

function initials(name: string | null) {
  if (!name) return '?'
  return name.split(' ').map((p: string) => p[0]).join('').slice(0, 2).toUpperCase()
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
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
        <NuxtLink to="/" class="hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">{{ t('breadcrumb.home') }}</NuxtLink>
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
            <VBadge v-if="isOnSale" color="error">{{ t('common.sale') }} {{ discountPercent }}%</VBadge>
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
              {{ t('product.variant') }}
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
                <span v-if="v.stock === 0" class="ml-1 text-zinc-400">{{ t('product.soldOut') }}</span>
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
              {{ description || t('product.noDescription') }}
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

      <!-- ── Reviews section ─────────────────────────────────────────── -->
      <div class="mt-16 border-t border-zinc-100 dark:border-zinc-800 pt-12">

        <!-- Header row -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 class="font-display text-2xl font-bold text-zinc-900 dark:text-white">
              Reviews
            </h2>
            <div class="flex items-center gap-2 mt-1">
              <!-- Average stars -->
              <div class="flex items-center gap-0.5">
                <UIcon
                  v-for="star in 5"
                  :key="star"
                  name="heroicons:star-solid"
                  class="size-4"
                  :class="star <= Math.round(avgRating) ? 'text-amber-400' : 'text-zinc-200 dark:text-zinc-700'"
                />
              </div>
              <span v-if="reviews.length" class="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                {{ avgRating.toFixed(1) }}
              </span>
              <span class="text-sm text-zinc-400">
                {{ reviews.length }} review{{ reviews.length !== 1 ? 's' : '' }}
              </span>
            </div>
          </div>

          <!-- Write review button -->
          <div>
            <UButton
              v-if="canReview && !showForm"
              icon="heroicons:pencil-square"
              size="sm"
              variant="outline"
              color="neutral"
              @click="showForm = true"
            >
              Write a Review
            </UButton>
            <NuxtLink v-else-if="!user" to="/auth/login">
              <UButton icon="heroicons:pencil-square" size="sm" variant="outline" color="neutral">
                Log in to review
              </UButton>
            </NuxtLink>
          </div>
        </div>

        <!-- Own pending review notice -->
        <div
          v-if="userReview && !userReview.is_approved"
          class="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-4 py-3"
        >
          <UIcon name="heroicons:clock" class="size-5 text-amber-500 shrink-0 mt-0.5" />
          <div class="text-sm">
            <p class="font-medium text-amber-800 dark:text-amber-300">Your review is pending approval</p>
            <p class="text-amber-600 dark:text-amber-400 mt-0.5">
              <span class="flex gap-0.5 items-center">
                <UIcon
                  v-for="s in 5"
                  :key="s"
                  name="heroicons:star-solid"
                  class="size-3"
                  :class="s <= userReview.rating ? 'text-amber-400' : 'text-amber-200'"
                />
              </span>
              {{ userReview.comment ?? 'No comment' }}
            </p>
          </div>
        </div>

        <!-- Write review form -->
        <div
          v-if="showForm && canReview"
          class="mb-8 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 p-5 space-y-4"
        >
          <h3 class="font-semibold text-zinc-900 dark:text-white">Your Review</h3>

          <!-- Star picker -->
          <div class="space-y-1.5">
            <label class="text-sm font-medium text-zinc-600 dark:text-zinc-300">Rating <span class="text-red-500">*</span></label>
            <div class="flex items-center gap-1">
              <button
                v-for="star in 5"
                :key="star"
                type="button"
                class="p-0.5 transition-transform hover:scale-110"
                @mouseenter="reviewHover = star"
                @mouseleave="reviewHover = 0"
                @click="reviewRating = star"
              >
                <UIcon
                  name="heroicons:star-solid"
                  class="size-8 transition-colors"
                  :class="star <= (reviewHover || reviewRating) ? 'text-amber-400' : 'text-zinc-200 dark:text-zinc-700'"
                />
              </button>
              <span v-if="reviewRating" class="ml-2 text-sm font-medium text-zinc-500">
                {{ ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'][reviewRating] }}
              </span>
            </div>
          </div>

          <!-- Comment -->
          <div class="space-y-1.5">
            <label class="text-sm font-medium text-zinc-600 dark:text-zinc-300">Comment <span class="text-zinc-400 font-normal">(optional)</span></label>
            <UTextarea
              v-model="reviewComment"
              placeholder="Share your experience with this product…"
              :rows="4"
              :ui="{ base: 'w-full' }"
            />
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2">
            <UButton
              :disabled="reviewRating === 0 || submitting"
              :loading="submitting"
              @click="handleSubmitReview"
            >
              Submit Review
            </UButton>
            <UButton color="neutral" variant="ghost" @click="showForm = false; reviewRating = 0; reviewComment = ''">
              Cancel
            </UButton>
          </div>
        </div>

        <!-- Reviews list -->
        <div v-if="reviewsPending" class="space-y-4">
          <div v-for="i in 3" :key="i" class="flex gap-4">
            <USkeleton class="size-10 rounded-full shrink-0" />
            <div class="flex-1 space-y-2">
              <USkeleton class="h-4 w-32" />
              <USkeleton class="h-4 w-full" />
              <USkeleton class="h-4 w-3/4" />
            </div>
          </div>
        </div>

        <div v-else-if="!reviews.length && !reviewsPending" class="flex flex-col items-center py-16 text-center">
          <UIcon name="heroicons:star" class="size-10 text-zinc-200 dark:text-zinc-700 mb-3" />
          <p class="text-zinc-500 dark:text-zinc-400">No reviews yet. Be the first!</p>
        </div>

        <div v-else class="space-y-6">
          <div
            v-for="review in reviews"
            :key="review.id"
            class="flex gap-4 pb-6 border-b border-zinc-100 dark:border-zinc-800 last:border-0 last:pb-0"
          >
            <!-- Avatar -->
            <div class="size-10 rounded-full overflow-hidden shrink-0 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
              <img
                v-if="review.profile.avatar_url"
                :src="review.profile.avatar_url"
                class="size-full object-cover"
              />
              <span v-else class="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                {{ initials(review.profile.full_name) }}
              </span>
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex flex-wrap items-center gap-x-2 gap-y-0.5 mb-1.5">
                <span class="font-medium text-sm text-zinc-900 dark:text-white">
                  {{ review.profile.full_name ?? 'Anonymous' }}
                </span>
                <span class="text-zinc-300 dark:text-zinc-600">·</span>
                <span class="text-xs text-zinc-400">{{ formatDate(review.created_at) }}</span>
              </div>
              <div class="flex items-center gap-0.5 mb-2">
                <UIcon
                  v-for="star in 5"
                  :key="star"
                  name="heroicons:star-solid"
                  class="size-3.5"
                  :class="star <= review.rating ? 'text-amber-400' : 'text-zinc-200 dark:text-zinc-700'"
                />
              </div>
              <p v-if="review.comment" class="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                {{ review.comment }}
              </p>
              <p v-else class="text-sm text-zinc-400 italic">No comment</p>
            </div>
          </div>
        </div>

      </div>

    </template>
  </div>
</template>
