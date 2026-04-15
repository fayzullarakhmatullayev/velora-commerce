// ─────────────────────────────────────────────────────────────────────────────
// Velora Commerce — Admin analytics composable
// Revenue chart, orders by status, top products, period comparisons
// ─────────────────────────────────────────────────────────────────────────────

export type Period = '7d' | '30d' | '90d'

export const useAdminAnalytics = (period: Ref<Period>) => {
  const supabase = useSupabase()

  const { data, pending } = useAsyncData(
    () => `admin-analytics-${period.value}`,
    async () => {
      const now = new Date()

      // All date math in UTC to avoid local-timezone off-by-one on byDay keys.
      // '30d' = current calendar month (1st → today); 7d/90d = rolling window.
      let sinceIso: string
      let prevSinceIso: string
      let days: number

      if (period.value === '30d') {
        // Current calendar month
        const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
        sinceIso = startOfMonth.toISOString()
        // Previous month as comparison period
        const startOfPrevMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1))
        prevSinceIso = startOfPrevMonth.toISOString()
        days = now.getUTCDate() // days elapsed so far this month
      } else {
        days = period.value === '7d' ? 7 : 90
        const since = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - days + 1))
        sinceIso = since.toISOString()
        const prevSince = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - days * 2 + 1))
        prevSinceIso = prevSince.toISOString()
      }

      const [ordersRes, prevOrdersRes, statusRes] = await Promise.all([
        supabase.from('orders').select('id, total, created_at, status').eq('payment_status', 'paid').gte('created_at', sinceIso),
        supabase.from('orders').select('total').eq('payment_status', 'paid').gte('created_at', prevSinceIso).lt('created_at', sinceIso),
        supabase.from('orders').select('status').gte('created_at', sinceIso),
      ])

      // Fetch order_items for paid orders in the period (order_items has no created_at column)
      const paidOrderIds = (ordersRes.data ?? []).map((o: any) => o.id)
      const itemsRes = paidOrderIds.length
        ? await supabase.from('order_items').select('title, image, price, quantity').in('order_id', paidOrderIds)
        : { data: [], error: null }

      type OrderRow  = { id: string; total: number | string; created_at: string; status: string }
      type PrevRow   = { total: number | string }
      type StatusRow = { status: string }
      type ItemRow   = { title: string; image: string | null; price: number | string; quantity: number | string }

      const orders     = (ordersRes.data ?? []) as OrderRow[]
      const prevOrders = (prevOrdersRes.data ?? []) as PrevRow[]
      const statuses   = (statusRes.data ?? []) as StatusRow[]
      const items      = (itemsRes.data ?? []) as ItemRow[]

      // ── Revenue chart (group by day, UTC cursor) ────────────────────────────
      const byDay: Record<string, number> = {}
      const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1))
      const chartStart = new Date(sinceIso)
      const cursor = new Date(chartStart)
      while (cursor < tomorrow) {
        byDay[cursor.toISOString().slice(0, 10)] = 0
        cursor.setUTCDate(cursor.getUTCDate() + 1)
      }
      for (const order of orders) {
        const day = order.created_at.slice(0, 10)
        if (day in byDay) byDay[day] = (byDay[day] ?? 0) + Number(order.total)
      }
      const revenueChart = Object.entries(byDay).map(([date, revenue]) => ({ date, revenue }))

      // ── Period totals ───────────────────────────────────────────────────────
      const currentRevenue = orders.reduce((s, o) => s + Number(o.total), 0)
      const prevRevenue = prevOrders.reduce((s, o) => s + Number(o.total), 0)
      const currentOrders = orders.length
      const prevOrderCount = prevOrders.length

      // ── Orders by status ────────────────────────────────────────────────────
      const statusCounts: Record<string, number> = {}
      for (const o of statuses) {
        statusCounts[o.status] = (statusCounts[o.status] ?? 0) + 1
      }

      // ── Top products ────────────────────────────────────────────────────────
      const productMap: Record<string, { title: string; image: string | null; revenue: number; units: number }> = {}
      for (const item of items) {
        if (!productMap[item.title]) {
          productMap[item.title] = { title: item.title, image: item.image, revenue: 0, units: 0 }
        }
        productMap[item.title]!.revenue += Number(item.price) * Number(item.quantity)
        productMap[item.title]!.units += Number(item.quantity)
      }
      const topProducts = Object.values(productMap)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 8)

      return {
        revenueChart,
        currentRevenue,
        prevRevenue,
        currentOrders,
        prevOrders: prevOrderCount,
        statusCounts,
        topProducts,
      }
    },
    { getCachedData: () => undefined },
  )

  return { data, pending }
}
