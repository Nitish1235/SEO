import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { LemonSqueezyService } from '@/lib/services/lemonsqueezy'
import { z } from 'zod'

const checkoutSchema = z.object({
  variantId: z.string().min(1),
  customPrice: z.number().optional(),
})

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
    const validation = checkoutSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { variantId, customPrice } = validation.data

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

    // Create checkout
    const checkout = await LemonSqueezyService.createCheckout(
      variantId,
      customerId,
      customPrice
    )

    return NextResponse.json({
      checkoutUrl: checkout.attributes.url,
      checkoutId: checkout.id,
    })
  } catch (error: any) {
    console.error('LemonSqueezy checkout creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout', message: error.message },
      { status: 500 }
    )
  }
}

