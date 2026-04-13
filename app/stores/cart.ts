// ─────────────────────────────────────────────────────────────────────────────
// Velora Commerce — Cart Store
// Persisted to localStorage via VueUse. Syncs to Supabase in Phase 7.
// ─────────────────────────────────────────────────────────────────────────────
import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import type { CartItem } from '~/types/cart'

export const useCartStore = defineStore('cart', () => {
  // ── Persisted state ───────────────────────────────────────────────────────
  const items = useLocalStorage<CartItem[]>('velora:cart:items', [])
  const couponCode = useLocalStorage<string>('velora:cart:coupon', '')
  const discount = useLocalStorage<number>('velora:cart:discount', 0)

  // ── Computed ──────────────────────────────────────────────────────────────
  const count = computed(() => items.value.reduce((sum, i) => sum + i.quantity, 0))

  const subtotal = computed(() =>
    items.value.reduce((sum, i) => sum + i.price * i.quantity, 0),
  )

  const total = computed(() => Math.max(0, subtotal.value - discount.value))

  // ── Actions ───────────────────────────────────────────────────────────────

  /** Add product to cart or increment quantity if already exists */
  function addItem(item: Omit<CartItem, 'id'>) {
    const key = item.variantId ?? item.productId
    const existing = items.value.find(
      (i) => (i.variantId ?? i.productId) === key,
    )

    if (existing) {
      existing.quantity += item.quantity
    } else {
      items.value.push({
        ...item,
        id: `${item.productId}-${item.variantId ?? 'default'}-${Date.now()}`,
      })
    }
  }

  /** Remove a specific cart item by its cart item id */
  function removeItem(id: string) {
    items.value = items.value.filter((i) => i.id !== id)
  }

  /** Update the quantity of a cart item. Removes it if quantity reaches 0 */
  function updateQuantity(id: string, quantity: number) {
    if (quantity <= 0) {
      removeItem(id)
      return
    }
    const item = items.value.find((i) => i.id === id)
    if (item) item.quantity = quantity
  }

  /** Apply a coupon code and its discount amount */
  function applyCoupon(code: string, amount: number) {
    couponCode.value = code
    discount.value = amount
  }

  function removeCoupon() {
    couponCode.value = ''
    discount.value = 0
  }

  function clear() {
    items.value = []
    couponCode.value = ''
    discount.value = 0
  }

  return {
    items,
    couponCode,
    discount,
    count,
    subtotal,
    total,
    addItem,
    removeItem,
    updateQuantity,
    applyCoupon,
    removeCoupon,
    clear,
  }
})
