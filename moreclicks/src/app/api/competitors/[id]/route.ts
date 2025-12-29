import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    const competitorAnalysis = await prisma.competitorAnalysis.findFirst({
      where: {
        id: id,
        userId: user.id,
      },
    })

    if (!competitorAnalysis) {
      return NextResponse.json({ error: 'Competitor analysis not found' }, { status: 404 })
    }

    return NextResponse.json(competitorAnalysis)
  } catch (error: any) {
    console.error('Get competitor analysis error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

