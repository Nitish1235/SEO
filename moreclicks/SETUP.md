# Setup Guide

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (Supabase free tier works)
- Redis instance (Upstash free tier works)
- DataForSEO API account
- Claude API key (Anthropic)
- Stripe account (for payments)
- Google OAuth credentials (for authentication)

## Step-by-Step Setup

### 1. Clone and Install

```bash
cd moreclicks
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"

# Redis (Upstash)
UPSTASH_REDIS_REST_URL="https://your-redis-url.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-redis-token"

# DataForSEO API
DATAFORSEO_LOGIN="your_email@example.com"
DATAFORSEO_PASSWORD="your_api_token"

# Claude API
ANTHROPIC_API_KEY="sk-ant-..."

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Pricing IDs (create products in Stripe dashboard)
STRIPE_PRICE_BASIC="price_..."
STRIPE_PRICE_PRO="price_..."
STRIPE_PRICE_AGENCY="price_..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate_with_openssl_rand_base64_32"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Generate NextAuth Secret

```bash
openssl rand -base64 32
```

### 4. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push
```

### 5. Stripe Setup

1. Create a Stripe account
2. Create three products in Stripe dashboard:
   - Basic Plan ($29/month)
   - Pro Plan ($49/month)
   - Agency Plan ($129/month)
3. Copy the Price IDs to your `.env.local`
4. Set up webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`
5. Add webhook events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

### 6. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Secret to `.env.local`

### 7. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see your application.

## Testing

### Test Website Analysis

1. Sign in with Google
2. Go to Dashboard > Analyze
3. Enter a URL (e.g., `https://example.com`)
4. Click "Start Analysis"
5. Wait for results (may take 10-30 seconds)

### Test Keyword Research

1. Go to Dashboard > Keywords
2. Enter a keyword (e.g., `seo tools`)
3. Click "Research Keyword"
4. View results with metrics and content brief

### Test Competitor Analysis

1. Go to Dashboard > Competitors
2. Enter a keyword and your website URL
3. Click "Analyze Competitors"
4. View comparison results

## Troubleshooting

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Ensure PostgreSQL is running
- Check database permissions

### Redis Connection Issues

- Verify Upstash credentials
- Check Redis URL format
- Ensure Redis instance is active

### DataForSEO API Issues

- Verify login and password are correct
- Check API quota/limits
- Review API response in console

### Stripe Webhook Issues

- Use Stripe CLI for local testing: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- Verify webhook secret matches
- Check webhook event types are configured

## Production Deployment

1. Set up production database
2. Configure production Redis
3. Update environment variables
4. Set up Stripe production keys
5. Configure production OAuth redirect URIs
6. Deploy to Vercel/Netlify/etc.

## Support

For issues or questions, check:
- DataForSEO API docs: https://docs.dataforseo.com/
- Claude API docs: https://docs.anthropic.com/
- Next.js docs: https://nextjs.org/docs

