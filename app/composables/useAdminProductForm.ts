// ─────────────────────────────────────────────────────────────────────────────
// Velora Commerce — Admin product form composable
// Shared state and save/load logic for create & edit pages
// ─────────────────────────────────────────────────────────────────────────────
import type { Database } from '~/types/database.types'

type Product = Database['public']['Tables']['products']['Row']
type Category = Database['public']['Tables']['categories']['Row']

// A single option group (e.g., Size, Color, Storage).
// Each value carries its own stock count.
export interface ProductVariantOption {
  optionName: string  // e.g. "Size", "Color", "Storage"
  values: { value: string; stock: number }[]
}

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
  // Variant option — empty values array means no variants (use global stock)
  variantOption: ProductVariantOption
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
    variantOption: { optionName: 'Size', values: [] },
  }
}

export function productToForm(p: Product, variantRows: { attributes: Record<string, string>; stock: number }[] = []): ProductFormState {
  // Reconstruct option from existing variants
  let variantOption: ProductVariantOption = { optionName: 'Size', values: [] }
  if (variantRows.length > 0) {
    const firstKey = Object.keys(variantRows[0]!.attributes)[0] ?? 'Size'
    variantOption = {
      optionName: firstKey,
      values: variantRows.map(v => ({
        value: v.attributes[firstKey] ?? '',
        stock: v.stock,
      })),
    }
  }

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
    variantOption,
  }
}

export function formToPayload(f: ProductFormState) {
  const price = parseFloat(f.price)
  const comparePrice = f.compare_price.trim() ? parseFloat(f.compare_price) : null

  // If variant values exist, stock = sum of variant stocks. Otherwise use the field.
  const variantTotal = f.variantOption.values.reduce((s, v) => s + (v.stock || 0), 0)
  const stock = f.variantOption.values.length > 0
    ? variantTotal
    : parseInt(f.stock, 10) || 0

  return {
    sku: f.sku.trim(),
    price: isNaN(price) ? 0 : price,
    compare_price: comparePrice != null && !isNaN(comparePrice) ? comparePrice : null,
    stock,
    images: f.images.map((u) => u.trim()).filter(Boolean),
    category_id: (f.category_id && f.category_id !== 'none') ? f.category_id : null,
    brand: f.brand.trim() || null,
    tags: f.tags.filter(Boolean),
    is_active: f.is_active,
    is_featured: f.is_featured,
    translations: f.translations,
  }
}

// ── Save variant rows for a product ───────────────────────────────────────────
// Deletes all existing variants then inserts fresh ones.
// price on each variant mirrors the product price (no per-variant pricing yet).
export async function saveVariants(
  supabase: ReturnType<typeof useSupabase>,
  productId: string,
  productSku: string,
  productPrice: number,
  option: ProductVariantOption,
) {
  // Always wipe existing variants first for a clean replace
  await supabase.from('product_variants').delete().eq('product_id', productId)

  if (!option.values.length) return

  const rows = option.values
    .filter(v => v.value.trim())
    .map(v => ({
      product_id: productId,
      sku: `${productSku}-${v.value.trim().toUpperCase().replace(/\s+/g, '-')}`,
      price: productPrice,
      stock: v.stock,
      attributes: { [option.optionName]: v.value.trim() },
    }))

  if (rows.length) {
    await supabase.from('product_variants').insert(rows)
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
