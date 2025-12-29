const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function clearUserData() {
  try {
    // Find user by name (case-insensitive)
    const userName = 'harry jam'
    
    console.log(`Searching for user: "${userName}"...`)
    
    // Try to find user by name (case-insensitive)
    const user = await prisma.user.findFirst({
      where: {
        name: {
          contains: userName,
          mode: 'insensitive',
        },
      },
      include: {
        sessions: true,
        subscription: true,
      },
    })

    if (!user) {
      // Try by email if name doesn't match
      const userByEmail = await prisma.user.findFirst({
        where: {
          OR: [
            { email: { contains: 'harry', mode: 'insensitive' } },
            { email: { contains: 'jam', mode: 'insensitive' } },
          ],
        },
        include: {
          sessions: true,
          subscription: true,
        },
      })

      if (!userByEmail) {
        console.log('❌ User not found. Available users:')
        const allUsers = await prisma.user.findMany({
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        })
        allUsers.forEach(u => {
          console.log(`  - ${u.name || 'No name'} (${u.email}) - ID: ${u.id}`)
        })
        return
      }

      console.log(`✅ Found user: ${userByEmail.name || 'No name'} (${userByEmail.email})`)
      console.log(`   User ID: ${userByEmail.id}`)
      console.log(`   Sessions: ${userByEmail.sessions.length}`)
      console.log(`   Has Subscription: ${userByEmail.subscription ? 'Yes' : 'No'}`)

      // Delete all sessions
      if (userByEmail.sessions.length > 0) {
        const deletedSessions = await prisma.session.deleteMany({
          where: {
            userId: userByEmail.id,
          },
        })
        console.log(`✅ Deleted ${deletedSessions.count} session(s)`)
      } else {
        console.log('ℹ️  No sessions to delete')
      }

      // Reset subscription usage if exists
      if (userByEmail.subscription) {
        const updated = await prisma.subscription.update({
          where: {
            userId: userByEmail.id,
          },
          data: {
            analysesUsed: 0,
            keywordsUsed: 0,
            competitorsUsed: 0,
            serpTrackingsUsed: 0,
            contentOptimizationsUsed: 0,
            seoAuditsUsed: 0,
          },
        })
        console.log('✅ Reset subscription usage counters:')
        console.log(`   - Analyses: ${updated.analysesUsed}/${updated.analysesLimit}`)
        console.log(`   - Keywords: ${updated.keywordsUsed}/${updated.keywordsLimit}`)
        console.log(`   - Competitors: ${updated.competitorsUsed}/${updated.competitorsLimit}`)
        console.log(`   - SERP Trackings: ${updated.serpTrackingsUsed}/${updated.serpTrackingsLimit}`)
        console.log(`   - Content Optimizations: ${updated.contentOptimizationsUsed}/${updated.contentOptimizationsLimit}`)
        console.log(`   - SEO Audits: ${updated.seoAuditsUsed}/${updated.seoAuditsLimit}`)
      } else {
        console.log('ℹ️  No subscription found - user is on free tier')
      }

      console.log('\n✅ User data cleared successfully!')
      return
    }

    console.log(`✅ Found user: ${user.name || 'No name'} (${user.email})`)
    console.log(`   User ID: ${user.id}`)
    console.log(`   Sessions: ${user.sessions.length}`)
    console.log(`   Has Subscription: ${user.subscription ? 'Yes' : 'No'}`)

    // Delete all sessions
    if (user.sessions.length > 0) {
      const deletedSessions = await prisma.session.deleteMany({
        where: {
          userId: user.id,
        },
      })
      console.log(`✅ Deleted ${deletedSessions.count} session(s)`)
    } else {
      console.log('ℹ️  No sessions to delete')
    }

    // Reset subscription usage if exists
    if (user.subscription) {
      const updated = await prisma.subscription.update({
        where: {
          userId: user.id,
        },
        data: {
          analysesUsed: 0,
          keywordsUsed: 0,
          competitorsUsed: 0,
          serpTrackingsUsed: 0,
          contentOptimizationsUsed: 0,
          seoAuditsUsed: 0,
        },
      })
      console.log('✅ Reset subscription usage counters:')
      console.log(`   - Analyses: ${updated.analysesUsed}/${updated.analysesLimit}`)
      console.log(`   - Keywords: ${updated.keywordsUsed}/${updated.keywordsLimit}`)
      console.log(`   - Competitors: ${updated.competitorsUsed}/${updated.competitorsLimit}`)
      console.log(`   - SERP Trackings: ${updated.serpTrackingsUsed}/${updated.serpTrackingsLimit}`)
      console.log(`   - Content Optimizations: ${updated.contentOptimizationsUsed}/${updated.contentOptimizationsLimit}`)
      console.log(`   - SEO Audits: ${updated.seoAuditsUsed}/${updated.seoAuditsLimit}`)
    } else {
      console.log('ℹ️  No subscription found - user is on free tier')
    }

    console.log('\n✅ User data cleared successfully!')
  } catch (error) {
    console.error('❌ Error clearing user data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

clearUserData()
  .then(() => {
    console.log('\n✅ Script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })

