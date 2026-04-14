// ─────────────────────────────────────────────────────────────────────────────
// Velora Commerce — Admin product form composable
// Shared state and save/load logic for create & edit pages
// ─────────────────────────────────────────────────────────────────────────────
import type { Database } from '~/types/database.types'

type Product = Database['public']['Tables']['products']['Row']
type Category = Database['public']['Tables']['categories']['Row']

export interface ProductFormState {
  sku: string
  price: string
  compare_price: string
  stock: string
  images: string[]
  category_id: string
  brand: string
  tags: string[]
  is_active: boolean
  is_featured: boolean
  translations: {
    en: { title: string; description: string; slug: string }
    uz: { title: string; description: string; slug: string }
    ru: { title: string; description: string; slug: string }
  }
}

export function emptyForm(): ProductFormState {
  return {
    sku: '',
    price: '',
    compare_price: '',
    stock: '0',
    images: [''],
    category_id: 'none',
    brand: '',
    tags: [],
    is_active: true,
    is_featured: false,
    translations: {
      en: { title: '', description: '', slug: '' },
      uz: { title: '', description: '', slug: '' },
      ru: { title: '', description: '', slug: '' },
    },
  }
}

export function productToForm(p: Product): ProductFormState {
  return {
    sku: p.sku ?? '',
    price: String(p.price ?? ''),
    compare_price: p.compare_price != null ? String(p.compare_price) : '',
    stock: String(p.stock ?? 0),
    images: p.images?.length ? p.images : [''],
    category_id: p.category_id ?? 'none',
    brand: p.brand ?? '',
    tags: p.tags ?? [],
    is_active: p.is_active,
    is_featured: p.is_featured,
    translations: {
      en: {
        title: p.translations?.en?.title ?? '',
        description: p.translations?.en?.description ?? '',
        slug: p.translations?.en?.slug ?? '',
      },
      uz: {
        title: p.translations?.uz?.title ?? '',
        description: p.translations?.uz?.description ?? '',
        slug: p.translations?.uz?.slug ?? '',
      },
      ru: {
        title: p.translations?.ru?.title ?? '',
        description: p.translations?.ru?.description ?? '',
        slug: p.translations?.ru?.slug ?? '',
      },
    },
  }
}

export function formToPayload(f: ProductFormState) {
  const price = parseFloat(f.price)
  const comparePrice = f.compare_price.trim() ? parseFloat(f.compare_price) : null
  const stock = parseInt(f.stock, 10)

  return {
    sku: f.sku.trim(),
    price: isNaN(price) ? 0 : price,
    compare_price: comparePrice != null && !isNaN(comparePrice) ? comparePrice : null,
    stock: isNaN(stock) ? 0 : stock,
    images: f.images.map((u) => u.trim()).filter(Boolean),
    category_id: (f.category_id && f.category_id !== 'none') ? f.category_id : null,
    brand: f.brand.trim() || null,
    tags: f.tags.filter(Boolean),
    is_active: f.is_active,
    is_featured: f.is_featured,
    translations: f.translations,
  }
}

// ── Categories for the select dropdown ────────────────────────────────────────
export const useAdminCategories = () => {
  const supabase = useSupabase()
  return useAsyncData(
    'admin-categories',
    async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, translations, slug')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
      if (error) throw error
      return (data ?? []) as Pick<Category, 'id' | 'translations' | 'slug'>[]
    },
    { getCachedData: () => undefined },
  )
}

// ── Slug helper ────────────────────────────────────────────────────────────────
export function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '')
}
