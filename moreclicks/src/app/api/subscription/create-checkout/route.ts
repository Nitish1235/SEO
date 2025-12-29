import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DodoPaymentsService } from '@/lib/services/dodopayments'
import { LemonSqueezyService } from '@/lib/services/lemonsqueezy'

// Dodo Payments plan IDs for each plan (primary)
const DODO_PLAN_IDS: Record<string, string> = {
  basic: process.env.DODO_PLAN_BASIC!,
  pro: process.env.DODO_PLAN_PRO!,
  agency: process.env.DODO_PLAN_AGENCY!,
}

// LemonSqueezy variant IDs for each plan (fallback)
const PLAN_VARIANT_IDS: Record<string, string> = {
  basic: process.env.LEMONSQUEEZY_VARIANT_BASIC!,
  pro: process.env.LEMONSQUEEZY_VARIANT_PRO!,
  agency: process.env.LEMONSQUEEZY_VARIANT_AGENCY!,
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { planId } = body

    if (!planId || (!DODO_PLAN_IDS[planId] && !PLAN_VARIANT_IDS[planId])) {
      return NextResponse.json({ error: 'Invalid plan ID' }, { status: 400 })
    }

    // Prioritize Dodo Payments (primary) - only if plan ID is configured
    if (DODO_PLAN_IDS[planId] && process.env.DODO_API_KEY) {
      try {
        const planId_dodo = DODO_PLAN_IDS[planId]

        // Validate plan ID exists
        if (!planId_dodo || planId_dodo === '') {
          console.warn(`Dodo Payments plan ID not configured for plan: ${planId}`)
          throw new Error(`Dodo Payments plan ID not configured for plan: ${planId}`)
        }

        const baseUrl = process.env.DODO_API_BASE_URL || 'https://test.dodopayments.com'
        console.log('[Checkout] Attempting Dodo Payments checkout:', {
          planId,
          dodoPlanId: planId_dodo,
          baseUrl,
          hasApiKey: !!process.env.DODO_API_KEY,
          apiKeyLength: process.env.DODO_API_KEY?.length || 0,
          userEmail: user.email,
          hasExistingCustomer: !!user.dodoCustomerId,
        })

        // Create checkout with customer info
        // Option 1: Use existing customer if available
        // Option 2: Create customer inline in checkout (simpler, recommended)
        const checkout = await DodoPaymentsService.createCheckout(
          planId_dodo,
          {
            customerId: user.dodoCustomerId || undefined, // Attach existing if available
            customerEmail: user.dodoCustomerId ? undefined : user.email, // Create inline if new
            customerName: user.dodoCustomerId ? undefined : (user.name || undefined),
            returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true`,
            metadata: {
              user_id: user.id,
              plan: planId,
            },
            // Always include credit and debit as fallback per Dodo Payments docs
            allowedPaymentMethodTypes: ['credit', 'debit'],
          }
        )

        // If customer was created inline, we'll get customer_id from webhook
        // For now, we can optionally fetch it, but webhook is source of truth

        return NextResponse.json({
          url: checkout.checkout_url,
          checkoutUrl: checkout.checkout_url
        })
      } catch (error: any) {
        // If Dodo Payments fails (API unavailable, network error, etc.), fall back to LemonSqueezy
        console.error('Dodo Payments checkout failed, falling back to LemonSqueezy:', error.message)
        // Fall through to LemonSqueezy fallback below
      }
    }

    // Fallback to LemonSqueezy if Dodo Payments not configured or failed
    if (!PLAN_VARIANT_IDS[planId]) {
      return NextResponse.json(
        { error: 'No payment provider configured for this plan' },
        { status: 500 }
      )
    }

    const variantId = PLAN_VARIANT_IDS[planId]

    // Check if LemonSqueezy is configured
    if (!process.env.LEMONSQUEEZY_API_KEY) {
      return NextResponse.json(
        { error: 'LemonSqueezy API key not configured' },
        { status: 500 }
      )
    }

    console.log('[Checkout] Falling back to LemonSqueezy:', {
      planId,
      variantId,
      userEmail: user.email,
    })

    // Get or create LemonSqueezy customer
    let customerId = user.lemonSqueezyCustomerId
    if (!customerId) {
      const customer = await LemonSqueezyService.createCustomer(
        user.email,
        user.name || undefined
      )
      customerId = customer.id.toString()

      await prisma.user.update({
        where: { id: user.id },
        data: {
          lemonSqueezyCustomerId: customerId,
        },
      })
    }

    // Create LemonSqueezy checkout
    const checkout = await LemonSqueezyService.createCheckout(
      variantId,
      customerId
    )

    return NextResponse.json({
      url: checkout.attributes.url,
      checkoutUrl: checkout.attributes.url
    })
  } catch (error: any) {
    console.error('Create checkout error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

