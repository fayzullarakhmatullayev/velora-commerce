<script setup lang="ts">
import type { ProductRow } from '~/composables/useProducts'

const props = defineProps<{
  product: ProductRow
}>()

const { t, locale } = useI18n()
const { addProduct } = useCart()
const { store: wishlistStore, toggleProduct } = useWishlist()

// Translated fields
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
  () =>
    props.product.compare_price != null &&
    props.product.compare_price > props.product.price,
)

const discountPercent = computed(() => {
  if (!isOnSale.value || !props.product.compare_price) return 0
  return Math.round(
    ((props.product.compare_price - props.product.price) / props.product.compare_price) * 100,
  )
})

const inStock = computed(() => props.product.stock > 0)
const inWishlist = computed(() => wishlistStore.isInWishlist(props.product.id))

// Hover state for image swap
const hovered = ref(false)

function handleAddToCart(e: Event) {
  e.preventDefault()
  e.stopPropagation()
  addProduct(props.product, 1)
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
    <!-- Image container -->
    <div class="relative overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800 aspect-[3/4]">

      <!-- Primary image -->
      <img
        v-if="mainImage"
        :src="mainImage"
        :alt="title"
        class="absolute inset-0 h-full w-full object-cover transition-all duration-500"
        :class="hovered && secondImage !== mainImage ? 'opacity-0 scale-105' : 'opacity-100 scale-100'"
        loading="lazy"
      />

      <!-- Secondary image (hover) -->
      <img
        v-if="secondImage && secondImage !== mainImage"
        :src="secondImage"
        :alt="title"
        class="absolute inset-0 h-full w-full object-cover transition-all duration-500"
        :class="hovered ? 'opacity-100 scale-100' : 'opacity-0 scale-105'"
        loading="lazy"
      />

      <!-- Placeholder when no image -->
      <div
        v-if="!mainImage"
        class="absolute inset-0 flex items-center justify-center"
      >
        <UIcon name="heroicons:photo" class="size-16 text-zinc-300 dark:text-zinc-600" />
      </div>

      <!-- Badges -->
      <div class="absolute left-2.5 top-2.5 flex flex-col gap-1.5">
        <VBadge v-if="isOnSale" color="error">-{{ discountPercent }}%</VBadge>
        <VBadge v-if="product.is_featured" color="primary">{{ t('common.featured') }}</VBadge>
        <VBadge v-if="!inStock" color="neutral">{{ t('common.outOfStock') }}</VBadge>
      </div>

      <!-- Wishlist button -->
      <button
        class="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-zinc-900 shadow-sm transition-all"
        :class="
          inWishlist
            ? 'opacity-100'
            : 'opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0'
        "
        :aria-label="inWishlist ? 'Remove from wishlist' : 'Add to wishlist'"
        @click="handleWishlist"
      >
        <UIcon
          :name="inWishlist ? 'heroicons:heart-solid' : 'heroicons:heart'"
          class="size-4 transition-colors"
          :class="inWishlist ? 'text-rose-500' : 'text-zinc-400 hover:text-rose-500'"
        />
      </button>

      <!-- Add to Cart overlay -->
      <div
        class="absolute inset-x-0 bottom-0 p-3 transition-all duration-300"
        :class="hovered ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'"
      >
        <UButton
          block
          size="sm"
          :disabled="!inStock"
          class="shadow-lg backdrop-blur-sm"
          @click="handleAddToCart"
        >
          <UIcon name="heroicons:shopping-bag" class="size-4" />
          {{ inStock ? t('common.addToCart') : t('common.outOfStock') }}
        </UButton>
      </div>
    </div>

    <!-- Product info -->
    <div class="mt-3 space-y-1 px-0.5">
      <p class="text-xs text-zinc-400 dark:text-zinc-500 truncate">
        {{ product.brand ?? '&nbsp;' }}
      </p>
      <h3
        class="text-sm font-medium text-zinc-800 dark:text-zinc-200 leading-snug line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors"
      >
        {{ title }}
      </h3>
      <div class="flex items-center gap-2 pt-0.5">
        <span class="font-semibold text-zinc-900 dark:text-white">
          ${{ product.price.toFixed(2) }}
        </span>
        <span
          v-if="isOnSale && product.compare_price"
          class="text-xs text-zinc-400 line-through"
        >
          ${{ product.compare_price.toFixed(2) }}
        </span>
      </div>
    </div>
  </NuxtLink>
</template>
