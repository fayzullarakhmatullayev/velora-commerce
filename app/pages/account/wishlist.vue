<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useSeoMeta({ title: 'Wishlist — Velora Commerce' })

const { store, toggleProduct } = useWishlist()
const { addProduct } = useCart()
const supabase = useSupabase()
const toast = useToast()

function formatPrice(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

async function moveToCart(item: typeof store.items.value[0]) {
  // Fetch full product to use addProduct
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', item.productId)
    .single()

  if (product) {
    addProduct(product, 1)
    store.remove(item.productId)
  } else {
    toast.add({ title: 'Product unavailable', color: 'error' })
  }
}
</script>

<template>
  <div class="velora-container py-10">
    <!-- Header -->
    <div class="mb-8 flex items-center gap-3">
      <UButton to="/account" color="neutral" variant="ghost" icon="heroicons:arrow-left" size="sm" />
      <h1 class="font-display text-2xl font-bold text-zinc-900 dark:text-white">
        Wishlist <span v-if="store.count > 0" class="text-zinc-400 font-normal text-xl">({{ store.count }})</span>
      </h1>
    </div>

    <!-- Empty -->
    <div
      v-if="store.items.length === 0"
      class="flex flex-col items-center justify-center py-24 text-center"
    >
      <UIcon name="heroicons:heart" class="size-16 text-zinc-200 dark:text-zinc-700 mb-4" />
      <p class="font-medium text-zinc-700 dark:text-zinc-300">Your wishlist is empty</p>
      <p class="mt-1 text-sm text-zinc-400">Save items you love to buy them later.</p>
      <UButton to="/shop" class="mt-6">Browse Products</UButton>
    </div>

    <!-- Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      <VCard v-for="item in store.items" :key="item.productId" padding="none" class="overflow-hidden group">
        <!-- Image -->
        <NuxtLink :to="`/product/${item.slug}`" class="block relative aspect-square overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          <img
            v-if="item.image"
            :src="item.image"
            :alt="item.title"
            class="size-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <UIcon v-else name="heroicons:photo" class="size-full p-12 text-zinc-300 dark:text-zinc-600" />
        </NuxtLink>

        <!-- Info -->
        <div class="p-4">
          <NuxtLink :to="`/product/${item.slug}`">
            <p class="font-medium text-sm text-zinc-900 dark:text-white truncate hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              {{ item.title }}
            </p>
          </NuxtLink>
          <p class="mt-1 font-semibold text-zinc-900 dark:text-white">{{ formatPrice(item.price) }}</p>

          <div class="mt-3 flex gap-2">
            <UButton size="sm" class="flex-1" @click="moveToCart(item)">
              Add to Cart
            </UButton>
            <UButton
              size="sm"
              color="neutral"
              variant="ghost"
              icon="heroicons:trash"
              @click="store.remove(item.productId)"
            />
          </div>
        </div>
      </VCard>
    </div>
  </div>
</template>
