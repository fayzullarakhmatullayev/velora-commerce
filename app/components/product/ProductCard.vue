<script setup lang="ts">
import type { ProductRow } from '~/composables/useProducts'

const props = defineProps<{
  product: ProductRow
}>()

const { t, locale } = useI18n()
const { addProduct } = useCart()
const { store: wishlistStore, toggleProduct } = useWishlist()

const title = computed(
  () =>
    props.product.translations[locale.value as keyof typeof props.product.translations]?.title ||
    props.product.translations['en']?.title ||
    'Product',
)
const slug = computed(() => props.product.translations['en']?.slug ?? props.product.id)

const mainImage = computed(() => props.product.images?.[0] ?? '')
const secondImage = computed(() => props.product.images?.[1] ?? mainImage.value)

const isOnSale = computed(
  () => props.product.compare_price != null && props.product.compare_price > props.product.price,
)

const discountPercent = computed(() => {
  if (!isOnSale.value || !props.product.compare_price) return 0
  return Math.round(
    ((props.product.compare_price - props.product.price) / props.product.compare_price) * 100,
  )
})

const inStock = computed(() => props.product.stock > 0)
const inWishlist = computed(() => wishlistStore.isInWishlist(props.product.id))

const hovered = ref(false)
const adding = ref(false)

function handleAddToCart(e: Event) {
  e.preventDefault()
  e.stopPropagation()
  if (!inStock.value || adding.value) return
  adding.value = true
  addProduct(props.product, 1)
  setTimeout(() => { adding.value = false }, 1200)
}

function handleWishlist(e: Event) {
  e.preventDefault()
  e.stopPropagation()
  toggleProduct(props.product)
}
</script>

<template>
  <NuxtLink
    :to="`/product/${slug}`"
    class="group flex flex-col"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
  >
    <!-- ── Image container ────────────────────────────────────────────────── -->
    <div
      class="relative overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 aspect-3/4 transition-all duration-500"
      :class="hovered ? 'shadow-2xl shadow-zinc-900/15 dark:shadow-zinc-900/50 -translate-y-1' : 'shadow-md shadow-zinc-900/5'"
    >
      <!-- Primary image -->
      <img
        v-if="mainImage"
        :src="mainImage"
        :alt="title"
        class="absolute inset-0 h-full w-full object-cover transition-all duration-700"
        :class="hovered && secondImage !== mainImage ? 'opacity-0 scale-110' : 'opacity-100 scale-100'"
        loading="lazy"
      />

      <!-- Secondary image (hover swap) -->
      <img
        v-if="secondImage && secondImage !== mainImage"
        :src="secondImage"
        :alt="title"
        class="absolute inset-0 h-full w-full object-cover transition-all duration-700"
        :class="hovered ? 'opacity-100 scale-100' : 'opacity-0 scale-110'"
        loading="lazy"
      />

      <!-- Placeholder -->
      <div v-if="!mainImage" class="absolute inset-0 flex items-center justify-center">
        <UIcon name="heroicons:photo" class="size-16 text-zinc-300 dark:text-zinc-600" />
      </div>

      <!-- Gradient overlay at bottom for better button contrast -->
      <div
        class="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-zinc-900/50 to-transparent transition-opacity duration-300"
        :class="hovered ? 'opacity-100' : 'opacity-0'"
      />

      <!-- Badges top-left -->
      <div class="absolute left-3 top-3 flex flex-col gap-1.5 z-10">
        <span
          v-if="isOnSale"
          class="inline-flex items-center rounded-full bg-rose-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm"
        >
          −{{ discountPercent }}%
        </span>
        <span
          v-if="product.is_featured"
          class="inline-flex items-center rounded-full bg-amber-400 px-2.5 py-1 text-[11px] font-bold text-amber-900 shadow-sm"
        >
          {{ t('common.featured') }}
        </span>
        <span
          v-if="!inStock"
          class="inline-flex items-center rounded-full bg-zinc-800/80 backdrop-blur-sm px-2.5 py-1 text-[11px] font-semibold text-white"
        >
          {{ t('common.outOfStock') }}
        </span>
      </div>

      <!-- Wishlist button top-right -->
      <button
        class="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm shadow-md ring-1 ring-white/20 transition-all duration-300"
        :class="inWishlist ? 'opacity-100 scale-100' : 'opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100'"
        :aria-label="inWishlist ? 'Remove from wishlist' : 'Add to wishlist'"
        @click="handleWishlist"
      >
        <UIcon
          :name="inWishlist ? 'heroicons:heart-solid' : 'heroicons:heart'"
          class="size-4 transition-colors"
          :class="inWishlist ? 'text-rose-500' : 'text-zinc-500 hover:text-rose-500'"
        />
      </button>

      <!-- Add to cart button (slide up on hover) -->
      <div
        class="absolute inset-x-3 bottom-3 z-10 transition-all duration-300"
        :class="hovered && inStock ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'"
      >
        <button
          :disabled="!inStock || adding"
          class="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-200"
          :class="adding
            ? 'bg-emerald-500 scale-95'
            : 'bg-zinc-900/90 dark:bg-zinc-800/90 backdrop-blur-sm hover:bg-zinc-900 active:scale-95'"
          @click="handleAddToCart"
        >
          <UIcon
            :name="adding ? 'heroicons:check' : 'heroicons:shopping-bag'"
            class="size-4 transition-all"
          />
          {{ adding ? 'Added!' : t('common.addToCart') }}
        </button>
      </div>
    </div>

    <!-- ── Product info ────────────────────────────────────────────────────── -->
    <div class="mt-3.5 space-y-1 px-0.5">
      <p class="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 truncate">
        {{ product.brand ?? '&nbsp;' }}
      </p>
      <h3 class="text-sm font-semibold text-zinc-800 dark:text-zinc-100 leading-snug line-clamp-2 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors duration-200">
        {{ title }}
      </h3>
      <div class="flex items-center gap-2 pt-1">
        <span class="font-bold text-zinc-900 dark:text-white">
          ${{ product.price.toFixed(2) }}
        </span>
        <span
          v-if="isOnSale && product.compare_price"
          class="text-xs text-zinc-400 line-through"
        >
          ${{ product.compare_price.toFixed(2) }}
        </span>
        <span
          v-if="isOnSale && discountPercent"
          class="ml-auto text-[11px] font-bold text-rose-500 dark:text-rose-400"
        >
          Save {{ discountPercent }}%
        </span>
      </div>
    </div>
  </NuxtLink>
</template>
