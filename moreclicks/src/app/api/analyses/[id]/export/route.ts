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

    const analysis = await prisma.analysis.findFirst({
      where: {
        id: id,
        userId: user.id,
      },
    })

    if (!analysis) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 })
    }

    // Return as downloadable JSON
    return new NextResponse(JSON.stringify(analysis, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="analysis-${id}.json"`,
      },
    })
  } catch (error: any) {
    console.error('Export analysis error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

