<script setup lang="ts">
import type { Period } from '~/composables/useAdminAnalytics'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Analytics — Velora Admin' })

const period = ref<Period>('30d')
const { data, pending } = useAdminAnalytics(period)

const periodOptions = [
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatPrice(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

function pctChange(current: number, prev: number) {
  if (prev === 0) return current > 0 ? 100 : 0
  return Math.round(((current - prev) / prev) * 100)
}

function pctLabel(current: number, prev: number) {
  const pct = pctChange(current, prev)
  return `${pct >= 0 ? '+' : ''}${pct}% vs prev period`
}

const chartMax = computed(() => {
  const vals = (data.value?.revenueChart ?? []).map(d => d.revenue)
  return Math.max(...vals, 1)
})

// Status display config
const statusConfig: Record<string, { color: string; label: string }> = {
  pending:    { color: 'bg-amber-400',   label: 'Pending' },
  paid:       { color: 'bg-emerald-500', label: 'Paid' },
  processing: { color: 'bg-blue-500',    label: 'Processing' },
  shipped:    { color: 'bg-violet-500',  label: 'Shipped' },
  delivered:  { color: 'bg-emerald-600', label: 'Delivered' },
  cancelled:  { color: 'bg-red-500',     label: 'Cancelled' },
  refunded:   { color: 'bg-zinc-400',    label: 'Refunded' },
}

const totalOrdersInPeriod = computed(() =>
  Object.values(data.value?.statusCounts ?? {}).reduce((s, n) => s + n, 0)
)

function statusPct(count: number) {
  const total = totalOrdersInPeriod.value
  return total === 0 ? 0 : Math.round((count / total) * 100)
}
</script>

<template>
  <div class="p-6 lg:p-8 space-y-6">

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="font-display text-2xl font-bold text-zinc-900 dark:text-white">Analytics</h1>
        <p class="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">Store performance overview</p>
      </div>
      <USelect
        v-model="period"
        :items="periodOptions"
        size="sm"
        class="w-full sm:w-40"
      />
    </div>

    <!-- ── KPI row ─────────────────────────────────────────────────────────── -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

      <!-- Revenue -->
      <VCard padding="md">
        <p class="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">Revenue</p>
        <USkeleton v-if="pending" class="h-8 w-28 mt-1" />
        <template v-else>
          <p class="font-display text-2xl font-bold text-zinc-900 dark:text-white">
            {{ formatPrice(data?.currentRevenue ?? 0) }}
          </p>
          <p
            class="mt-1 text-xs font-medium"
            :class="pctChange(data?.currentRevenue ?? 0, data?.prevRevenue ?? 0) >= 0
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-red-500 dark:text-red-400'"
          >
            {{ pctLabel(data?.currentRevenue ?? 0, data?.prevRevenue ?? 0) }}
          </p>
        </template>
      </VCard>

      <!-- Orders -->
      <VCard padding="md">
        <p class="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">Orders</p>
        <USkeleton v-if="pending" class="h-8 w-16 mt-1" />
        <template v-else>
          <p class="font-display text-2xl font-bold text-zinc-900 dark:text-white">
            {{ data?.currentOrders ?? 0 }}
          </p>
          <p
            class="mt-1 text-xs font-medium"
            :class="pctChange(data?.currentOrders ?? 0, data?.prevOrders ?? 0) >= 0
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-red-500 dark:text-red-400'"
          >
            {{ pctLabel(data?.currentOrders ?? 0, data?.prevOrders ?? 0) }}
          </p>
        </template>
      </VCard>

      <!-- Avg order value -->
      <VCard padding="md">
        <p class="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">Avg Order Value</p>
        <USkeleton v-if="pending" class="h-8 w-24 mt-1" />
        <p v-else class="font-display text-2xl font-bold text-zinc-900 dark:text-white">
          {{ data?.currentOrders
              ? formatPrice((data.currentRevenue) / data.currentOrders)
              : '—' }}
        </p>
      </VCard>

      <!-- Total orders in period -->
      <VCard padding="md">
        <p class="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">All Orders</p>
        <USkeleton v-if="pending" class="h-8 w-16 mt-1" />
        <p v-else class="font-display text-2xl font-bold text-zinc-900 dark:text-white">
          {{ totalOrdersInPeriod }}
        </p>
        <p class="mt-1 text-xs text-zinc-400">incl. unpaid & cancelled</p>
      </VCard>
    </div>

    <!-- ── Revenue chart + Orders by status ──────────────────────────────── -->
    <div class="grid grid-cols-1 gap-6 xl:grid-cols-3">

      <!-- Revenue chart -->
      <VCard padding="md" class="xl:col-span-2">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-semibold text-zinc-900 dark:text-white">Revenue</h2>
          <p v-if="data" class="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            {{ formatPrice(data.currentRevenue) }}
          </p>
        </div>

        <!-- Skeleton -->
        <div v-if="pending" class="flex items-end gap-1 h-40">
          <USkeleton
            v-for="i in (period === '7d' ? 7 : period === '30d' ? 30 : 90)"
            :key="i"
            class="flex-1 rounded-t-sm"
            :style="`height:${Math.random() * 80 + 10}%`"
          />
        </div>

        <!-- Bars -->
        <div v-else class="flex items-end gap-0.5 h-40 mt-2">
          <div
            v-for="point in data?.revenueChart"
            :key="point.date"
            class="group relative flex-1 flex flex-col justify-end h-full"
          >
            <div
              class="w-full rounded-t-sm bg-primary-500 dark:bg-primary-600 transition-all duration-300 hover:bg-primary-400 min-h-px"
              :style="`height: ${Math.max((point.revenue / chartMax) * 100, point.revenue > 0 ? 4 : 0.5)}%`"
            />
            <div class="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center pointer-events-none z-10">
              <div class="rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[10px] font-semibold px-2 py-1 whitespace-nowrap shadow-lg">
                {{ point.date.slice(5) }}: {{ formatPrice(point.revenue) }}
              </div>
              <div class="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-zinc-900 dark:border-t-zinc-100" />
            </div>
          </div>
        </div>

        <!-- X-axis labels -->
        <div class="flex justify-between mt-1 text-[10px] text-zinc-400">
          <span>{{ data?.revenueChart?.at(0)?.date.slice(5) }}</span>
          <span>{{ data?.revenueChart?.at(Math.floor((data.revenueChart.length - 1) / 2))?.date.slice(5) }}</span>
          <span>{{ data?.revenueChart?.at(-1)?.date.slice(5) }}</span>
        </div>
      </VCard>

      <!-- Orders by status -->
      <VCard padding="md">
        <h2 class="font-semibold text-zinc-900 dark:text-white mb-4">Orders by Status</h2>

        <div v-if="pending" class="space-y-3">
          <USkeleton v-for="i in 5" :key="i" class="h-8 w-full rounded-lg" />
        </div>

        <div v-else-if="totalOrdersInPeriod === 0" class="flex flex-col items-center justify-center py-8 text-center">
          <UIcon name="heroicons:shopping-bag" class="size-8 text-zinc-200 dark:text-zinc-700 mb-2" />
          <p class="text-sm text-zinc-400">No orders in this period</p>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="(count, status) in data?.statusCounts"
            :key="status"
            class="space-y-1"
          >
            <div class="flex items-center justify-between text-xs">
              <div class="flex items-center gap-2">
                <div class="size-2 rounded-full" :class="statusConfig[status]?.color ?? 'bg-zinc-400'" />
                <span class="font-medium text-zinc-700 dark:text-zinc-300 capitalize">{{ status }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-zinc-500">{{ count }}</span>
                <span class="text-zinc-400 w-8 text-right">{{ statusPct(count) }}%</span>
              </div>
            </div>
            <!-- Progress bar -->
            <div class="h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                class="h-1.5 rounded-full transition-all duration-500"
                :class="statusConfig[status]?.color ?? 'bg-zinc-400'"
                :style="`width: ${statusPct(count)}%`"
              />
            </div>
          </div>
        </div>
      </VCard>
    </div>

    <!-- ── Top products ───────────────────────────────────────────────────── -->
    <VCard padding="none">
      <div class="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
        <h2 class="font-semibold text-zinc-900 dark:text-white">Top Products by Revenue</h2>
      </div>

      <!-- Loading -->
      <div v-if="pending" class="divide-y divide-zinc-100 dark:divide-zinc-800">
        <div v-for="i in 6" :key="i" class="flex items-center gap-4 px-5 py-3.5">
          <USkeleton class="size-10 rounded-lg shrink-0" />
          <USkeleton class="h-4 flex-1" />
          <USkeleton class="h-4 w-16" />
          <USkeleton class="h-4 w-20" />
        </div>
      </div>

      <!-- Empty -->
      <div v-else-if="!data?.topProducts?.length" class="flex flex-col items-center justify-center py-16 text-center">
        <UIcon name="heroicons:tag" class="size-8 text-zinc-200 dark:text-zinc-700 mb-2" />
        <p class="text-sm text-zinc-400">No sales in this period</p>
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-zinc-100 dark:border-zinc-800">
              <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Product</th>
              <th class="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-400">Units Sold</th>
              <th class="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-400">Revenue</th>
              <th class="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-400">Share</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-100 dark:divide-zinc-800">
            <tr
              v-for="(product, i) in data?.topProducts"
              :key="product.title"
              class="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
            >
              <td class="px-5 py-3.5">
                <div class="flex items-center gap-3">
                  <span class="text-xs font-bold text-zinc-300 dark:text-zinc-600 w-5 shrink-0">{{ i + 1 }}</span>
                  <div class="size-9 rounded-lg overflow-hidden shrink-0 bg-zinc-100 dark:bg-zinc-800">
                    <img v-if="product.image" :src="product.image" :alt="product.title" class="size-full object-cover" />
                    <UIcon v-else name="heroicons:photo" class="size-full p-2 text-zinc-400" />
                  </div>
                  <span class="font-medium text-zinc-900 dark:text-white truncate max-w-64">{{ product.title }}</span>
                </div>
              </td>
              <td class="px-5 py-3.5 text-right text-zinc-600 dark:text-zinc-400">
                {{ product.units.toLocaleString() }}
              </td>
              <td class="px-5 py-3.5 text-right font-semibold text-zinc-900 dark:text-white">
                {{ formatPrice(product.revenue) }}
              </td>
              <td class="px-5 py-3.5 text-right">
                <div class="flex items-center justify-end gap-2">
                  <div class="w-16 h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div
                      class="h-1.5 rounded-full bg-primary-500"
                      :style="`width: ${data?.currentRevenue ? Math.round((product.revenue / data.currentRevenue) * 100) : 0}%`"
                    />
                  </div>
                  <span class="text-xs text-zinc-400 w-8 text-right">
                    {{ data?.currentRevenue ? Math.round((product.revenue / data.currentRevenue) * 100) : 0 }}%
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </VCard>

  </div>
</template>
