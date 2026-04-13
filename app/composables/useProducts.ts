// ─────────────────────────────────────────────────────────────────────────────
// Velora Commerce — Products composable
// Reusable server-side data fetching for product lists.
// ─────────────────────────────────────────────────────────────────────────────
import type { Database } from '~/types/database.types'

export type ProductRow = Database['public']['Tables']['products']['Row']

export interface UseProductsOptions {
  featured?: boolean
  categoryId?: string | null
  search?: string | null
  sort?: string | null
  minPrice?: string | null
  maxPrice?: string | null
  limit?: number
  page?: number
}

const PAGE_SIZE = 20

export const useProducts = (options: MaybeRef<UseProductsOptions> = {}) => {
  const supabase = useSupabase()
  const { locale } = useI18n()

  return useAsyncData(
    `products-${JSON.stringify(toValue(options))}`,
    async () => {
      const opts = toValue(options)
      const from = ((opts.page ?? 1) - 1) * (opts.limit ?? PAGE_SIZE)
      const to = from + (opts.limit ?? PAGE_SIZE) - 1

      let query = supabase
        .from('products')
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .range(from, to)

      if (opts.featured) {
        query = query.eq('is_featured', true)
      }

      if (opts.categoryId) {
        query = query.eq('category_id', opts.categoryId)
      }

      if (opts.search?.trim()) {
        // Search in English title (fallback safe for all locales)
        query = query.ilike(`translations->en->>title`, `%${opts.search.trim()}%`)
      }

      const minPrice = parseFloat(opts.minPrice ?? '')
      const maxPrice = parseFloat(opts.maxPrice ?? '')
      if (!isNaN(minPrice) && minPrice >= 0) {
        query = query.gte('price', minPrice)
      }
      if (!isNaN(maxPrice) && maxPrice > 0) {
        query = query.lte('price', maxPrice)
      }

      // Sorting
      switch (opts.sort) {
        case 'price-asc':
          query = query.order('price', { ascending: true })
          break
        case 'price-desc':
          query = query.order('price', { ascending: false })
          break
        case 'rating':
          query = query.order('created_at', { ascending: false })
          break
        default: // newest
          query = query.order('created_at', { ascending: false })
      }

      const { data, error, count } = await query

      if (error) throw error

      return { products: data ?? [], total: count ?? 0 }
    },
    {
      watch: [() => toValue(options)],
      default: () => ({ products: [] as ProductRow[], total: 0 }),
    },
  )
}

// ── Helper: get the translated title for the current locale ───────────────────
export const useProductTitle = (product: ProductRow) => {
  const { locale } = useI18n()
  return computed(
    () =>
      product.translations[locale.value as keyof typeof product.translations]?.title ||
      product.translations['en']?.title ||
      'Untitled',
  )
}

export const useProductSlug = (product: ProductRow) => {
  return computed(
    () =>
      product.translations['en']?.slug || product.id,
  )
}
