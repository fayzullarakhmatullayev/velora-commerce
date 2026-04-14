// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin/sync-stripe
// Fetch a PaymentIntent from Stripe and update the matching order's status.
// Called from the admin order detail page when a manual sync is needed
// (e.g. a refund issued in the Stripe dashboard before the webhook fired).
// ─────────────────────────────────────────────────────────────────────────────
import Stripe from 'stripe'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  if (!config.stripeSecretKey) {
    throw createError({ statusCode: 500, message: 'Stripe not configured' })
  }

  const body = await readBody(event)
  const paymentIntentId = body?.paymentIntentId as string | undefined

  if (!paymentIntentId) {
    throw createError({ statusCode: 400, message: 'paymentIntentId is required' })
  }

  const stripe = new Stripe(config.stripeSecretKey)

  // Retrieve PI with its charges so we can detect refunds
  const intent = await stripe.paymentIntents.retrieve(paymentIntentId, {
    expand: ['charges.data'],
  })

  const charge = (intent as any).charges?.data?.[0] as Stripe.Charge | undefined

  // Derive canonical statuses from Stripe state
  let payment_status: string
  let order_status: string

  if (charge && charge.amount_refunded > 0) {
    // Full or partial refund — treat as refunded
    payment_status = 'refunded'
    order_status = 'refunded'
  } else if (intent.status === 'succeeded') {
    payment_status = 'paid'
    order_status = 'paid'
  } else if (intent.status === 'canceled') {
    payment_status = 'failed'
    order_status = 'cancelled'
  } else if (intent.status === 'processing') {
    payment_status = 'unpaid'
    order_status = 'pending'
  } else {
    payment_status = 'failed'
    order_status = 'cancelled'
  }

  const supabase = useServerSupabase()

  const { error } = await (supabase.from('orders') as any)
    .update({
      payment_status,
      status: order_status,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_payment_intent_id', paymentIntentId)

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return { payment_status, order_status }
})
