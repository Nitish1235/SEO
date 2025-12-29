import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { LemonSqueezyService } from '@/lib/services/lemonsqueezy'

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

    // Create or get LemonSqueezy customer
    const customer = await LemonSqueezyService.createCustomer(
      user.email,
      user.name || undefined
    )

    // Update user with LemonSqueezy customer ID
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lemonSqueezyCustomerId: customer.id.toString(),
      },
    })

    return NextResponse.json({
      customerId: customer.id,
      email: customer.attributes.email,
      name: customer.attributes.name,
    })
  } catch (error: any) {
    console.error('LemonSqueezy customer creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create customer', message: error.message },
      { status: 500 }
    )
  }
}

