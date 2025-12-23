export const PLANS = {
  basic: {
    name: 'Basic',
    price: 29,
    features: [
      '10 analyses/month',
      '25 keywords/month',
      '3 competitors/month',
      'AI-powered insights',
      'Email support',
    ],
    limits: {
      analyses: 10,
      keywords: 25,
      competitors: 3,
    },
  },
  pro: {
    name: 'Pro',
    price: 49,
    features: [
      '25 analyses/month',
      '100 keywords/month',
      '10 competitors/month',
      'AI-powered insights',
      'Content briefs',
      'Priority support',
    ],
    limits: {
      analyses: 25,
      keywords: 100,
      competitors: 10,
    },
  },
  agency: {
    name: 'Advanced',
    price: 129,
    features: [
      '75 analyses/month',
      '500 keywords/month',
      '50 competitors/month',
      'AI-powered insights',
      'Content briefs',
      'Competitor monitoring',
      'Priority support',
    ],
    limits: {
      analyses: 75,
      keywords: 500,
      competitors: 50,
    },
  },
} as const

export type PlanType = keyof typeof PLANS

