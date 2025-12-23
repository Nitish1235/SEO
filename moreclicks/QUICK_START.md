# Quick Start Guide

Get your SEO Analyzer SaaS up and running in 5 minutes!

## Step 1: Install Dependencies

```bash
cd moreclicks
npm install
```

## Step 2: Set Up Environment Variables

Create `.env.local` file:

```bash
cp .env.example .env.local
```

Fill in the minimum required variables to get started:

```bash
# Database (use Supabase free tier)
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# Redis (use Upstash free tier)
UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token"

# DataForSEO (get from dataforseo.com)
DATAFORSEO_LOGIN="your-email@example.com"
DATAFORSEO_PASSWORD="your-api-token"

# Claude AI (get from anthropic.com)
ANTHROPIC_API_KEY="sk-ant-..."

# NextAuth (generate secret)
NEXTAUTH_SECRET="run: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (get from Google Cloud Console)
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Note:** You can skip Stripe setup for initial testing.

## Step 3: Set Up Database

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push
```

## Step 4: Generate NextAuth Secret

```bash
# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# On Mac/Linux
openssl rand -base64 32
```

Copy the output to `NEXTAUTH_SECRET` in `.env.local`.

## Step 5: Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## Step 6: Test the Application

1. **Sign In**
   - Click "Sign In"
   - Use Google OAuth
   - You'll be redirected to dashboard

2. **Test Website Analysis**
   - Go to Dashboard > Analyze
   - Enter a URL (e.g., `https://example.com`)
   - Click "Start Analysis"
   - Wait for results (10-30 seconds)

3. **Test Keyword Research**
   - Go to Dashboard > Keywords
   - Enter a keyword (e.g., `seo tools`)
   - Click "Research Keyword"
   - View results

## Troubleshooting

### Database Connection Error

- Verify `DATABASE_URL` is correct
- Check database is running
- Verify credentials

### Redis Connection Error

- Verify Upstash credentials
- Check Redis URL format
- Ensure Redis instance is active

### API Errors

- Verify DataForSEO credentials
- Check API quotas
- Verify Claude API key

### Authentication Error

- Verify Google OAuth credentials
- Check redirect URI: `http://localhost:3000/api/auth/callback/google`
- Verify `NEXTAUTH_SECRET` is set

## Next Steps

Once basic functionality works:

1. **Set Up Stripe** (for payments)
   - Create Stripe account
   - Create products
   - Add price IDs to `.env.local`

2. **Configure Webhooks**
   - Set up Stripe webhook endpoint
   - Configure webhook events

3. **Test Subscriptions**
   - Test checkout flow
   - Verify webhook handling

## Need Help?

- Check [SETUP.md](./SETUP.md) for detailed setup
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment
- Review error messages in console
- Check API documentation

## Production Deployment

Once everything works locally:

1. Push code to GitHub
2. Deploy to Vercel/Railway/etc.
3. Update environment variables
4. Update OAuth redirect URIs
5. Test production deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for details.

