<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Dashboard — Velora Admin' })

const { stats, recentOrders, lowStock, revenueChart, chartPending, pending } = useAdminStats()

function formatPrice(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const statusColor: Record<string, string> = {
  pending: 'warning',
  paid: 'success',
  processing: 'info',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'error',
  refunded: 'neutral',
}

// Simple bar chart — max value for scaling
const chartMax = computed(() => {
  const vals = (revenueChart.value ?? []).map((d) => d.revenue)
  return Math.max(...vals, 1)
})

// Product title helper
function productTitle(translations: Record<string, { title: string }>) {
  return translations?.en?.title ?? 'Untitled'
}

// Product thumbnail helper
function productThumb(images: string[]) {
  return Array.isArray(images) && images.length > 0 ? images[0] : null
}
</script>

<template>
  <div class="p-6 lg:p-8 space-y-8">
    <!-- Page title -->
    <div>
      <h1 class="font-display text-2xl font-bold text-zinc-900 dark:text-white">Dashboard</h1>
      <p class="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">Store overview at a glance.</p>
    </div>

    <!-- ── KPI cards ──────────────────────────────────────────────────────── -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <AdminStatCard
        label="Revenue (30d)"
        :value="stats ? formatPrice(stats.revenue30d) : '—'"
        icon="heroicons:banknotes"
        icon-color="bg-emerald-500"
        :loading="pending"
      />
      <AdminStatCard
        label="Total Orders"
        :value="stats?.totalOrders ?? '—'"
        icon="heroicons:shopping-bag"
        icon-color="bg-violet-500"
        :trend="stats ? `${stats.ordersToday} today` : undefined"
        :trend-up="(stats?.ordersToday ?? 0) > 0"
        :loading="pending"
      />
      <AdminStatCard
        label="Active Products"
        :value="stats?.activeProducts ?? '—'"
        icon="heroicons:tag"
        icon-color="bg-blue-500"
        :loading="pending"
      />
      <AdminStatCard
        label="Total Users"
        :value="stats?.totalUsers ?? '—'"
        icon="heroicons:users"
        icon-color="bg-orange-500"
        :loading="pending"
      />
    </div>

    <!-- ── Revenue chart + Low stock ─────────────────────────────────────── -->
    <div class="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <!-- Revenue chart (last 30 days) -->
      <VCard padding="md" class="xl:col-span-2">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-semibold text-zinc-900 dark:text-white">Revenue — Last 30 Days</h2>
          <p v-if="stats" class="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            {{ formatPrice(stats.revenue30d) }}
          </p>
        </div>

        <!-- Skeleton -->
        <div v-if="chartPending" class="flex items-end gap-1 h-40">
          <USkeleton
            v-for="i in 30"
            :key="i"
            class="flex-1 rounded-t-sm"
            :style="`height:${Math.random() * 100}%`"
          />
        </div>

        <!-- Chart bars -->
        <div v-else class="flex items-end gap-0.5 h-40 mt-2">
          <div
            v-for="point in revenueChart"
            :key="point.date"
            class="group relative flex-1 flex flex-col justify-end"
          >
            <div
              class="w-full rounded-t-sm bg-primary-500 dark:bg-primary-600 transition-all duration-300 hover:bg-primary-600 dark:hover:bg-primary-500 min-h-[2px]"
              :style="`height: ${Math.max((point.revenue / chartMax) * 100, point.revenue > 0 ? 4 : 0.5)}%`"
            />
            <!-- Tooltip -->
            <div
              class="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center pointer-events-none z-10"
            >
              <div
                class="rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[10px] font-semibold px-2 py-1 whitespace-nowrap shadow-lg"
              >
                {{ point.date.slice(5) }}: {{ formatPrice(point.revenue) }}
              </div>
              <div
                class="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-zinc-900 dark:border-t-zinc-100"
              />
            </div>
          </div>
        </div>

        <!-- X-axis labels -->
        <div class="flex justify-between mt-1 text-[10px] text-zinc-400">
          <span>{{ revenueChart?.at(0)?.date.slice(5) }}</span>
          <span>{{ revenueChart?.at(14)?.date.slice(5) }}</span>
          <span>{{ revenueChart?.at(-1)?.date.slice(5) }}</span>
        </div>
      </VCard>

      <!-- Low stock alerts -->
      <VCard padding="md">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-semibold text-zinc-900 dark:text-white">Low Stock</h2>
          <NuxtLink
            to="/admin/products"
            class="text-xs text-primary-600 dark:text-primary-400 hover:underline"
          >
            View all →
          </NuxtLink>
        </div>

        <div v-if="pending" class="space-y-3">
          <USkeleton v-for="i in 4" :key="i" class="h-12 w-full rounded-lg" />
        </div>

        <div
          v-else-if="!lowStock?.length"
          class="flex flex-col items-center justify-center py-8 text-center"
        >
          <UIcon name="heroicons:check-circle" class="size-8 text-emerald-400 mb-2" />
          <p class="text-sm text-zinc-500 dark:text-zinc-400">All products are well stocked</p>
        </div>

        <ul v-else class="space-y-2">
          <li v-for="product in lowStock" :key="product.id" class="flex items-center gap-3">
            <!-- Thumbnail -->
            <div class="size-10 rounded-lg overflow-hidden shrink-0 bg-zinc-100 dark:bg-zinc-800">
              <img
                v-if="productThumb(product.images)"
                :src="productThumb(product.images)!"
                :alt="productTitle(product.translations)"
                class="size-full object-cover"
              />
              <UIcon v-else name="heroicons:photo" class="size-full p-2.5 text-zinc-400" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-zinc-900 dark:text-white truncate">
                {{ productTitle(product.translations) }}
              </p>
              <p class="text-xs text-zinc-400">SKU: {{ product.sku ?? '—' }}</p>
            </div>
            <UBadge
              :color="product.stock === 0 ? 'error' : 'warning'"
              variant="subtle"
              size="sm"
              class="shrink-0"
            >
              {{ product.stock === 0 ? 'Out' : `${product.stock} left` }}
            </UBadge>
          </li>
        </ul>
      </VCard>
    </div>

    <!-- ── Recent orders ───────────────────────────────────────────────────── -->
    <VCard padding="none">
      <div
        class="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800"
      >
        <h2 class="font-semibold text-zinc-900 dark:text-white">Recent Orders</h2>
        <NuxtLink
          to="/admin/orders"
          class="text-xs text-primary-600 dark:text-primary-400 hover:underline"
        >
          View all →
        </NuxtLink>
      </div>

      <!-- Loading skeleton -->
      <div v-if="pending" class="divide-y divide-zinc-100 dark:divide-zinc-800">
        <div v-for="i in 5" :key="i" class="flex items-center gap-4 px-5 py-3.5">
          <USkeleton class="h-4 w-24" />
          <USkeleton class="h-4 w-32 flex-1" />
          <USkeleton class="h-5 w-16 rounded-full" />
          <USkeleton class="h-4 w-20" />
        </div>
      </div>

      <!-- Empty -->
      <div
        v-else-if="!recentOrders?.length"
        class="flex flex-col items-center justify-center py-16 text-center"
      >
        <UIcon
          name="heroicons:shopping-bag"
          class="size-10 text-zinc-200 dark:text-zinc-700 mb-3"
        />
        <p class="text-sm text-zinc-500 dark:text-zinc-400">No orders yet</p>
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-zinc-100 dark:border-zinc-800">
              <th
                class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400"
              >
                Order
              </th>
              <th
                class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400"
              >
                Date
              </th>
              <th
                class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400"
              >
                Status
              </th>
              <th
                class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400"
              >
                Payment
              </th>
              <th
                class="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-400"
              >
                Total
              </th>
              <th class="px-5 py-3" />
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-100 dark:divide-zinc-800">
            <tr
              v-for="order in recentOrders"
              :key="order.id"
              class="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
            >
              <td class="px-5 py-3.5">
                <span class="font-mono font-semibold text-zinc-900 dark:text-white">
                  #{{ order.id.slice(0, 8).toUpperCase() }}
                </span>
              </td>
              <td class="px-5 py-3.5 text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                {{ formatDate(order.created_at) }}
              </td>
              <td class="px-5 py-3.5">
                <UBadge
                  :color="(statusColor[order.status] as any) ?? 'neutral'"
                  variant="subtle"
                  size="sm"
                >
                  {{ order.status }}
                </UBadge>
              </td>
              <td class="px-5 py-3.5">
                <UBadge
                  :color="order.payment_status === 'paid' ? 'success' : 'warning'"
                  variant="subtle"
                  size="sm"
                >
                  {{ order.payment_status }}
                </UBadge>
              </td>
              <td class="px-5 py-3.5 text-right font-semibold text-zinc-900 dark:text-white">
                {{ formatPrice(order.total) }}
              </td>
              <td class="px-5 py-3.5 text-right">
                <NuxtLink :to="`/admin/orders/${order.id}`">
                  <UButton
                    size="xs"
                    color="neutral"
                    variant="ghost"
                    icon="heroicons:arrow-top-right-on-square"
                  />
                </NuxtLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </VCard>
  </div>
</template>
