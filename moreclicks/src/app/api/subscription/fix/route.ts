import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PLANS } from '@/lib/config/pricing'

/**
 * Simple fix endpoint - directly updates subscription limits based on stored plan
 * Use this if sync doesn't work
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const { plan: requestedPlan } = body

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { subscription: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Determine plan - only proceed if we have a plan to work with
    let plan: 'basic' | 'pro' | 'agency' | null = null
    
    if (requestedPlan && ['basic', 'pro', 'agency'].includes(requestedPlan)) {
      plan = requestedPlan as 'basic' | 'pro' | 'agency'
    } else if (user.subscription?.plan && ['basic', 'pro', 'agency'].includes(user.subscription.plan)) {
      plan = user.subscription.plan as 'basic' | 'pro' | 'agency'
    }

    // If no plan can be determined and no subscription exists, return error
    if (!plan && !user.subscription) {
      return NextResponse.json({
        success: false,
        error: 'No subscription found',
        message: 'Please subscribe to a plan first. Cannot create subscription without a plan.',
      }, { status: 400 })
    }

    // If no plan determined but subscription exists, return error
    if (!plan && user.subscription) {
      return NextResponse.json({
        success: false,
        error: 'Invalid plan',
        message: 'Could not determine plan. Please specify a plan or ensure your subscription has a valid plan.',
      }, { status: 400 })
    }

    // At this point, plan must be defined
    if (!plan) {
      return NextResponse.json({
        success: false,
        error: 'Invalid state',
        message: 'Unable to determine plan.',
      }, { status: 400 })
    }

    const planConfig = PLANS[plan]

    if (!planConfig) {
      return NextResponse.json({
        error: 'Invalid plan',
        message: `Plan "${plan}" not found`,
      }, { status: 400 })
    }

    const limits = planConfig.limits

    if (user.subscription) {
      // Update existing subscription
      await prisma.subscription.update({
        where: { id: user.subscription.id },
        data: {
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
  } catch (error: any) {
    console.error('Fix subscription error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}

