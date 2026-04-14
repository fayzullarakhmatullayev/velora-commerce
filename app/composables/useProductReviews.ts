// ─────────────────────────────────────────────────────────────────────────────
// Velora Commerce — Product reviews composable
// Fetches approved reviews + current user's own review for a product page.
// ─────────────────────────────────────────────────────────────────────────────
import type { Database } from '~/types/database.types'

type Review = Database['public']['Tables']['reviews']['Row']

export interface EnrichedReview extends Review {
  profile: { full_name: string | null; avatar_url: string | null }
}

export const useProductReviews = (productId: Ref<string | undefined>) => {
  const supabase = useSupabase()
  const user = useSupabaseUser()

  const { data, pending, refresh } = useAsyncData(
    () => `product-reviews-${productId.value ?? 'none'}`,
    async () => {
      if (!productId.value) return { reviews: [] as EnrichedReview[], userReview: null as Review | null, avgRating: 0 }

      const [reviewsRes, ownRes] = await Promise.all([
        supabase
          .from('reviews')
          .select('*')
          .eq('product_id', productId.value)
          .eq('is_approved', true)
          .order('created_at', { ascending: false }),
        user.value
          ? supabase
              .from('reviews')
              .select('*')
              .eq('product_id', productId.value)
              .eq('user_id', user.value.id)
              .maybeSingle()
          : Promise.resolve({ data: null, error: null }),
      ])

      if (reviewsRes.error) throw reviewsRes.error

      const reviews = (reviewsRes.data ?? []) as Review[]

      // Fetch reviewer profiles
      const userIds = [...new Set(reviews.map(r => r.user_id))]
      let profileMap: Record<string, { full_name: string | null; avatar_url: string | null }> = {}
      if (userIds.length) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', userIds)
        profileMap = Object.fromEntries(
          (profiles ?? []).map((p: any) => [p.id, { full_name: p.full_name, avatar_url: p.avatar_url }])
        )
      }

      const enriched: EnrichedReview[] = reviews.map(r => ({
        ...r,
        profile: profileMap[r.user_id] ?? { full_name: null, avatar_url: null },
      }))

      const avgRating = reviews.length
        ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
        : 0

      return {
        reviews: enriched,
        userReview: ownRes.data as Review | null,
        avgRating,
      }
    },
    { getCachedData: () => undefined },
  )

  const reviews = computed(() => data.value?.reviews ?? [])
  const userReview = computed(() => data.value?.userReview ?? null)
  const avgRating = computed(() => data.value?.avgRating ?? 0)

  return { reviews, userReview, avgRating, pending, refresh }
}

// ── Submit a new review ────────────────────────────────────────────────────────
export const useSubmitReview = () => {
  const supabase = useSupabase()
  const user = useSupabaseUser()
  const toast = useToast()
  const submitting = ref(false)

  async function submitReview(
    productId: string,
    rating: number,
    comment: string,
    onSuccess: () => void,
  ) {
    if (!user.value) return
    submitting.value = true
    try {
      const { error } = await supabase.from('reviews').insert({
        product_id: productId,
        user_id: user.value.id,
        rating,
        comment: comment.trim() || null,
        is_approved: false,
      })
      if (error) throw error
      toast.add({
        title: 'Review submitted!',
        description: 'Your review is pending approval and will appear shortly.',
        color: 'success',
        icon: 'heroicons:check-circle',
      })
      onSuccess()
    } catch (err: any) {
      // Unique constraint = already reviewed
      if (err.code === '23505') {
        toast.add({ title: 'Already reviewed', description: 'You have already submitted a review for this product.', color: 'warning', icon: 'heroicons:exclamation-triangle' })
      } else {
        toast.add({ title: 'Failed to submit', description: err.message, color: 'error', icon: 'heroicons:x-circle' })
      }
    } finally {
      submitting.value = false
    }
  }

  return { submitReview, submitting }
}
