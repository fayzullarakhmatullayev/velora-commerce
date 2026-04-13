// ─────────────────────────────────────────────────────────────────────────────
// Velora Commerce — Categories composable
// ─────────────────────────────────────────────────────────────────────────────
import type { Database } from '~/types/database.types'

export type CategoryRow = Database['public']['Tables']['categories']['Row']

export const useCategories = () => {
  const supabase = useSupabase()
  const { locale } = useI18n()

  const { data: categories, pending } = useAsyncData('categories', async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error) throw error
    return data ?? []
  }, { default: (): CategoryRow[] => [] })

  const getCategoryName = (cat: CategoryRow) =>
    cat.translations[locale.value as keyof typeof cat.translations]?.name ||
    cat.translations['en']?.name ||
    cat.slug

  return { categories, pending, getCategoryName }
}
