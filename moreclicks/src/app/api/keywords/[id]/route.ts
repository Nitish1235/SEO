import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const keywordResearch = await prisma.keywordResearch.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!keywordResearch) {
      return NextResponse.json({ error: 'Keyword research not found' }, { status: 404 })
    }

    return NextResponse.json(keywordResearch)
  } catch (error: any) {
    console.error('Get keyword research error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

