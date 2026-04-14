// ─────────────────────────────────────────────────────────────────────────────
// POST /api/checkout/webhook
// Receives Stripe webhook events and updates order status.
// Set endpoint in Stripe Dashboard → Developers → Webhooks
// Listens for: payment_intent.succeeded, payment_intent.payment_failed
// ─────────────────────────────────────────────────────────────────────────────
import Stripe from 'stripe'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  if (!config.stripeSecretKey || !config.stripeWebhookSecret) {
    throw createError({ statusCode: 500, message: 'Stripe webhook not configured' })
  }

  const stripe = new Stripe(config.stripeSecretKey)

  const sig = getHeader(event, 'stripe-signature')
  const rawBody = await readRawBody(event)

  if (!sig || !rawBody) {
    throw createError({ statusCode: 400, message: 'Missing signature or body' })
  }

  let stripeEvent: Stripe.Event
  try {
    stripeEvent = stripe.webhooks.constructEvent(rawBody, sig, config.stripeWebhookSecret)
  } catch {
    throw createError({ statusCode: 400, message: 'Invalid webhook signature' })
  }

  const supabase = useServerSupabase()

  switch (stripeEvent.type) {
    case 'payment_intent.succeeded': {
      const intent = stripeEvent.data.object as Stripe.PaymentIntent
      // Mark any order with this intent as paid (handles async card flows)
      await supabase
        .from('orders')
        .update({ status: 'paid', payment_status: 'paid', updated_at: new Date().toISOString() })
        .eq('stripe_payment_intent_id', intent.id)
        .eq('payment_status', 'unpaid')
      break
    }

    case 'payment_intent.payment_failed': {
      const intent = stripeEvent.data.object as Stripe.PaymentIntent
      await supabase
        .from('orders')
        .update({ payment_status: 'failed', updated_at: new Date().toISOString() })
        .eq('stripe_payment_intent_id', intent.id)
      break
    }

    case 'charge.refunded': {
      const charge = stripeEvent.data.object as Stripe.Charge
      if (charge.payment_intent) {
        await supabase
          .from('orders')
          .update({
            status: 'refunded',
            payment_status: 'refunded',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_payment_intent_id', charge.payment_intent as string)
      }
      break
    }
  }

  return { received: true }
})
