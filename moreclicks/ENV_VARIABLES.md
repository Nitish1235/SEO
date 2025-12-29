# Environment Variables Guide

This document lists all environment variables required for the SEO Analyzer SaaS application.

## Quick Setup

1. Copy the template below to `.env.local` in the project root
2. Fill in your actual values
3. Never commit `.env.local` to version control (it's already in `.gitignore`)

## Required Environment Variables

### Database Configuration

```bash
# PostgreSQL connection string
# Get from Supabase: Project Settings > Database > Connection string
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
```

### Redis Configuration (Upstash)

```bash
# Get from Upstash Dashboard: https://console.upstash.com/
UPSTASH_REDIS_REST_URL="https://your-redis-instance.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-redis-rest-token"
```

### DataForSEO API (Keywords)

```bash
# Get from: https://dataforseo.com/
# Login: Your DataForSEO account email
# Password: Your API token (not your account password)
DATAFORSEO_LOGIN="your_email@example.com"
DATAFORSEO_PASSWORD="your_api_token"
```

### Serper.dev API (SERP Data)

```bash
# Get from: https://serper.dev/
# Free tier: 2,500 searches/month
SERPER_API_KEY="your_serper_api_key"
```

### Scrape.do API (Web Scraping)

```bash
# Get from: https://scrape.do/
# Free tier: 1,000 requests/month
SCRAPEDO_API_KEY="your_scrapedo_api_key"
```

### Claude AI (Anthropic)

```bash
# Get from: https://console.anthropic.com/
# Used for AI-powered SEO insights and content briefs
ANTHROPIC_API_KEY="sk-ant-api03-..."
```

### Stripe (Payment Processing)

```bash
# Get from: https://dashboard.stripe.com/
# Test keys for development, Live keys for production
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Stripe Price IDs (create products in Stripe dashboard)
# Optional: Can be set in code if not provided
STRIPE_PRICE_BASIC="price_..."
STRIPE_PRICE_PRO="price_..."
STRIPE_PRICE_AGENCY="price_..."
```

### NextAuth.js (Authentication)

```bash
# Generate secret: openssl rand -base64 32
# Or on Windows PowerShell:
# [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
NEXTAUTH_SECRET="your-generated-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

### Google OAuth (Authentication)

```bash
# Get from: https://console.cloud.google.com/
# 1. Create OAuth 2.0 Client ID
# 2. Add authorized redirect URI: http://localhost:3000/api/auth/callback/google
# 3. Copy Client ID and Client Secret
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### Application Configuration

```bash
# Public URL of your application
# Development: http://localhost:3000
# Production: https://yourdomain.com
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Optional Environment Variables

### Lemonsqueezy (Alternative Payment)

```bash
# Get from: https://app.lemonsqueezy.com/settings/api
# Optional: If using Lemonsqueezy instead of Stripe
LEMONSQUEEZY_API_KEY="your_lemonsqueezy_api_key"
LEMONSQUEEZY_STORE_ID="your_store_id"
LEMONSQUEEZY_WEBHOOK_SECRET="your_webhook_secret"
```

## Complete .env.local Template

```bash
# ============================================
# Database Configuration
# ============================================
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"

# ============================================
# Redis Configuration (Upstash)
# ============================================
UPSTASH_REDIS_REST_URL="https://your-redis-instance.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-redis-rest-token"

# ============================================
# DataForSEO API
# ============================================
DATAFORSEO_LOGIN="your_email@example.com"
DATAFORSEO_PASSWORD="your_api_token"

# ============================================
# Serper.dev API
# ============================================
SERPER_API_KEY="your_serper_api_key"

# ============================================
# Scrape.do API
# ============================================
SCRAPEDO_API_KEY="your_scrapedo_api_key"

# ============================================
# Claude AI (Anthropic)
# ============================================
ANTHROPIC_API_KEY="sk-ant-api03-..."

# ============================================
# Stripe (Payment Processing)
# ============================================
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_BASIC="price_..."
STRIPE_PRICE_PRO="price_..."
STRIPE_PRICE_AGENCY="price_..."

# ============================================
# Lemonsqueezy (Alternative Payment) - Optional
# ============================================
LEMONSQUEEZY_API_KEY="your_lemonsqueezy_api_key"
LEMONSQUEEZY_STORE_ID="your_store_id"
LEMONSQUEEZY_WEBHOOK_SECRET="your_webhook_secret"

# ============================================
# NextAuth.js
# ============================================
NEXTAUTH_SECRET="your-generated-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# ============================================
# Google OAuth
# ============================================
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# ============================================
# Application Configuration
# ============================================
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

## How to Get API Keys

### 1. Database (Supabase)
- Sign up at https://supabase.com/
- Create a new project
- Go to Project Settings > Database
- Copy the connection string

### 2. Redis (Upstash)
- Sign up at https://upstash.com/
- Create a Redis database
- Copy the REST URL and token from the dashboard

### 3. DataForSEO
- Sign up at https://dataforseo.com/
- Go to API Dashboard
- Copy your login email and API token

### 4. Serper.dev
- Sign up at https://serper.dev/
- Go to API Keys section
- Copy your API key

### 5. Scrape.do
- Sign up at https://scrape.do/
- Go to API Keys section
- Copy your API key

### 6. Claude AI (Anthropic)
- Sign up at https://console.anthropic.com/
- Go to API Keys
- Create a new API key

### 7. Stripe
- Sign up at https://stripe.com/
- Go to Developers > API keys
- Copy test keys for development
- Create products and prices in dashboard

### 8. Google OAuth
- Go to https://console.cloud.google.com/
- Create a new project
- Enable Google+ API
- Create OAuth 2.0 credentials
- Add redirect URI: `http://localhost:3000/api/auth/callback/google`

### 9. NextAuth Secret
Generate a random secret:
```bash
# Mac/Linux
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

## Production vs Development

### Development (.env.local)
- Use test API keys
- Use local database
- `NEXTAUTH_URL="http://localhost:3000"`
- `NEXT_PUBLIC_APP_URL="http://localhost:3000"`

### Production
- Use live API keys
- Use production database
- `NEXTAUTH_URL="https://yourdomain.com"`
- `NEXT_PUBLIC_APP_URL="https://yourdomain.com"`
- Set `NODE_ENV="production"`

## Security Notes

1. **Never commit `.env.local`** - It's already in `.gitignore`
2. **Use different keys for development and production**
3. **Rotate API keys regularly**
4. **Use environment-specific secrets**
5. **Don't share API keys in chat or email**

## Troubleshooting

### Missing Environment Variables
If you see errors about missing environment variables:
1. Check that `.env.local` exists in the project root
2. Verify all required variables are set
3. Restart your development server after adding variables
4. Check for typos in variable names

### API Key Errors
- Verify the API key is correct
- Check if the API key has expired
- Ensure you're using the right environment (test vs live)
- Check API rate limits and quotas

