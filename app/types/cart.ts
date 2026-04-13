// ─────────────────────────────────────────────
// Velora Commerce — Cart Types
// ─────────────────────────────────────────────

export interface CartItem {
  id: string
  productId: string
  variantId?: string
  quantity: number
  price: number
  title: string
  image: string
  slug: string
}

export interface Cart {
  items: CartItem[]
  subtotal: number
  discount: number
  total: number
  couponCode?: string
}
