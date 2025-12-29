import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { PLANS } from '@/lib/config/pricing'

const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-12-15.clover',
  })
}

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    const stripe = getStripe()
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        const planId = session.metadata?.planId

        if (userId && planId) {
          const plan = PLANS[planId as keyof typeof PLANS]
          if (plan) {
            // Create or update subscription
            await prisma.subscription.upsert({
              where: { userId },
              create: {
                userId,
                stripeSubscriptionId: session.subscription as string,
                stripePriceId: session.metadata?.priceId || '',
                stripeCurrentPeriodEnd: new Date(session.expires_at! * 1000),
                plan: planId,
                status: 'active',
                analysesLimit: plan.limits.analyses,
                keywordsLimit: plan.limits.keywords,
                competitorsLimit: plan.limits.competitors,
                analysesUsed: 0,
                keywordsUsed: 0,
                competitorsUsed: 0,
              },
              update: {
                stripeSubscriptionId: session.subscription as string,
                stripePriceId: session.metadata?.priceId || '',
                stripeCurrentPeriodEnd: new Date(session.expires_at! * 1000),
                plan: planId,
                status: 'active',
                analysesLimit: plan.limits.analyses,
                keywordsLimit: plan.limits.keywords,
                competitorsLimit: plan.limits.competitors,
              },
            })
          }
        }
        break
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const user = await prisma.user.findUnique({
          where: { stripeCustomerId: customerId },
        })

        if (user) {
          const sub = subscription as any
          if (sub.status === 'active') {
            await prisma.subscription.update({
              where: { userId: user.id },
              data: {
                stripeCurrentPeriodEnd: new Date((sub.current_period_end || 0) * 1000),
                status: 'active',
              },
            })
          } else {
            await prisma.subscription.update({
              where: { userId: user.id },
              data: {
                status: sub.status || 'canceled',
              },
            })
          }
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed', message: error.message },
      { status: 500 }
    )
  }
}

