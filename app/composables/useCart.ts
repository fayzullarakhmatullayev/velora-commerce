// ─────────────────────────────────────────────────────────────────────────────
// Velora Commerce — useCart composable
// Thin wrapper over the Pinia store. Wires counts to the header button.
// ─────────────────────────────────────────────────────────────────────────────
import { useCartStore } from '~/stores/cart'
import type { ProductRow } from '~/composables/useProducts'
import type { ProductVariantRow } from '~/composables/useProduct'

export const useCart = () => {
  const store = useCartStore()
  const { t } = useI18n()
  const toast = useToast()

  // Keep global count in sync for the CartButton badge
  const cartCount = useState<number>('cart.count', () => 0)
  watch(() => store.count, (n) => { cartCount.value = n }, { immediate: true })

  // Cart drawer open state
  const isOpen = useState<boolean>('cart.open', () => false)

  function open() { isOpen.value = true }
  function close() { isOpen.value = false }

  function addProduct(
    product: ProductRow,
    quantity = 1,
    variant?: ProductVariantRow,
  ) {
    const locale = 'en' // use en slug always
    const translation = product.translations[locale]

    store.addItem({
      productId: product.id,
      variantId: variant?.id,
      quantity,
      price: variant?.price ?? product.price,
      title: translation?.title ?? 'Product',
      image: product.images?.[0] ?? '',
      slug: translation?.slug ?? product.id,
    })

    toast.add({
      title: t('product.addedToCart'),
      icon: 'heroicons:shopping-bag',
      color: 'success',
      duration: 2500,
    })

    isOpen.value = true
  }

  return {
    store,
    isOpen,
    open,
    close,
    addProduct,
  }
}
