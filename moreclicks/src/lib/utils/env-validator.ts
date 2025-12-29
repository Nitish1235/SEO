/**
 * Validates that all required environment variables are set
 * Call this at application startup
 */
export function validateEnvironment() {
  const required = [
    'DATABASE_URL',
    'UPSTASH_REDIS_REST_URL',
    'UPSTASH_REDIS_REST_TOKEN',
    'DATAFORSEO_LOGIN',
    'DATAFORSEO_PASSWORD',
    'SERPER_API_KEY',
    'SCRAPEDO_API_KEY',
    'ANTHROPIC_API_KEY',
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'NEXT_PUBLIC_APP_URL',
  ]

  const optional = [
    'STRIPE_PRICE_BASIC',
    'STRIPE_PRICE_PRO',
    'STRIPE_PRICE_AGENCY',
    'LEMONSQUEEZY_API_KEY',
    'LEMONSQUEEZY_STORE_ID',
    'LEMONSQUEEZY_WEBHOOK_SECRET',
    'DODO_API_KEY',
    'DODO_API_BASE_URL',
    'DODO_WEBHOOK_SECRET',
    'DODO_PLAN_BASIC',
    'DODO_PLAN_PRO',
    'DODO_PLAN_AGENCY',
    'DODO_CUSTOMER_PORTAL_URL',
  ]

  const missing: string[] = []
  const warnings: string[] = []

  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key)
    }
  }

  for (const key of optional) {
    if (!process.env[key]) {
      warnings.push(key)
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    )
  }

  if (warnings.length > 0 && process.env.NODE_ENV === 'production') {
    console.warn(
      `Missing optional environment variables: ${warnings.join(', ')}`
    )
  }

  return {
    valid: true,
    missing: [],
    warnings,
  }
}

// Validate on import in production
if (process.env.NODE_ENV === 'production') {
  try {
    validateEnvironment()
  } catch (error) {
    console.error('Environment validation failed:', error)
  }
}

