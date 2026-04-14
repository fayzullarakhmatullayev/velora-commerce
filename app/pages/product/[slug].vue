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
      <div class="mt-20 pt-12 border-t border-zinc-100 dark:border-zinc-800">

        <!-- Section header -->
        <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10">
          <div>
            <h2 class="font-display text-2xl font-bold text-zinc-900 dark:text-white mb-2">
              {{ t('product.reviewsTitle') }}
            </h2>
            <!-- Rating summary -->
            <div v-if="reviews.length" class="flex items-center gap-3">
              <div class="flex items-center gap-0.5">
                <UIcon
                  v-for="star in 5"
                  :key="star"
                  name="heroicons:star-solid"
                  class="size-5"
                  :class="star <= Math.round(avgRating) ? 'text-amber-400' : 'text-zinc-200 dark:text-zinc-700'"
                />
              </div>
              <span class="text-xl font-bold text-zinc-900 dark:text-white">{{ avgRating.toFixed(1) }}</span>
              <span class="text-sm text-zinc-400">
                {{ t('product.basedOn') }} {{ reviews.length }} {{ reviews.length !== 1 ? t('product.reviewPlural') : t('product.reviewSingular') }}
              </span>
            </div>
            <p v-else class="text-sm text-zinc-400">{{ t('product.noReviewsYet') }}</p>
          </div>

          <!-- CTA -->
          <div class="shrink-0">
            <UButton
              v-if="canReview && !showForm"
              icon="heroicons:pencil-square"
              size="md"
              @click="showForm = true"
            >
              {{ t('product.writeReview') }}
            </UButton>
            <NuxtLink v-else-if="!user" to="/auth/login">
              <UButton icon="heroicons:user" size="md" variant="outline" color="neutral">
                {{ t('product.loginToReview') }}
              </UButton>
            </NuxtLink>
          </div>
        </div>

        <!-- Pending review banner -->
        <Transition name="fade">
          <div
            v-if="userReview && !userReview.is_approved"
            class="mb-8 flex items-start gap-4 rounded-2xl border border-amber-200 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/20 px-5 py-4"
          >
            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40">
              <UIcon name="heroicons:clock" class="size-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-amber-900 dark:text-amber-200 text-sm">{{ t('product.reviewPending') }}</p>
              <div class="flex items-center gap-1 mt-1.5 mb-1">
                <UIcon
                  v-for="s in 5"
                  :key="s"
                  name="heroicons:star-solid"
                  class="size-3.5"
                  :class="s <= userReview.rating ? 'text-amber-400' : 'text-amber-200 dark:text-amber-800'"
                />
              </div>
              <p v-if="userReview.comment" class="text-sm text-amber-700 dark:text-amber-400 leading-relaxed">
                "{{ userReview.comment }}"
              </p>
            </div>
          </div>
        </Transition>

        <!-- Write review form -->
        <Transition name="slide-down">
          <div
            v-if="showForm && canReview"
            class="mb-10 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm"
          >
            <!-- Form header -->
            <div class="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
              <h3 class="font-semibold text-zinc-900 dark:text-white">{{ t('product.shareExperience') }}</h3>
              <button
                class="flex h-7 w-7 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-600 transition-colors"
                @click="showForm = false; reviewRating = 0; reviewComment = ''"
              >
                <UIcon name="heroicons:x-mark" class="size-4" />
              </button>
            </div>

            <div class="px-6 py-5 space-y-6">
              <!-- Star picker -->
              <div class="space-y-2">
                <label class="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  {{ t('product.overallRating') }} <span class="text-red-500">*</span>
                </label>
                <div class="flex items-center gap-2">
                  <div class="flex items-center gap-1">
                    <button
                      v-for="star in 5"
                      :key="star"
                      type="button"
                      class="transition-transform active:scale-90"
                      :class="star <= (reviewHover || reviewRating) ? 'scale-110' : 'scale-100'"
                      @mouseenter="reviewHover = star"
                      @mouseleave="reviewHover = 0"
                      @click="reviewRating = star"
                    >
                      <UIcon
                        name="heroicons:star-solid"
                        class="size-9 transition-all duration-150"
                        :class="star <= (reviewHover || reviewRating) ? 'text-amber-400 drop-shadow-sm' : 'text-zinc-200 dark:text-zinc-700'"
                      />
                    </button>
                  </div>
                  <Transition name="fade">
                    <span
                      v-if="reviewRating"
                      class="text-sm font-semibold px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                    >
                      {{ reviewRating ? t(`product.ratingLabels.${reviewRating}`) : '' }}
                    </span>
                  </Transition>
                </div>
              </div>

              <!-- Comment -->
              <div class="space-y-2">
                <label class="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  {{ t('product.reviewCommentLabel') }}
                  <span class="ml-1 text-xs font-normal text-zinc-400">{{ t('product.reviewCommentOptional') }}</span>
                </label>
                <UTextarea
                  v-model="reviewComment"
                  :placeholder="t('product.reviewPlaceholder')"
                  :rows="4"
                  class="w-full"
                />
              </div>

              <!-- Actions -->
              <div class="flex items-center gap-3 pt-1">
                <UButton
                  size="md"
                  :disabled="reviewRating === 0"
                  :loading="submitting"
                  class="shadow-sm shadow-primary-500/20"
                  @click="handleSubmitReview"
                >
                  {{ t('product.submitReview') }}
                </UButton>
                <UButton
                  size="md"
                  color="neutral"
                  variant="ghost"
                  @click="showForm = false; reviewRating = 0; reviewComment = ''"
                >
                  {{ t('common.cancel') }}
                </UButton>
              </div>
            </div>
          </div>
        </Transition>

        <!-- Skeletons -->
        <div v-if="reviewsPending" class="space-y-6">
          <div v-for="i in 3" :key="i" class="flex gap-4">
            <USkeleton class="size-11 rounded-full shrink-0" />
            <div class="flex-1 space-y-2.5 pt-1">
              <div class="flex gap-3">
                <USkeleton class="h-4 w-28" />
                <USkeleton class="h-4 w-20" />
              </div>
              <USkeleton class="h-3.5 w-24" />
              <USkeleton class="h-4 w-full" />
              <USkeleton class="h-4 w-3/4" />
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-else-if="!reviews.length" class="flex flex-col items-center py-20 text-center">
          <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
            <UIcon name="heroicons:chat-bubble-left-right" class="size-8 text-zinc-400 dark:text-zinc-500" />
          </div>
          <p class="font-semibold text-zinc-700 dark:text-zinc-300 mb-1">{{ t('product.noReviewsYet') }}</p>
          <p class="text-sm text-zinc-400 mb-5">{{ t('product.noReviewsDesc') }}</p>
          <UButton v-if="canReview && !showForm" icon="heroicons:pencil-square" variant="outline" color="neutral" @click="showForm = true">
            {{ t('product.writeFirstReview') }}
          </UButton>
        </div>

        <!-- Review cards -->
        <div v-else class="divide-y divide-zinc-100 dark:divide-zinc-800">
          <div
            v-for="review in reviews"
            :key="review.id"
            class="flex gap-4 py-6 first:pt-0"
          >
            <!-- Avatar -->
            <div class="size-11 rounded-full overflow-hidden shrink-0 bg-linear-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-700 flex items-center justify-center ring-2 ring-white dark:ring-zinc-900">
              <img
                v-if="review.profile.avatar_url"
                :src="review.profile.avatar_url"
                class="size-full object-cover"
              />
              <span v-else class="text-xs font-bold text-zinc-500 dark:text-zinc-400">
                {{ initials(review.profile.full_name) }}
              </span>
            </div>

            <div class="flex-1 min-w-0">
              <!-- Name + date -->
              <div class="flex flex-wrap items-center gap-x-2 gap-y-1 mb-2">
                <span class="font-semibold text-sm text-zinc-900 dark:text-white">
                  {{ review.profile.full_name ?? t('product.anonymous') }}
                </span>
                <span class="text-zinc-300 dark:text-zinc-600 text-xs">•</span>
                <span class="text-xs text-zinc-400">{{ formatDate(review.created_at) }}</span>
              </div>

              <!-- Stars + numeric -->
              <div class="flex items-center gap-2 mb-3">
                <div class="flex items-center gap-0.5">
                  <UIcon
                    v-for="star in 5"
                    :key="star"
                    name="heroicons:star-solid"
                    class="size-4"
                    :class="star <= review.rating ? 'text-amber-400' : 'text-zinc-200 dark:text-zinc-700'"
                  />
                </div>
                <span class="text-xs font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-md">
                  {{ review.rating }}.0
                </span>
              </div>

              <!-- Comment -->
              <p v-if="review.comment" class="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                {{ review.comment }}
              </p>
              <p v-else class="text-sm text-zinc-400 italic">{{ t('product.noWrittenReview') }}</p>
            </div>
          </div>
        </div>

      </div>

    </template>
  </div>
</template>
