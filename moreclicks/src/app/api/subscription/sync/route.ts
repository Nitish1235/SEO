import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DodoPaymentsService } from '@/lib/services/dodopayments'
import { PLANS } from '@/lib/config/pricing'

/**
 * Manual sync endpoint to check and update subscription status
 * Useful if webhook didn't fire or failed
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { subscription: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // If user already has a subscription, update limits based on plan
    if (user.subscription) {
      const plan = user.subscription.plan as 'basic' | 'pro' | 'agency'
      const planConfig = PLANS[plan]
      
      if (planConfig) {
        const limits = planConfig.limits
        await prisma.subscription.update({
          where: { id: user.subscription.id },
          data: {
            status: 'active',
            analysesLimit: limits.analyses,
            keywordsLimit: limits.keywords,
            competitorsLimit: limits.competitors,
          },
        })
        
        return NextResponse.json({
          success: true,
          message: `Subscription limits updated for ${plan} plan`,
          plan,
          limits: {
            analyses: limits.analyses,
            keywords: limits.keywords,
            competitors: limits.competitors,
          },
        })
      }
    }

    // If user has Dodo Payments customer ID but no subscription, try to find from payments
    if (user.dodoCustomerId) {
      try {
        // List payments for this customer to find recent successful payments
        const paymentsResponse = await DodoPaymentsService.listPayments({
          customer_id: user.dodoCustomerId,
          limit: 10,
        })

        // Handle different response structures
        const payments = Array.isArray(paymentsResponse) 
          ? paymentsResponse 
          : paymentsResponse.data || paymentsResponse.payments || []

        console.log(`Found ${payments.length} payments for customer ${user.dodoCustomerId}`)

        // Find the most recent successful payment
        const successfulPayment = payments.find(
          (p: any) => p.status === 'completed' || p.status === 'succeeded' || p.status === 'paid'
        )

        if (successfulPayment) {
          console.log('Successful payment found:', successfulPayment)
          
          // Try multiple ways to get product_id
          const productId = successfulPayment.product_id || 
                           successfulPayment.productId ||
                           successfulPayment.line_items?.[0]?.product_id ||
                           successfulPayment.line_items?.[0]?.productId ||
                           successfulPayment.product_cart?.[0]?.product_id ||
                           successfulPayment.product_cart?.[0]?.productId ||
                           user.subscription?.dodoPlanId

          console.log('Product ID:', productId)

          // Determine plan from product_id
          let plan: 'basic' | 'pro' | 'agency' | null = null
          if (productId === process.env.DODO_PLAN_BASIC) {
            plan = 'basic'
          } else if (productId === process.env.DODO_PLAN_PRO) {
            plan = 'pro'
          } else if (productId === process.env.DODO_PLAN_AGENCY) {
            plan = 'agency'
          } else {
            // If product_id doesn't match any configured plan, we can't determine the plan
            console.warn(`Product ID ${productId} doesn't match any configured plan`)
            return NextResponse.json({
              success: false,
              message: `Product ID from payment doesn't match any configured plan. Please check your payment or contact support.`,
              debug: {
                productId,
                configuredPlans: {
                  basic: !!process.env.DODO_PLAN_BASIC,
                  pro: !!process.env.DODO_PLAN_PRO,
                  agency: !!process.env.DODO_PLAN_AGENCY,
                },
              },
            })
          }

          if (!plan) {
            return NextResponse.json({
              success: false,
              message: 'Could not determine plan from payment.',
            })
          }

          const planConfig = PLANS[plan]
          
          if (!planConfig) {
            return NextResponse.json({
              success: false,
              message: `Invalid plan: ${plan}`,
            })
          }

          const limits = planConfig.limits
          const subscriptionId = successfulPayment.subscription_id || successfulPayment.subscriptionId

          if (user.subscription) {
            // Update existing subscription
            await prisma.subscription.update({
              where: { id: user.subscription.id },
              data: {
                dodoSubscriptionId: subscriptionId || user.subscription.dodoSubscriptionId,
                dodoPlanId: productId || user.subscription.dodoPlanId,
                plan,
                status: 'active',
                analysesLimit: limits.analyses,
                keywordsLimit: limits.keywords,
                competitorsLimit: limits.competitors,
              },
            })
            return NextResponse.json({
              success: true,
              message: `Subscription updated to ${plan} plan`,
              plan,
              limits: {
                analyses: limits.analyses,
                keywords: limits.keywords,
                competitors: limits.competitors,
              },
            })
          } else {
            // Create new subscription
            await prisma.subscription.create({
              data: {
                userId: user.id,
                dodoSubscriptionId: subscriptionId,
                dodoPlanId: productId,
                dodoCurrentPeriodEnd: successfulPayment.current_period_end 
                  ? new Date(successfulPayment.current_period_end)
                  : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                plan,
                status: 'active',
                analysesLimit: limits.analyses,
                keywordsLimit: limits.keywords,
                competitorsLimit: limits.competitors,
                analysesUsed: 0,
                keywordsUsed: 0,
                competitorsUsed: 0,
              },
            })
            return NextResponse.json({
              success: true,
              message: `Subscription created for ${plan} plan`,
              plan,
              limits: {
                analyses: limits.analyses,
                keywords: limits.keywords,
                competitors: limits.competitors,
              },
            })
          }
        } else {
          return NextResponse.json({
            success: false,
            message: 'No successful payment found for this customer',
            debug: {
              paymentsFound: payments.length,
              customerId: user.dodoCustomerId,
            },
          })
        }
      } catch (error: any) {
        console.error('Sync error:', error)
        return NextResponse.json({
          success: false,
          error: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: false,
      message: 'No Dodo Payments customer ID found',
    })
  } catch (error: any) {
    console.error('Sync subscription error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

