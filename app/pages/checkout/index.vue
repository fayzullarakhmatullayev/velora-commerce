<script setup lang="ts">
import { loadStripe } from '@stripe/stripe-js'
import type { Stripe, StripeElements, StripePaymentElement } from '@stripe/stripe-js'

definePageMeta({ middleware: 'auth' })
useSeoMeta({ title: 'Checkout — Velora Commerce' })

const { t } = useI18n()
const config = useRuntimeConfig()
const { store: cartStore } = useCart()
const supabase = useSupabase()
const user = useSupabaseUser()
const toast = useToast()
const router = useRouter()

// ── Guard: redirect if cart is empty ─────────────────────────────────────────
onMounted(() => {
  if (cartStore.count === 0) navigateTo('/shop')
})

// ── Fetch saved addresses ─────────────────────────────────────────────────────
const { data: addresses } = useAsyncData('checkout-addresses', async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user?.id) return []
  const { data } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', session.user.id)
    .order('is_default', { ascending: false })
  return data ?? []
}, { default: () => [], getCachedData: () => undefined })

const selectedAddressId = ref<string | null>(null)
const useNewAddress = ref(true)

watch(addresses, (addrs) => {
  const def = addrs.find((a) => a.is_default) ?? addrs[0]
  if (def) {
    selectedAddressId.value = def.id
    useNewAddress.value = false
  }
}, { immediate: true })

// ── Shipping form ─────────────────────────────────────────────────────────────
const shipping = reactive({
  full_name: '',
  phone: '',
  street: '',
  city: '',
  state: '',
  postal_code: '',
  country: '',
})

const selectedAddress = computed(() =>
  addresses.value.find((a) => a.id === selectedAddressId.value),
)

function getShippingAddress() {
  if (!useNewAddress.value && selectedAddress.value) {
    const a = selectedAddress.value
    return { full_name: a.full_name, phone: a.phone, street: a.street, city: a.city, state: a.state ?? '', postal_code: a.postal_code, country: a.country }
  }
  return { ...shipping }
}

function validateShipping() {
  const a = getShippingAddress()
  return a.full_name && a.street && a.city && a.postal_code && a.country && a.phone
}

// ── Step state ────────────────────────────────────────────────────────────────
const step = ref<'shipping' | 'payment'>('shipping')
const loadingIntent = ref(false)
const paying = ref(false)
const clientSecret = ref<string | null>(null)
const intentId = ref<string | null>(null)

// ── Stripe instances ──────────────────────────────────────────────────────────
let stripe: Stripe | null = null
let elements: StripeElements | null = null
let paymentElement: StripePaymentElement | null = null
const stripeReady = ref(false)
const paymentElRef = ref<HTMLDivElement | null>(null)

// ── Step 1: create PaymentIntent → mount Stripe Element ───────────────────────
async function continueToPayment() {
  if (!validateShipping()) {
    toast.add({ title: 'Please fill all required shipping fields', color: 'error' })
    return
  }

  loadingIntent.value = true
  try {
    const { data: { session: intentSession } } = await supabase.auth.getSession()
    const amountCents = Math.round(cartStore.total * 100)
    const res = await $fetch<{ clientSecret: string; intentId: string }>('/api/checkout/intent', {
      method: 'POST',
      body: {
        amount: amountCents,
        receipt_email: intentSession?.user?.email ?? undefined,
        metadata: { user_id: intentSession?.user?.id ?? '' },
      },
    })
    clientSecret.value = res.clientSecret
    intentId.value = res.intentId
    step.value = 'payment'

    // Mount Stripe Element after DOM update
    await nextTick()
    await mountStripeElement()
  } catch (e: unknown) {
    toast.add({ title: e instanceof Error ? e.message : 'Failed to initialize payment', color: 'error' })
  } finally {
    loadingIntent.value = false
  }
}

async function mountStripeElement() {
  if (!clientSecret.value) return

  stripe = await loadStripe(config.public.stripePublishableKey as string)
  if (!stripe) {
    toast.add({ title: 'Failed to load Stripe', color: 'error' })
    return
  }

  elements = stripe.elements({
    clientSecret: clientSecret.value,
    appearance: {
      theme: document.documentElement.classList.contains('dark') ? 'night' : 'stripe',
      variables: {
        colorPrimary: '#7c3aed',
        borderRadius: '8px',
        fontFamily: 'Inter, system-ui, sans-serif',
      },
    },
  })

  paymentElement = elements.create('payment', {
    layout: 'accordion',
    paymentMethodOrder: ['card'],
    // Disable wallet buttons — Apple Pay requires domain registration,
    // Google Pay requires activation. Cards work without either.
    wallets: {
      applePay: 'never',
      googlePay: 'never',
    },
  })

  if (paymentElRef.value) {
    paymentElement.mount(paymentElRef.value)
    paymentElement.on('ready', () => { stripeReady.value = true })
  }
}

// ── Step 2: Confirm payment ───────────────────────────────────────────────────
async function pay() {
  if (!stripe || !elements) return

  paying.value = true
  try {
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    })

    if (error) {
      toast.add({
        title: error.message ?? 'Payment failed',
        color: 'error',
        duration: 6000,
      })
      return
    }

    if (paymentIntent?.status === 'succeeded') {
      await placeOrder(paymentIntent.id)
    } else {
      toast.add({ title: 'Payment not completed. Please try again.', color: 'warning' })
    }
  } finally {
    paying.value = false
  }
}

// ── Create order in Supabase after payment succeeds ───────────────────────────
async function placeOrder(stripeIntentId: string) {
  // Always resolve the session fresh — user.value can go stale if the
  // access token was silently refreshed while Stripe was processing.
  const { data: { session } } = await supabase.auth.getSession()
  const userId = session?.user?.id

  if (!userId) {
    toast.add({ title: 'Session expired. Please log in again.', color: 'error' })
    navigateTo('/auth/login')
    return
  }

  const shippingAddr = getShippingAddress()

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      status: 'paid',
      payment_status: 'paid',
      subtotal: cartStore.subtotal,
      discount: cartStore.discount,
      total: cartStore.total,
      shipping_address: shippingAddr,
      coupon_code: cartStore.couponCode || null,
      stripe_payment_intent_id: stripeIntentId,
    })
    .select()
    .single()

  if (orderError) {
    toast.add({ title: 'Payment succeeded but order save failed. Contact support.', color: 'error', duration: 10000 })
    return
  }

  await supabase.from('order_items').insert(
    cartStore.items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      variant_id: item.variantId ?? null,
      title: item.title,
      image: item.image || null,
      price: item.price,
      quantity: item.quantity,
    })),
  )

  cartStore.clear()
  router.push(`/checkout/success?order=${order.id}`)
}

// ── Cleanup on unmount ────────────────────────────────────────────────────────
onUnmounted(() => {
  paymentElement?.destroy()
})

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatPrice(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}
</script>

<template>
  <div class="velora-container py-10">
    <div class="mb-8">
      <h1 class="font-display text-2xl font-bold text-zinc-900 dark:text-white">{{ t('checkout.title') }}</h1>
    </div>

    <!-- Empty cart guard -->
    <div v-if="cartStore.count === 0" class="flex flex-col items-center justify-center py-24 text-center">
      <UIcon name="heroicons:shopping-cart" class="size-16 text-zinc-200 dark:text-zinc-700 mb-4" />
      <p class="font-medium text-zinc-700 dark:text-zinc-300">{{ t('checkout.emptyCart') }}</p>
      <UButton to="/shop" class="mt-6">{{ t('common.continueShopping') }}</UButton>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">

      <!-- ── Left column: steps ─────────────────────────────────────────────── -->
      <div class="lg:col-span-2 space-y-6">

        <!-- Progress indicator -->
        <div class="flex items-center gap-2 text-sm select-none">
          <button
            class="flex items-center gap-2 font-medium transition-colors"
            :class="step === 'shipping' ? 'text-primary-600 dark:text-primary-400' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'"
            @click="step = 'shipping'"
          >
            <span
              class="flex size-6 items-center justify-center rounded-full text-xs font-bold transition-colors"
              :class="step === 'shipping' ? 'bg-primary-600 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500'"
            >1</span>
            {{ t('checkout.shippingStep') }}
          </button>
          <div class="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
          <span
            class="flex items-center gap-2 font-medium"
            :class="step === 'payment' ? 'text-primary-600 dark:text-primary-400' : 'text-zinc-400'"
          >
            <span
              class="flex size-6 items-center justify-center rounded-full text-xs font-bold transition-colors"
              :class="step === 'payment' ? 'bg-primary-600 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500'"
            >2</span>
            {{ t('checkout.paymentStep') }}
          </span>
        </div>

        <!-- ── Step 1: Shipping ─────────────────────────────────────────────── -->
        <VCard v-if="step === 'shipping'" padding="lg">
          <h2 class="font-semibold text-zinc-900 dark:text-white mb-5">{{ t('checkout.shippingInfo') }}</h2>

          <!-- Saved addresses -->
          <div v-if="addresses.length > 0" class="mb-6">
            <p class="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
              {{ t('checkout.savedAddresses') }}
            </p>
            <div class="space-y-2">
              <label
                v-for="addr in addresses"
                :key="addr.id"
                class="flex items-start gap-3 rounded-xl border p-3.5 cursor-pointer transition-colors"
                :class="
                  !useNewAddress && selectedAddressId === addr.id
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-950'
                    : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                "
              >
                <input
                  type="radio"
                  :value="addr.id"
                  :checked="!useNewAddress && selectedAddressId === addr.id"
                  class="mt-0.5 accent-violet-600"
                  @change="() => { selectedAddressId = addr.id; useNewAddress = false }"
                />
                <address class="not-italic text-sm text-zinc-600 dark:text-zinc-300">
                  <p class="font-medium text-zinc-900 dark:text-white">
                    {{ addr.full_name }}
                    <span class="text-xs text-zinc-400 font-normal ml-1">{{ addr.label }}</span>
                  </p>
                  <p class="mt-0.5">{{ addr.street }}, {{ addr.city }} {{ addr.postal_code }}, {{ addr.country }}</p>
                  <p class="text-zinc-400 mt-0.5">{{ addr.phone }}</p>
                </address>
              </label>

              <label
                class="flex items-center gap-3 rounded-xl border p-3.5 cursor-pointer transition-colors"
                :class="
                  useNewAddress
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-950'
                    : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                "
              >
                <input
                  type="radio"
                  :checked="useNewAddress"
                  class="accent-violet-600"
                  @change="() => { useNewAddress = true; selectedAddressId = null }"
                />
                <span class="text-sm font-medium text-zinc-900 dark:text-white">{{ t('checkout.useNewAddress') }}</span>
              </label>
            </div>
          </div>

          <!-- New address form -->
          <div v-if="useNewAddress || addresses.length === 0" class="grid grid-cols-2 gap-3">
            <UFormField :label="`${t('checkout.fullName')} *`" name="full_name" class="col-span-2">
              <UInput v-model="shipping.full_name" placeholder="Jane Smith" class="w-full" />
            </UFormField>

            <UFormField :label="`${t('checkout.phone')} *`" name="phone" class="col-span-2">
              <UInput v-model="shipping.phone" type="tel" placeholder="+1 555 000 0000" class="w-full" />
            </UFormField>

            <UFormField :label="`${t('checkout.street')} *`" name="street" class="col-span-2">
              <UInput v-model="shipping.street" placeholder="123 Main St" class="w-full" />
            </UFormField>

            <UFormField :label="`${t('checkout.city')} *`" name="city">
              <UInput v-model="shipping.city" placeholder="New York" class="w-full" />
            </UFormField>

            <UFormField :label="t('checkout.state')" name="state">
              <UInput v-model="shipping.state" placeholder="NY" class="w-full" />
            </UFormField>

            <UFormField :label="`${t('checkout.postalCode')} *`" name="postal_code">
              <UInput v-model="shipping.postal_code" placeholder="10001" class="w-full" />
            </UFormField>

            <UFormField :label="`${t('checkout.country')} *`" name="country">
              <UInput v-model="shipping.country" placeholder="US" class="w-full" />
            </UFormField>
          </div>

          <div class="mt-6">
            <UButton size="lg" block :loading="loadingIntent" @click="continueToPayment">
              {{ t('checkout.continuePayment') }}
            </UButton>
          </div>
        </VCard>

        <!-- ── Step 2: Payment ──────────────────────────────────────────────── -->
        <VCard v-else-if="step === 'payment'" padding="lg">
          <h2 class="font-semibold text-zinc-900 dark:text-white mb-5">{{ t('checkout.paymentDetails') }}</h2>

          <!-- Stripe Payment Element mount point -->
          <div class="mb-6">
            <!-- Skeleton while Stripe loads -->
            <div v-if="!stripeReady" class="space-y-3">
              <USkeleton class="h-12 w-full rounded-lg" />
              <USkeleton class="h-12 w-full rounded-lg" />
              <div class="grid grid-cols-2 gap-3">
                <USkeleton class="h-12 rounded-lg" />
                <USkeleton class="h-12 rounded-lg" />
              </div>
            </div>
            <!-- Stripe mounts here -->
            <div ref="paymentElRef" />
          </div>

          <!-- Test card hint -->
          <div class="mb-6 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 px-4 py-3">
            <p class="text-xs font-medium text-blue-800 dark:text-blue-200 flex items-center gap-1.5">
              <UIcon name="heroicons:information-circle" class="size-4 shrink-0" />
              {{ t('checkout.testModeHint') }}
            </p>
          </div>

          <div class="flex gap-3">
            <UButton color="neutral" variant="outline" :disabled="paying" @click="step = 'shipping'">
              {{ t('common.back') }}
            </UButton>
            <UButton
              class="flex-1"
              size="lg"
              :loading="paying || !stripeReady"
              icon="heroicons:lock-closed"
              @click="pay"
            >
              {{ t('checkout.pay', { amount: formatPrice(cartStore.total) }) }}
            </UButton>
          </div>
        </VCard>

      </div>

      <!-- ── Right column: Order summary ────────────────────────────────────── -->
      <div class="space-y-4">
        <VCard padding="md">
          <h2 class="font-semibold text-zinc-900 dark:text-white mb-4">{{ t('checkout.orderSummary') }}</h2>

          <ul class="divide-y divide-zinc-100 dark:divide-zinc-800 mb-4">
            <li v-for="item in cartStore.items" :key="item.id" class="flex items-center gap-3 py-3 first:pt-0">
              <div class="size-12 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 relative">
                <img v-if="item.image" :src="item.image" :alt="item.title" class="size-full object-cover" />
                <UIcon v-else name="heroicons:photo" class="size-full p-3 text-zinc-400" />
                <span class="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-zinc-600 text-white text-[10px] font-bold">
                  {{ item.quantity }}
                </span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-zinc-900 dark:text-white truncate">{{ item.title }}</p>
              </div>
              <p class="text-sm font-semibold text-zinc-900 dark:text-white shrink-0">
                {{ formatPrice(item.price * item.quantity) }}
              </p>
            </li>
          </ul>

          <div class="space-y-2 text-sm border-t border-zinc-100 dark:border-zinc-800 pt-4">
            <div class="flex justify-between text-zinc-600 dark:text-zinc-400">
              <span>{{ t('checkout.subtotal') }}</span>
              <span>{{ formatPrice(cartStore.subtotal) }}</span>
            </div>
            <div v-if="cartStore.discount > 0" class="flex justify-between text-green-600 dark:text-green-400">
              <span>
                {{ t('checkout.discount') }}
                <span v-if="cartStore.couponCode" class="font-mono text-xs">({{ cartStore.couponCode }})</span>
              </span>
              <span>-{{ formatPrice(cartStore.discount) }}</span>
            </div>
            <div class="flex justify-between text-zinc-600 dark:text-zinc-400">
              <span>{{ t('checkout.shipping') }}</span>
              <span class="text-green-600 dark:text-green-400">{{ t('checkout.free') }}</span>
            </div>
            <USeparator class="my-1" />
            <div class="flex justify-between font-bold text-zinc-900 dark:text-white text-base">
              <span>{{ t('checkout.total') }}</span>
              <span>{{ formatPrice(cartStore.total) }}</span>
            </div>
          </div>
        </VCard>

        <div class="flex items-center justify-center gap-5 text-xs text-zinc-400">
          <span class="flex items-center gap-1.5">
            <UIcon name="heroicons:lock-closed" class="size-3.5" />
            {{ t('checkout.secure') }}
          </span>
          <span class="flex items-center gap-1.5">
            <UIcon name="heroicons:shield-check" class="size-3.5" />
            {{ t('checkout.ssl') }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
