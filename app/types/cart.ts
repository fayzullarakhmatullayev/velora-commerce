// ─────────────────────────────────────────────
// Velora Commerce — Cart Types
// ─────────────────────────────────────────────

export interface CartItem {
  id: string
  productId: string
  variantId?: string
  // Snapshotted at add-time so attributes survive variant edits/deletes
  variantAttributes?: Record<string, string>
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
