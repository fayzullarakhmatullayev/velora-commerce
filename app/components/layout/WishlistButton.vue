<script setup lang="ts">
const wishlistCount = useState<number>('wishlist.count', () => 0)
const user = useSupabaseUser()
</script>

<template>
  <UButton
    :to="user ? '/account/wishlist' : '/auth/login'"
    icon="heroicons:heart"
    color="neutral"
    variant="ghost"
    size="sm"
    aria-label="Wishlist"
    class="relative"
  >
    <span
      v-if="wishlistCount > 0"
      class="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white"
    >
      {{ wishlistCount }}
    </span>
  </UButton>
</template>
