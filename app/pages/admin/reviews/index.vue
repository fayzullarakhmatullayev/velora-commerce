<script setup lang="ts">
import type { Database } from '~/types/database.types'

type Review = Database['public']['Tables']['reviews']['Row']

definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Reviews — Velora Admin' })

const supabase = useSupabase()
const toast = useToast()

// ── Filters ────────────────────────────────────────────────────────────────────
const statusFilter = ref('pending')  // 'all' | 'pending' | 'approved'

// ── Fetch reviews with product + profile info ──────────────────────────────────
const { data, pending, refresh } = useAsyncData(
  () => `admin-reviews-${statusFilter.value}`,
  async () => {
    let query = supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })

    if (statusFilter.value === 'pending') query = query.eq('is_approved', false)
    if (statusFilter.value === 'approved') query = query.eq('is_approved', true)

    const { data: reviews, error } = await query
    if (error) throw error

    if (!reviews?.length) return []

    // Fetch product titles and user names in parallel
    const productIds = [...new Set(reviews.map(r => r.product_id).filter(Boolean))]
    const userIds    = [...new Set(reviews.map(r => r.user_id))]

    const [productsRes, profilesRes] = await Promise.all([
      supabase.from('products').select('id, translations').in('id', productIds as string[]),
      supabase.from('profiles').select('id, full_name, avatar_url').in('id', userIds),
    ])

    const productMap = Object.fromEntries(
      ((productsRes.data ?? []) as any[]).map((p: any) => [p.id, p.translations?.en?.title ?? 'Untitled'])
    )
    const profileMap = Object.fromEntries(
      ((profilesRes.data ?? []) as any[]).map((p: any) => [p.id, { name: p.full_name, avatar: p.avatar_url }])
    )

    return (reviews as Review[]).map(r => ({
      ...r,
      productTitle: r.product_id ? (productMap[r.product_id] ?? 'Unknown product') : 'Unknown product',
      user: profileMap[r.user_id] ?? { name: null, avatar: null },
    }))
  },
  { getCachedData: () => undefined },
)

const reviews = computed(() => data.value ?? [])
const pendingCount = computed(() => reviews.value.filter(r => !r.is_approved).length)

// ── Approve / reject ───────────────────────────────────────────────────────────
const updatingId = ref<string | null>(null)

async function setApproval(review: Review, approved: boolean) {
  updatingId.value = review.id
  try {
    const { error } = await (supabase.from('reviews') as any)
      .update({ is_approved: approved, updated_at: new Date().toISOString() })
      .eq('id', review.id)
    if (error) throw error
    toast.add({
      title: approved ? 'Review approved' : 'Review rejected',
      color: approved ? 'success' : 'warning',
      icon: approved ? 'heroicons:check-circle' : 'heroicons:x-circle',
    })
    await refresh()
  } catch (err: any) {
    toast.add({ title: 'Failed to update review', description: err.message, color: 'error', icon: 'heroicons:x-circle' })
  } finally {
    updatingId.value = null
  }
}

// ── Delete ─────────────────────────────────────────────────────────────────────
const deleteTarget = ref<string | null>(null)
const deleting = ref(false)

async function deleteReview(id: string) {
  deleteTarget.value = id
  deleting.value = true
  try {
    const { error } = await supabase.from('reviews').delete().eq('id', id)
    if (error) throw error
    toast.add({ title: 'Review deleted', color: 'success', icon: 'heroicons:trash' })
    await refresh()
  } catch (err: any) {
    toast.add({ title: 'Failed to delete', description: err.message, color: 'error', icon: 'heroicons:x-circle' })
  } finally {
    deleting.value = false
    deleteTarget.value = null
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function initials(name: string | null) {
  if (!name) return '?'
  return name.split(' ').map((p: string) => p[0]).join('').slice(0, 2).toUpperCase()
}

const statusOptions = [
  { label: 'Pending approval', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'All reviews', value: 'all' },
]
</script>

<template>
  <div class="p-6 lg:p-8 space-y-6">

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="font-display text-2xl font-bold text-zinc-900 dark:text-white">Reviews</h1>
        <p class="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
          {{ reviews.length }} review{{ reviews.length !== 1 ? 's' : '' }}
          <span v-if="statusFilter === 'pending' && pendingCount > 0" class="ml-1 text-amber-600 dark:text-amber-400 font-medium">
            · {{ pendingCount }} awaiting approval
          </span>
        </p>
      </div>
      <div class="flex items-center gap-2">
        <UButton icon="heroicons:arrow-path" color="neutral" variant="outline" size="sm" :loading="pending" @click="() => refresh()">
          Refresh
        </UButton>
        <USelect v-model="statusFilter" :items="statusOptions" size="sm" class="w-44" />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="space-y-3">
      <VCard v-for="i in 4" :key="i" padding="md">
        <div class="flex gap-4">
          <USkeleton class="size-10 rounded-full shrink-0" />
          <div class="flex-1 space-y-2">
            <USkeleton class="h-4 w-48" />
            <USkeleton class="h-4 w-full" />
            <USkeleton class="h-4 w-3/4" />
          </div>
          <USkeleton class="h-8 w-24 rounded-lg shrink-0" />
        </div>
      </VCard>
    </div>

    <!-- Empty -->
    <div v-else-if="!reviews.length" class="flex flex-col items-center justify-center py-24 text-center">
      <UIcon name="heroicons:star" class="size-10 text-zinc-200 dark:text-zinc-700 mb-3" />
      <p class="text-sm text-zinc-500 dark:text-zinc-400">
        {{ statusFilter === 'pending' ? 'No reviews awaiting approval' : 'No reviews found' }}
      </p>
    </div>

    <!-- Review cards -->
    <div v-else class="space-y-3">
      <VCard
        v-for="review in reviews"
        :key="review.id"
        padding="md"
        class="transition-all"
        :class="!review.is_approved ? 'border-amber-200 dark:border-amber-900/50' : ''"
      >
        <div class="flex flex-col sm:flex-row gap-4">

          <!-- Left: user + meta -->
          <div class="flex items-start gap-3 flex-1 min-w-0">
            <!-- Avatar -->
            <div class="size-10 rounded-full overflow-hidden shrink-0 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
              <img
                v-if="(review as any).user?.avatar"
                :src="(review as any).user.avatar"
                class="size-full object-cover"
              />
              <span v-else class="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                {{ initials((review as any).user?.name) }}
              </span>
            </div>

            <div class="flex-1 min-w-0">
              <!-- User + product + date -->
              <div class="flex flex-wrap items-center gap-x-2 gap-y-0.5 mb-1">
                <span class="font-medium text-zinc-900 dark:text-white text-sm">
                  {{ (review as any).user?.name ?? 'Anonymous' }}
                </span>
                <span class="text-zinc-300 dark:text-zinc-600">·</span>
                <NuxtLink
                  :to="review.product_id ? `/admin/products/${review.product_id}` : '/admin/products'"
                  class="text-xs text-primary-600 dark:text-primary-400 hover:underline truncate max-w-48"
                >
                  {{ (review as any).productTitle }}
                </NuxtLink>
                <span class="text-zinc-300 dark:text-zinc-600">·</span>
                <span class="text-xs text-zinc-400">{{ formatDate(review.created_at) }}</span>
              </div>

              <!-- Star rating -->
              <div class="flex items-center gap-0.5 mb-2">
                <UIcon
                  v-for="star in 5"
                  :key="star"
                  name="heroicons:star-solid"
                  class="size-3.5"
                  :class="star <= review.rating ? 'text-amber-400' : 'text-zinc-200 dark:text-zinc-700'"
                />
                <span class="ml-1 text-xs font-medium text-zinc-600 dark:text-zinc-400">{{ review.rating }}/5</span>
              </div>

              <!-- Comment -->
              <p v-if="review.comment" class="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                {{ review.comment }}
              </p>
              <p v-else class="text-sm text-zinc-400 italic">No comment</p>

              <!-- Status badge -->
              <div class="mt-2">
                <UBadge
                  :color="review.is_approved ? 'success' : 'warning'"
                  variant="subtle"
                  size="sm"
                >
                  {{ review.is_approved ? 'Approved' : 'Pending' }}
                </UBadge>
              </div>
            </div>
          </div>

          <!-- Right: action buttons -->
          <div class="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
            <UButton
              v-if="!review.is_approved"
              size="sm"
              color="success"
              variant="soft"
              icon="heroicons:check"
              :loading="updatingId === review.id"
              @click="setApproval(review, true)"
            >
              Approve
            </UButton>
            <UButton
              v-else
              size="sm"
              color="warning"
              variant="soft"
              icon="heroicons:x-mark"
              :loading="updatingId === review.id"
              @click="setApproval(review, false)"
            >
              Unapprove
            </UButton>
            <UButton
              size="sm"
              color="error"
              variant="ghost"
              icon="heroicons:trash"
              :loading="deleteTarget === review.id && deleting"
              @click="deleteReview(review.id)"
            />
          </div>

        </div>
      </VCard>
    </div>

  </div>
</template>
