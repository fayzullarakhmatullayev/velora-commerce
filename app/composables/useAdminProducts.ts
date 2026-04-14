// ─────────────────────────────────────────────────────────────────────────────
// Velora Commerce — Admin products composable
// List with filters/pagination, active toggle, and delete
// ─────────────────────────────────────────────────────────────────────────────
import type { Database } from '~/types/database.types'

export type AdminProductRow = Pick<
  Database['public']['Tables']['products']['Row'],
  'id' | 'sku' | 'price' | 'compare_price' | 'stock' | 'images' | 'category_id' | 'brand' | 'is_active' | 'is_featured' | 'translations' | 'created_at'
>

const PAGE_SIZE = 20

export const useAdminProducts = (opts?: {
  search?: Ref<string>
  statusFilter?: Ref<string>   // 'all' | 'active' | 'inactive'
  page?: Ref<number>
}) => {
  const supabase = useSupabase()
  const search = opts?.search ?? ref('')
  const statusFilter = opts?.statusFilter ?? ref('all')
  const page = opts?.page ?? ref(1)

  const { data, pending, refresh } = useAsyncData(
    () => `admin-products-${search.value}-${statusFilter.value}-${page.value}`,
    async () => {
      let query = supabase
        .from('products')
        .select('id, sku, price, compare_price, stock, images, category_id, brand, is_active, is_featured, translations, created_at', { count: 'exact' })
        .order('created_at', { ascending: false })

      if (search.value.trim()) {
        query = query.ilike(`translations->en->>title`, `%${search.value.trim()}%`)
      }

      if (statusFilter.value === 'active') {
        query = query.eq('is_active', true)
      } else if (statusFilter.value === 'inactive') {
        query = query.eq('is_active', false)
      }

      const from = (page.value - 1) * PAGE_SIZE
      query = query.range(from, from + PAGE_SIZE - 1)

      const { data: rows, count, error } = await query
      if (error) throw error

      return {
        products: (rows ?? []) as AdminProductRow[],
        total: count ?? 0,
      }
    },
    {
      watch: [search, statusFilter, page],
      getCachedData: () => undefined,
    },
  )

  const products = computed(() => data.value?.products ?? [])
  const total = computed(() => data.value?.total ?? 0)
  const totalPages = computed(() => Math.ceil(total.value / PAGE_SIZE))

  return { products, total, totalPages, pending, refresh }
}

export const adminToggleProductActive = async (id: string, isActive: boolean) => {
  const supabase = useSupabase()
  const { error } = await (supabase.from('products') as any)
    .update({ is_active: isActive })
    .eq('id', id)
  if (error) throw error
}

export const adminDeleteProduct = async (id: string) => {
  const supabase = useSupabase()
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw error
}
