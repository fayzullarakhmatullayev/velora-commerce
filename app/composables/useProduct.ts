// ─────────────────────────────────────────────────────────────────────────────
// Velora Commerce — Single product composable
// Fetches one product by its English slug.
// ─────────────────────────────────────────────────────────────────────────────
import type { Database } from '~/types/database.types'

export type ProductVariantRow = Database['public']['Tables']['product_variants']['Row']

export const useProduct = (slug: MaybeRef<string>) => {
  const supabase = useSupabase()
  const { locale } = useI18n()

  const { data: product, pending, error } = useAsyncData(
    `product-${toValue(slug)}`,
    async () => {
      // Find by English slug in JSONB
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq(`translations->en->>slug`, toValue(slug))
        .eq('is_active', true)
        .single()

      if (error) throw error
      return data
    },
  )

  const { data: variants } = useAsyncData(
    `product-variants-${toValue(slug)}`,
    async () => {
      if (!product.value) return []
      const { data } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', product.value.id)
      return data ?? []
    },
    { watch: [product] },
  )

  const title = computed(() => {
    if (!product.value) return ''
    return (
      product.value.translations[locale.value as keyof typeof product.value.translations]?.title ||
      product.value.translations['en']?.title ||
      ''
    )
  })

  const description = computed(() => {
    if (!product.value) return ''
    return (
      product.value.translations[locale.value as keyof typeof product.value.translations]?.description ||
      product.value.translations['en']?.description ||
      ''
    )
  })

  const isOnSale = computed(
    () =>
      product.value?.compare_price != null &&
      product.value.compare_price > product.value.price,
  )

  const discountPercent = computed(() => {
    if (!isOnSale.value || !product.value?.compare_price) return 0
    return Math.round(
      ((product.value.compare_price - product.value.price) /
        product.value.compare_price) *
        100,
    )
  })

  const mainImage = computed(() => product.value?.images?.[0] ?? '')
  const inStock = computed(() => (product.value?.stock ?? 0) > 0)

  return {
    product,
    variants,
    pending,
    error,
    title,
    description,
    isOnSale,
    discountPercent,
    mainImage,
    inStock,
  }
}
