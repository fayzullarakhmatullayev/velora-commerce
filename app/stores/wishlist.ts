// ─────────────────────────────────────────────────────────────────────────────
// Velora Commerce — Wishlist Store
// Persisted to localStorage. Syncs to Supabase for logged-in users.
// ─────────────────────────────────────────────────────────────────────────────
import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'

export interface WishlistItem {
  productId: string
  title: string
  image: string
  price: number
  slug: string
}

export const useWishlistStore = defineStore('wishlist', () => {
  const items = useLocalStorage<WishlistItem[]>('velora:wishlist', [])

  const count = computed(() => items.value.length)

  const productIds = computed(() => new Set(items.value.map((i) => i.productId)))

  function isInWishlist(productId: string): boolean {
    return productIds.value.has(productId)
  }

  function toggle(item: WishlistItem): boolean {
    if (isInWishlist(item.productId)) {
      items.value = items.value.filter((i) => i.productId !== item.productId)
      return false
    } else {
      items.value.push(item)
      return true
    }
  }

  function remove(productId: string) {
    items.value = items.value.filter((i) => i.productId !== productId)
  }

  function clear() {
    items.value = []
  }

  return { items, count, productIds, isInWishlist, toggle, remove, clear }
})
