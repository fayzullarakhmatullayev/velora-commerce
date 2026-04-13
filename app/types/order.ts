// ─────────────────────────────────────────────
// Velora Commerce — Order Types
// ─────────────────────────────────────────────

export type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
export type PaymentStatus = 'unpaid' | 'paid' | 'failed' | 'refunded'

export interface OrderItem {
  id: string
  productId: string
  variantId?: string
  title: string
  image: string
  price: number
  quantity: number
}

export interface Order {
  id: string
  userId: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  items: OrderItem[]
  subtotal: number
  discount: number
  total: number
  shippingAddress: Record<string, string>
  stripePaymentIntentId?: string
  couponCode?: string
  notes?: string
  createdAt: string
  updatedAt: string
}
