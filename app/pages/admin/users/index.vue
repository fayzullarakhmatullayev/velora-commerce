<script setup lang="ts">
import type { Database } from '~/types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Users — Velora Admin' })

const supabase = useSupabase()
const toast = useToast()
const route = useRoute()

const search = ref('')
const roleFilter = ref('all')
const page = ref(1)
const PAGE_SIZE = 20

// Reset page when filters change
watch([search, roleFilter], () => { page.value = 1 })

// ── Pre-fill search from query param (?id=…) from the orders detail link ─────
onMounted(() => {
  if (route.query.id) search.value = route.query.id as string
})

// ── Fetch users (profiles) ─────────────────────────────────────────────────────
const { data, pending, refresh } = useAsyncData(
  'admin-users-list',
  async () => {
    let query = supabase
      .from('profiles')
      .select('id, full_name, avatar_url, phone, role, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (search.value.trim()) {
      const q = search.value.trim()
      query = query.or(`full_name.ilike.%${q}%,id.ilike.${q}%`)
    }
    if (roleFilter.value !== 'all') {
      query = query.eq('role', roleFilter.value)
    }

    const from = (page.value - 1) * PAGE_SIZE
    query = query.range(from, from + PAGE_SIZE - 1)

    const { data: rows, count, error } = await query
    if (error) throw error

    return {
      users: (rows ?? []) as Pick<Profile, 'id' | 'full_name' | 'avatar_url' | 'phone' | 'role' | 'created_at'>[],
      total: count ?? 0,
    }
  },
  { getCachedData: () => undefined },
)

// Explicitly watch filters and re-fetch — more reliable than useAsyncData's watch option in Nuxt 4
watch([search, roleFilter, page], () => refresh())

const users = computed(() => data.value?.users ?? [])
const total = computed(() => data.value?.total ?? 0)
const totalPages = computed(() => Math.ceil(total.value / PAGE_SIZE))
const pageFrom = computed(() => (page.value - 1) * PAGE_SIZE + 1)
const pageTo = computed(() => Math.min(page.value * PAGE_SIZE, total.value))

// ── Role update ────────────────────────────────────────────────────────────────
const updatingId = ref<string | null>(null)

async function updateRole(userId: string, val: unknown) {
  // USelect may emit the full option object or just the value depending on version
  const newRole = (typeof val === 'object' && val !== null ? (val as any).value : val) as 'admin' | 'user'
  if (!newRole || !['admin', 'user'].includes(newRole)) return

  updatingId.value = userId
  try {
    const { error } = await (supabase.from('profiles') as any)
      .update({ role: newRole })
      .eq('id', userId)
    if (error) throw error
    toast.add({ title: 'Role updated', color: 'success', icon: 'heroicons:check-circle' })
    await refresh()
  } catch (err: any) {
    toast.add({ title: 'Failed to update role', description: err.message, color: 'error', icon: 'heroicons:x-circle' })
  } finally {
    updatingId.value = null
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const roleOptions = [
  { label: 'All Roles', value: 'all' },
  { label: 'User', value: 'user' },
  { label: 'Admin', value: 'admin' },
]

const roleSelectOptions = [
  { label: 'User', value: 'user' },
  { label: 'Admin', value: 'admin' },
]

function roleColor(role: string) {
  return role === 'admin' ? 'error' : 'neutral'
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function initials(name: string | null) {
  if (!name) return '?'
  return name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
}
</script>

<template>
  <div class="p-6 lg:p-8 space-y-6">

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="font-display text-2xl font-bold text-zinc-900 dark:text-white">Users</h1>
        <p class="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
          {{ total.toLocaleString() }} registered user{{ total !== 1 ? 's' : '' }}
        </p>
      </div>
      <UButton icon="heroicons:arrow-path" color="neutral" variant="outline" size="sm" :loading="pending" @click="() => refresh()">
        Refresh
      </UButton>
    </div>

    <!-- Filters -->
    <VCard padding="md">
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="flex-1">
          <UInput
            v-model="search"
            placeholder="Search by name or user ID…"
            icon="heroicons:magnifying-glass"
            size="sm"
          />
        </div>
        <USelect
          v-model="roleFilter"
          :items="roleOptions"
          size="sm"
          class="w-full sm:w-36"
        />
      </div>
    </VCard>

    <!-- Table -->
    <VCard padding="none">

      <!-- Loading -->
      <div v-if="pending" class="divide-y divide-zinc-100 dark:divide-zinc-800">
        <div v-for="i in 8" :key="i" class="flex items-center gap-4 px-5 py-3.5">
          <USkeleton class="size-9 rounded-full shrink-0" />
          <USkeleton class="h-4 w-40 flex-1" />
          <USkeleton class="h-5 w-14 rounded-full" />
          <USkeleton class="h-4 w-24" />
          <USkeleton class="h-8 w-28 rounded-lg" />
        </div>
      </div>

      <!-- Empty -->
      <div v-else-if="!users.length" class="flex flex-col items-center justify-center py-20 text-center">
        <UIcon name="heroicons:users" class="size-10 text-zinc-200 dark:text-zinc-700 mb-3" />
        <p class="text-sm text-zinc-500 dark:text-zinc-400">No users found</p>
        <UButton v-if="search || roleFilter !== 'all'" variant="ghost" size="sm" class="mt-2" @click="search = ''; roleFilter = 'all'">
          Clear filters
        </UButton>
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-zinc-100 dark:border-zinc-800">
              <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">User</th>
              <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Phone</th>
              <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Role</th>
              <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Joined</th>
              <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Change Role</th>
              <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Orders</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-100 dark:divide-zinc-800">
            <tr
              v-for="user in users"
              :key="user.id"
              class="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
            >
              <!-- Avatar + name + id -->
              <td class="px-5 py-3.5">
                <div class="flex items-center gap-3">
                  <div class="size-9 rounded-full overflow-hidden shrink-0 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                    <img
                      v-if="user.avatar_url"
                      :src="user.avatar_url"
                      :alt="user.full_name ?? ''"
                      class="size-full object-cover"
                    />
                    <span v-else class="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      {{ initials(user.full_name) }}
                    </span>
                  </div>
                  <div class="min-w-0">
                    <p class="font-medium text-zinc-900 dark:text-white truncate">
                      {{ user.full_name ?? '—' }}
                    </p>
                    <p class="font-mono text-[11px] text-zinc-400 truncate max-w-[160px]">{{ user.id }}</p>
                  </div>
                </div>
              </td>

              <!-- Phone -->
              <td class="px-5 py-3.5 text-zinc-500 dark:text-zinc-400 text-xs">
                {{ user.phone ?? '—' }}
              </td>

              <!-- Role badge -->
              <td class="px-5 py-3.5">
                <UBadge :color="(roleColor(user.role) as any)" variant="subtle" size="sm">
                  {{ user.role }}
                </UBadge>
              </td>

              <!-- Join date -->
              <td class="px-5 py-3.5 text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                {{ formatDate(user.created_at) }}
              </td>

              <!-- Role selector -->
              <td class="px-5 py-3.5">
                <div class="flex items-center gap-2">
                  <USelect
                    :model-value="user.role"
                    :items="roleSelectOptions"
                    size="xs"
                    class="w-24"
                    :disabled="updatingId === user.id"
                    @update:model-value="updateRole(user.id, $event as 'admin' | 'user')"
                  />
                  <UIcon
                    v-if="updatingId === user.id"
                    name="heroicons:arrow-path"
                    class="size-3.5 text-zinc-400 animate-spin"
                  />
                </div>
              </td>

              <!-- Orders link -->
              <td class="px-5 py-3.5">
                <NuxtLink :to="`/admin/orders?search=${user.id}`">
                  <UButton size="xs" color="neutral" variant="ghost" icon="heroicons:shopping-bag">
                    Orders
                  </UButton>
                </NuxtLink>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div class="flex items-center justify-between px-5 py-3.5 border-t border-zinc-100 dark:border-zinc-800">
          <p class="text-xs text-zinc-400">
            Showing {{ pageFrom }}–{{ pageTo }} of {{ total.toLocaleString() }}
          </p>
          <div class="flex items-center gap-1.5">
            <UButton size="xs" color="neutral" variant="outline" icon="heroicons:chevron-left" :disabled="page <= 1" @click="page--" />
            <span class="text-xs font-medium text-zinc-600 dark:text-zinc-400 px-2">{{ page }} / {{ totalPages }}</span>
            <UButton size="xs" color="neutral" variant="outline" icon="heroicons:chevron-right" :disabled="page >= totalPages" @click="page++" />
          </div>
        </div>
      </div>
    </VCard>

  </div>
</template>
