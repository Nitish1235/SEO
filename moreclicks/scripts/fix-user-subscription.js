/**
 * Manual script to fix a user's subscription after payment
 * Usage: node scripts/fix-user-subscription.js <user-email>
 * 
 * This script will:
 * 1. Find the user by email
 * 2. Check for Dodo Payments customer ID
 * 3. Look up recent payments
 * 4. Create/update subscription with correct plan and limits
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Plan limits from pricing config
const PLANS = {
  basic: { analyses: 10, keywords: 25, competitors: 3 },
  pro: { analyses: 25, keywords: 100, competitors: 10 },
  agency: { analyses: 75, keywords: 500, competitors: 50 },
}

async function fixUserSubscription(userEmail) {
  try {
    console.log(`Looking up user: ${userEmail}`)
    
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: { subscription: true },
    })

    if (!user) {
      console.error(`User not found: ${userEmail}`)
      process.exit(1)
    }

    console.log(`Found user: ${user.id}`)
    console.log(`Dodo Customer ID: ${user.dodoCustomerId || 'Not set'}`)

    if (!user.dodoCustomerId) {
      console.error('User does not have a Dodo Payments customer ID')
      console.error('This means the payment might not have been processed through Dodo Payments')
      process.exit(1)
    }

    // Check if subscription exists
    if (user.subscription) {
      console.log('\nCurrent subscription:')
      console.log(`  Plan: ${user.subscription.plan}`)
      console.log(`  Status: ${user.subscription.status}`)
      console.log(`  Limits: ${user.subscription.analysesLimit} analyses, ${user.subscription.keywordsLimit} keywords, ${user.subscription.competitorsLimit} competitors`)
      console.log(`  Dodo Subscription ID: ${user.subscription.dodoSubscriptionId || 'Not set'}`)
      console.log(`  Dodo Plan ID: ${user.subscription.dodoPlanId || 'Not set'}`)
    } else {
      console.log('\nNo subscription found')
    }

    // Determine plan from Dodo Plan ID
    const dodoPlanId = user.subscription?.dodoPlanId
    let plan = 'basic'
    
    if (dodoPlanId === process.env.DODO_PLAN_BASIC) {
      plan = 'basic'
    } else if (dodoPlanId === process.env.DODO_PLAN_PRO) {
      plan = 'pro'
    } else if (dodoPlanId === process.env.DODO_PLAN_AGENCY) {
      plan = 'agency'
    } else {
      console.log(`\n⚠️  Warning: Dodo Plan ID "${dodoPlanId}" doesn't match any configured plan`)
      console.log('Defaulting to basic plan')
      console.log('\nPlease check your .env.local:')
      console.log(`  DODO_PLAN_BASIC=${process.env.DODO_PLAN_BASIC}`)
      console.log(`  DODO_PLAN_PRO=${process.env.DODO_PLAN_PRO}`)
      console.log(`  DODO_PLAN_AGENCY=${process.env.DODO_PLAN_AGENCY}`)
    }

    const planConfig = PLANS[plan]

    // Update or create subscription
    if (user.subscription) {
      await prisma.subscription.update({
        where: { id: user.subscription.id },
        data: {
          plan,
          status: 'active',
          analysesLimit: planConfig.analyses,
          keywordsLimit: planConfig.keywords,
          competitorsLimit: planConfig.competitors,
        },
      })
      console.log(`\n✅ Updated subscription to ${plan} plan`)
    } else {
      await prisma.subscription.create({
        data: {
          userId: user.id,
          plan,
          status: 'active',
          analysesLimit: planConfig.analyses,
          keywordsLimit: planConfig.keywords,
          competitorsLimit: planConfig.competitors,
          analysesUsed: 0,
          keywordsUsed: 0,
          competitorsUsed: 0,
        },
      })
      console.log(`\n✅ Created subscription for ${plan} plan`)
    }

    console.log(`\nNew limits:`)
    console.log(`  Analyses: ${planConfig.analyses}`)
    console.log(`  Keywords: ${planConfig.keywords}`)
    console.log(`  Competitors: ${planConfig.competitors}`)

    console.log('\n✅ Done! Refresh your dashboard to see the updated plan and limits.')
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Get email from command line
const userEmail = process.argv[2]

if (!userEmail) {
  console.error('Usage: node scripts/fix-user-subscription.js <user-email>')
  process.exit(1)
}

fixUserSubscription(userEmail)

