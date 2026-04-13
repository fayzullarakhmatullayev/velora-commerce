// ─────────────────────────────────────────────
// Velora Commerce — Product Types
// ─────────────────────────────────────────────

export interface ProductTranslation {
  title: string
  description: string
  slug: string
}

export interface Product {
  id: string
  sku: string
  price: number
  comparePrice?: number
  stock: number
  images: string[]
  categoryId: string
  brandId?: string
  tags: string[]
  isActive: boolean
  isFeatured: boolean
  createdAt: string
  updatedAt: string
  translations: Record<'en' | 'uz' | 'ru', ProductTranslation>
}

export interface ProductVariant {
  id: string
  productId: string
  sku: string
  price: number
  stock: number
  attributes: Record<string, string> // e.g. { color: 'red', size: 'M' }
}

export interface Category {
  id: string
  slug: string
  parentId?: string
  image?: string
  translations: Record<'en' | 'uz' | 'ru', { name: string; description?: string }>
}

export type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'rating'
