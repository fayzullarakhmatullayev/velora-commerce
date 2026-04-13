// ─────────────────────────────────────────────────────────────────────────────
// POST /api/checkout/intent
// Creates a Stripe PaymentIntent and returns the client_secret.
// Body: { amount: number (cents), currency?: string, orderId?: string }
// ─────────────────────────────────────────────────────────────────────────────
import Stripe from 'stripe'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  if (!config.stripeSecretKey) {
    throw createError({ statusCode: 500, message: 'Stripe is not configured' })
  }

  const body = await readBody<{ amount: number; currency?: string; metadata?: Record<string, string> }>(event)

  if (!body.amount || body.amount < 50) {
    throw createError({ statusCode: 400, message: 'Invalid amount (minimum 50 cents)' })
  }

  const stripe = new Stripe(config.stripeSecretKey)

  const intent = await stripe.paymentIntents.create({
    amount: Math.round(body.amount),
    currency: body.currency ?? 'usd',
    // Explicitly allow only card — avoids warnings for unactivated methods
    // (Link, Cash App, Apple Pay). Add more here once activated in the dashboard.
    payment_method_types: ['card'],
    metadata: body.metadata ?? {},
  })

  return { clientSecret: intent.client_secret, intentId: intent.id }
})
