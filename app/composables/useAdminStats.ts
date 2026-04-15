// ─────────────────────────────────────────────────────────────────────────────
// Velora Commerce — Admin stats composable
// Fetches KPIs, recent orders, low-stock products, and daily revenue for charts
// ─────────────────────────────────────────────────────────────────────────────
import type { Database } from '~/types/database.types'

type Order = Database['public']['Tables']['orders']['Row']
type Product = Database['public']['Tables']['products']['Row']

export const useAdminStats = () => {
  const supabase = useSupabase()

  // ── KPI overview ──────────────────────────────────────────────────────────
  const { data: stats, pending: statsPending, refresh: refreshStats } = useAsyncData(
    'admin-stats',
    async () => {
      const now = new Date()
      const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
      const todayIso = today.toISOString()

      // Start of current month in UTC
      const startOfMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1))
      const startOfMonthIso = startOfMonth.toISOString()

      const [ordersRes, todayOrdersRes, productsRes, usersRes, revenueRes] = await Promise.all([
        // Total orders
        supabase.from('orders').select('id', { count: 'exact', head: true }),
        // Orders placed today
        supabase.from('orders').select('id', { count: 'exact', head: true })
          .gte('created_at', todayIso),
        // Active products
        supabase.from('products').select('id', { count: 'exact', head: true })
          .eq('is_active', true),
        // Total users (profiles)
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        // Total revenue from paid orders this calendar month
        supabase.from('orders').select('total')
          .eq('payment_status', 'paid')
          .gte('created_at', startOfMonthIso),
      ])

      const revenue30d = (revenueRes.data ?? []).reduce((sum, o) => sum + Number(o.total), 0)

      return {
        totalOrders: ordersRes.count ?? 0,
        ordersToday: todayOrdersRes.count ?? 0,
        activeProducts: productsRes.count ?? 0,
        totalUsers: usersRes.count ?? 0,
        revenue30d,
      }
    },
    { getCachedData: () => undefined },
  )

  // ── Recent orders ─────────────────────────────────────────────────────────
  const { data: recentOrders, pending: ordersPending, refresh: refreshOrders } = useAsyncData(
    'admin-recent-orders',
    async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('id, user_id, status, payment_status, total, created_at')
        .order('created_at', { ascending: false })
        .limit(8)

      if (error) throw error
      return data as Pick<Order, 'id' | 'user_id' | 'status' | 'payment_status' | 'total' | 'created_at'>[]
    },
    { getCachedData: () => undefined },
  )

  // ── Low stock products (stock < 5 and active) ─────────────────────────────
  const { data: lowStock, pending: lowStockPending, refresh: refreshLowStock } = useAsyncData(
    'admin-low-stock',
    async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, translations, stock, sku, images')
        .eq('is_active', true)
        .lt('stock', 5)
        .order('stock', { ascending: true })
        .limit(6)

      if (error) throw error
      return data as Pick<Product, 'id' | 'translations' | 'stock' | 'sku' | 'images'>[]
    },
    { getCachedData: () => undefined },
  )

  // ── Revenue — current calendar month, grouped by day (UTC throughout) ────
  const { data: revenueChart, pending: chartPending } = useAsyncData(
    'admin-revenue-chart',
    async () => {
      const now = new Date()
      // First moment of this month in UTC — avoids local-timezone off-by-one
      const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
      // First moment of tomorrow UTC — used as exclusive upper bound for cursor
      const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1))

      const { data, error } = await supabase
        .from('orders')
        .select('total, created_at')
        .eq('payment_status', 'paid')
        .gte('created_at', startOfMonth.toISOString())
        .order('created_at', { ascending: true })

      if (error) throw error

      // Build a slot for every UTC day from the 1st through today inclusive
      const byDay: Record<string, number> = {}
      const cursor = new Date(startOfMonth)
      while (cursor < tomorrow) {
        byDay[cursor.toISOString().slice(0, 10)] = 0
        cursor.setUTCDate(cursor.getUTCDate() + 1)
      }

      for (const order of data ?? []) {
        const day = order.created_at.slice(0, 10)
        if (day in byDay) byDay[day] = (byDay[day] ?? 0) + Number(order.total)
      }

      return Object.entries(byDay).map(([date, revenue]) => ({ date, revenue }))
    },
    { getCachedData: () => undefined },
  )

  const pending = computed(() => statsPending.value || ordersPending.value || lowStockPending.value)

  function refresh() {
    refreshStats()
    refreshOrders()
    refreshLowStock()
  }

  return { stats, recentOrders, lowStock, revenueChart, chartPending, pending, refresh }
}
