// ─────────────────────────────────────────────────────────────────────────────
// Velora Commerce — Admin orders composable
// List with filters/pagination, detail view, and status update
// ─────────────────────────────────────────────────────────────────────────────
import type { Database } from '~/types/database.types'

type Order = Database['public']['Tables']['orders']['Row']
type OrderItem = Database['public']['Tables']['order_items']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']

const PAGE_SIZE = 20

export const useAdminOrders = (opts?: {
  status?: Ref<string>
  search?: Ref<string>
  page?: Ref<number>
}) => {
  const supabase = useSupabase()
  const status = opts?.status ?? ref('')
  const search = opts?.search ?? ref('')
  const page = opts?.page ?? ref(1)

  const { data, pending, refresh } = useAsyncData(
    'admin-orders-list',
    async () => {
      let query = supabase
        .from('orders')
        .select('id, user_id, status, payment_status, total, created_at', { count: 'exact' })
        .order('created_at', { ascending: false })

      if (status.value && status.value !== 'all') {
        query = query.eq('status', status.value)
      }
      if (search.value.trim()) {
        // match order ID prefix (case-insensitive)
        query = query.ilike('id', `${search.value.trim()}%`)
      }

      const from = (page.value - 1) * PAGE_SIZE
      query = query.range(from, from + PAGE_SIZE - 1)

      const { data: rows, count, error } = await query
      if (error) throw error

      return {
        orders: rows as Pick<Order, 'id' | 'user_id' | 'status' | 'payment_status' | 'total' | 'created_at'>[],
        total: count ?? 0,
      }
    },
    {
      watch: [status, search, page],
      getCachedData: () => undefined,
    },
  )

  const totalPages = computed(() => Math.ceil((data.value?.total ?? 0) / PAGE_SIZE))
  const orders = computed(() => data.value?.orders ?? [])
  const total = computed(() => data.value?.total ?? 0)

  return { orders, total, totalPages, pending, refresh }
}

export const useAdminOrderDetail = (id: string) => {
  const supabase = useSupabase()

  const { data, pending, refresh } = useAsyncData(
    `admin-order-${id}`,
    async () => {
      const { data: order, error: orderError } = await supabase
        .from('orders').select('*').eq('id', id).single()
      if (orderError) throw orderError

      const { data: items, error: itemsError } = await supabase
        .from('order_items').select('*').eq('order_id', id)
      if (itemsError) throw itemsError

      // Fetch customer profile (best-effort)
      let customer: Pick<Profile, 'full_name' | 'phone'> | null = null
      const uid = (order as any)?.user_id as string | undefined
      if (uid) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, phone')
          .eq('id', uid)
          .single()
        customer = profile as Pick<Profile, 'full_name' | 'phone'> | null
      }

      return {
        order: order as Order,
        items: (items ?? []) as OrderItem[],
        customer,
      }
    },
    { getCachedData: () => undefined },
  )

  return { data, pending, refresh }
}

export const adminUpdateOrderStatus = async (id: string, newStatus: string) => {
  const supabase = useSupabase()
  const { error } = await (supabase.from('orders') as any)
    .update({ status: newStatus })
    .eq('id', id)
  if (error) throw error
}
