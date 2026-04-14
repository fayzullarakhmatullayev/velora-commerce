<script setup lang="ts">
const route = useRoute()
const { profile, logout } = useAuth()

const props = defineProps<{ collapsed: boolean }>()
const emit = defineEmits<{ 'update:collapsed': [boolean] }>()

const nav = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', icon: 'heroicons:squares-2x2', to: '/admin' },
    ],
  },
  {
    label: 'Store',
    items: [
      { label: 'Orders', icon: 'heroicons:shopping-bag', to: '/admin/orders' },
      { label: 'Products', icon: 'heroicons:tag', to: '/admin/products' },
      { label: 'Categories', icon: 'heroicons:squares-plus', to: '/admin/categories' },
      { label: 'Coupons', icon: 'heroicons:ticket', to: '/admin/coupons' },
    ],
  },
  {
    label: 'People',
    items: [
      { label: 'Users', icon: 'heroicons:users', to: '/admin/users' },
      { label: 'Reviews', icon: 'heroicons:star', to: '/admin/reviews' },
    ],
  },
  {
    label: 'Insights',
    items: [
      { label: 'Analytics', icon: 'heroicons:chart-bar', to: '/admin/analytics' },
    ],
  },
]

function isActive(to: string) {
  if (to === '/admin') return route.path === '/admin'
  return route.path.startsWith(to)
}
</script>

<template>
  <aside
    class="flex h-full flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-all duration-300"
    :class="collapsed ? 'w-16' : 'w-60'"
  >
    <!-- Logo -->
    <div class="flex h-16 items-center border-b border-zinc-200 dark:border-zinc-800 px-4 shrink-0"
         :class="collapsed ? 'justify-center' : 'gap-3'">
      <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white text-sm font-bold">
        V
      </div>
      <span v-if="!collapsed" class="font-display font-bold text-zinc-900 dark:text-white text-lg leading-none truncate">
        Velora<span class="text-primary-600">.</span>
        <span class="ml-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Admin</span>
      </span>
    </div>

    <!-- Nav -->
    <nav class="flex-1 overflow-y-auto py-4 px-2 space-y-6">
      <div v-for="section in nav" :key="section.label">
        <p v-if="!collapsed" class="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
          {{ section.label }}
        </p>
        <ul class="space-y-0.5">
          <li v-for="item in section.items" :key="item.to">
            <NuxtLink
              :to="item.to"
              class="flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium transition-colors"
              :class="[
                isActive(item.to)
                  ? 'bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white',
                collapsed ? 'justify-center' : '',
              ]"
              :title="collapsed ? item.label : undefined"
            >
              <UIcon :name="item.icon" class="size-5 shrink-0" />
              <span v-if="!collapsed">{{ item.label }}</span>
            </NuxtLink>
          </li>
        </ul>
      </div>
    </nav>

    <!-- Bottom: user + collapse toggle -->
    <div class="shrink-0 border-t border-zinc-200 dark:border-zinc-800 p-2 space-y-1">
      <!-- View storefront -->
      <NuxtLink
        to="/"
        class="flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white transition-colors"
        :class="collapsed ? 'justify-center' : ''"
        title="View Storefront"
      >
        <UIcon name="heroicons:arrow-top-right-on-square" class="size-5 shrink-0" />
        <span v-if="!collapsed">View Storefront</span>
      </NuxtLink>

      <!-- Logout -->
      <button
        class="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:bg-rose-50 dark:hover:bg-rose-950 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
        :class="collapsed ? 'justify-center' : ''"
        title="Logout"
        @click="logout"
      >
        <UIcon name="heroicons:arrow-right-on-rectangle" class="size-5 shrink-0" />
        <span v-if="!collapsed">Logout</span>
      </button>

      <!-- Collapse toggle -->
      <button
        class="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium text-zinc-400 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        :class="collapsed ? 'justify-center' : ''"
        @click="emit('update:collapsed', !collapsed)"
      >
        <UIcon
          :name="collapsed ? 'heroicons:chevron-right' : 'heroicons:chevron-left'"
          class="size-5 shrink-0"
        />
        <span v-if="!collapsed">Collapse</span>
      </button>
    </div>
  </aside>
</template>
