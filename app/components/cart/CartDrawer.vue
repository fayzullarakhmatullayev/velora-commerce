<script setup lang="ts">
const { t } = useI18n()
const { store, isOpen, close } = useCart()

const couponInput = ref('')
const couponLoading = ref(false)

async function applyCoupon() {
  if (!couponInput.value.trim()) return
  couponLoading.value = true

  try {
    const supabase = useSupabase()
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', couponInput.value.trim().toUpperCase())
      .eq('is_active', true)
      .single()

    if (error || !data) {
      useToast().add({ title: 'Invalid coupon code', color: 'error', icon: 'heroicons:x-circle' })
      return
    }

    // Check expiry
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      useToast().add({ title: 'Coupon has expired', color: 'error', icon: 'heroicons:x-circle' })
      return
    }

    // Check max uses
    if (data.max_uses != null && data.used_count >= data.max_uses) {
      useToast().add({ title: 'Coupon usage limit reached', color: 'error', icon: 'heroicons:x-circle' })
      return
    }

    // Check min order
    if (data.min_order_amount != null && store.subtotal < data.min_order_amount) {
      useToast().add({
        title: `Minimum order $${data.min_order_amount} required`,
        color: 'warning',
        icon: 'heroicons:exclamation-circle',
      })
      return
    }

    const discountAmount =
      data.type === 'percentage'
        ? (store.subtotal * data.value) / 100
        : data.value

    store.applyCoupon(data.code, Math.min(discountAmount, store.subtotal))
    useToast().add({ title: `Coupon "${data.code}" applied!`, color: 'success', icon: 'heroicons:tag' })
    couponInput.value = ''
  } finally {
    couponLoading.value = false
  }
}
</script>

<template>
  <USlideover v-model:open="isOpen" side="right" :ui="{ width: 'max-w-sm' }">
    <template #content>
      <div class="flex h-full flex-col bg-white dark:bg-zinc-900">

        <!-- Header -->
        <div class="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 px-5 py-4">
          <div class="flex items-center gap-2">
            <UIcon name="heroicons:shopping-bag" class="size-5 text-zinc-700 dark:text-zinc-300" />
            <h2 class="font-display font-semibold text-zinc-900 dark:text-white">
              {{ t('cart.title') }}
            </h2>
            <VBadge v-if="store.count > 0" color="primary">{{ store.count }}</VBadge>
          </div>
          <UButton icon="heroicons:x-mark" color="neutral" variant="ghost" size="sm" @click="close" />
        </div>

        <!-- Empty state -->
        <div
          v-if="store.items.length === 0"
          class="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center"
        >
          <div class="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
            <UIcon name="heroicons:shopping-bag" class="size-10 text-zinc-300 dark:text-zinc-600" />
          </div>
          <div>
            <p class="font-medium text-zinc-700 dark:text-zinc-300">{{ t('cart.empty') }}</p>
            <p class="mt-1 text-sm text-zinc-400">{{ t('cart.addItemsHint') }}</p>
          </div>
          <UButton to="/shop" @click="close">{{ t('cart.continueShopping') }}</UButton>
        </div>

        <!-- Cart items -->
        <div v-else class="flex flex-1 flex-col overflow-hidden">
          <div class="flex-1 overflow-y-auto px-5 divide-y divide-zinc-100 dark:divide-zinc-800">
            <CartItem v-for="item in store.items" :key="item.id" :item="item" />
          </div>

          <!-- Footer -->
          <div class="border-t border-zinc-100 dark:border-zinc-800 px-5 py-4 space-y-4">

            <!-- Coupon code -->
            <div class="flex gap-2">
              <UInput
                v-model="couponInput"
                :placeholder="t('cart.coupon')"
                size="sm"
                class="flex-1"
                :disabled="!!store.couponCode"
                @keydown.enter="applyCoupon"
              />
              <UButton
                v-if="!store.couponCode"
                size="sm"
                color="neutral"
                variant="outline"
                :loading="couponLoading"
                @click="applyCoupon"
              >
                {{ t('cart.applyCoupon') }}
              </UButton>
              <UButton
                v-else
                size="sm"
                color="error"
                variant="ghost"
                icon="heroicons:x-mark"
                @click="store.removeCoupon()"
              />
            </div>

            <!-- Applied coupon info -->
            <div
              v-if="store.couponCode"
              class="flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-950 px-3 py-2"
            >
              <UIcon name="heroicons:tag" class="size-4 text-emerald-600" />
              <span class="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                "{{ store.couponCode }}" applied
              </span>
            </div>

            <!-- Order summary -->
            <div class="space-y-2 text-sm">
              <div class="flex justify-between text-zinc-500 dark:text-zinc-400">
                <span>{{ t('cart.subtotal') }}</span>
                <span>${{ store.subtotal.toFixed(2) }}</span>
              </div>
              <div v-if="store.discount > 0" class="flex justify-between text-emerald-600">
                <span>{{ t('cart.discount') }}</span>
                <span>-${{ store.discount.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between font-semibold text-zinc-900 dark:text-white text-base border-t border-zinc-100 dark:border-zinc-800 pt-2">
                <span>{{ t('cart.total') }}</span>
                <span>${{ store.total.toFixed(2) }}</span>
              </div>
            </div>

            <!-- Checkout button -->
            <UButton to="/checkout" block size="lg" @click="close">
              {{ t('cart.checkout') }}
              <UIcon name="heroicons:arrow-right" class="size-4" />
            </UButton>

            <button
              class="w-full text-center text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
              @click="close"
            >
              {{ t('cart.continueShopping') }} →
            </button>
          </div>
        </div>

      </div>
    </template>
  </USlideover>
</template>
