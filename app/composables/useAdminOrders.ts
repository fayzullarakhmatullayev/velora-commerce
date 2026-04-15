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
    () => `admin-orders-${status.value}-${search.value}-${page.value}`,
    async () => {
      let query = supabase
        .from('orders')
        .select('id, user_id, status, payment_status, total, created_at', { count: 'exact' })
        .order('created_at', { ascending: false })

      if (status.value && status.value !== 'all') {
        query = query.eq('status', status.value)
      }
      if (search.value.trim()) {
        // Strip leading # (e.g. admin typed #A1B2C3D4 from the display format)
        const q = search.value.trim().replace(/^#/, '')

        // Pre-fetch profile IDs whose full_name matches the search term.
        // This lets us find orders by customer name even though orders only
        // store user_id, not the name.
        const { data: profileMatches } = await supabase
          .from('profiles')
          .select('id')
          .ilike('full_name', `%${q}%`)
          .limit(100)

        const matchingUserIds = (profileMatches ?? []).map((p: any) => p.id as string)

        // Build OR across all three searchable axes:
        //   • order ID text prefix  (::text cast needed — UUID column)
        //   • user_id text prefix   (::text cast needed — UUID column)
        //   • user_id in name-matched profile IDs
        const orParts: string[] = [
          `id::text.ilike.${q}%`,
          `user_id::text.ilike.${q}%`,
        ]
        if (matchingUserIds.length) {
          orParts.push(`user_id.in.(${matchingUserIds.join(',')})`)
        }

        query = query.or(orParts.join(','))
      }

      const from = (page.value - 1) * PAGE_SIZE
      query = query.range(from, from + PAGE_SIZE - 1)

      const { data: rows, count, error } = await query
      if (error) throw error

      // Batch-fetch customer names for the current page
      const userIds = [...new Set((rows ?? []).map((r: any) => r.user_id).filter(Boolean))]
      let nameMap: Record<string, string | null> = {}
      if (userIds.length) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', userIds)
        nameMap = Object.fromEntries((profiles ?? []).map((p: any) => [p.id, p.full_name]))
      }

      const orders = (rows ?? []).map((r: any) => ({
        ...r,
        customer_name: nameMap[r.user_id] ?? null,
      }))

      return {
        orders: orders as (Pick<Order, 'id' | 'user_id' | 'status' | 'payment_status' | 'total' | 'created_at'> & { customer_name: string | null })[],
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
