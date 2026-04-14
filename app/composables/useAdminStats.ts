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
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayIso = today.toISOString()

      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const thirtyDaysIso = thirtyDaysAgo.toISOString()

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
        // Total revenue from paid orders last 30 days
        supabase.from('orders').select('total')
          .eq('payment_status', 'paid')
          .gte('created_at', thirtyDaysIso),
      ])

      const revenue30d = (revenueRes.data ?? []).reduce((sum, o) => sum + o.total, 0)

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

  // ── Revenue last 30 days grouped by day ───────────────────────────────────
  const { data: revenueChart, pending: chartPending } = useAsyncData(
    'admin-revenue-chart',
    async () => {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data, error } = await supabase
        .from('orders')
        .select('total, created_at')
        .eq('payment_status', 'paid')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true })

      if (error) throw error

      // Group by day
      const byDay: Record<string, number> = {}
      for (let i = 29; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        byDay[d.toISOString().slice(0, 10)] = 0
      }
      for (const order of data ?? []) {
        const day = order.created_at.slice(0, 10)
        if (day in byDay) byDay[day] = (byDay[day] ?? 0) + order.total
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
