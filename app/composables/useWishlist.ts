// ─────────────────────────────────────────────────────────────────────────────
// Velora Commerce — useWishlist composable
// ─────────────────────────────────────────────────────────────────────────────
import { useWishlistStore } from '~/stores/wishlist'
import type { ProductRow } from '~/composables/useProducts'

export const useWishlist = () => {
  const store = useWishlistStore()
  const { t } = useI18n()
  const toast = useToast()

  // Keep global count in sync for the WishlistButton badge
  const wishlistCount = useState<number>('wishlist.count', () => 0)
  watch(() => store.count, (n) => { wishlistCount.value = n }, { immediate: true })

  function toggleProduct(product: ProductRow) {
    const slug = product.translations['en']?.slug ?? product.id
    const added = store.toggle({
      productId: product.id,
      title: product.translations['en']?.title ?? '',
      image: product.images?.[0] ?? '',
      price: product.price,
      slug,
    })

    toast.add({
      title: added ? t('product.addedToWishlist') : 'Removed from wishlist',
      icon: added ? 'heroicons:heart-solid' : 'heroicons:heart',
      color: added ? 'error' : 'neutral',
      duration: 2000,
    })

    return added
  }

  return { store, toggleProduct }
}
