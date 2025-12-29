# Deployment Guide

## Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database migrations run
- [ ] Stripe products created
- [ ] Google OAuth configured
- [ ] All features tested locally
- [ ] Error handling verified
- [ ] Performance tested

## Deployment Options

### Option 1: Vercel (Recommended)

Vercel is the easiest option for Next.js applications.

#### Steps:

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Select the `moreclicks` folder

3. **Configure Environment Variables**
   - In Vercel project settings
   - Go to "Environment Variables"
   - Add all variables from `.env.local`
   - Set for Production, Preview, and Development

4. **Configure Build Settings**
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live!

6. **Update OAuth Redirect URIs**
   - Update Google OAuth redirect URI to: `https://your-domain.vercel.app/api/auth/callback/google`
   - Update Stripe webhook URL to: `https://your-domain.vercel.app/api/webhooks/stripe`

### Option 2: Railway

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Add PostgreSQL**
   - Click "New" → "Database" → "PostgreSQL"
   - Copy connection string to `DATABASE_URL`

4. **Add Redis**
   - Click "New" → "Database" → "Redis"
   - Copy connection details

5. **Configure Environment Variables**
   - Add all required variables
   - Set `NEXTAUTH_URL` to your Railway domain
   - Set `NEXT_PUBLIC_APP_URL` to your Railway domain

6. **Deploy**
   - Railway auto-deploys on push
   - Check logs for any issues

### Option 3: DigitalOcean App Platform

1. **Create App**
   - Go to DigitalOcean App Platform
   - Create new app from GitHub

2. **Configure Services**
   - Add PostgreSQL database
   - Add Redis (or use Upstash)
   - Configure build settings

3. **Set Environment Variables**
   - Add all required variables
   - Configure build and run commands

4. **Deploy**
   - DigitalOcean will build and deploy
   - Update OAuth redirect URIs

### Option 4: Google Cloud Platform (GCP)

This guide will help you deploy your SEO Analyzer application on Google Cloud Platform using the free $300 credits. We'll use Cloud Run (serverless), Cloud SQL (PostgreSQL), and Cloud Memorystore (Redis).

**Domain Setup:** This guide includes specific instructions for connecting your `moreclicks.io` domain from Hostinger to Cloud Run.

#### Prerequisites

- Google Cloud account with $300 free credits
- GitHub account (to store your code)
- Domain: `moreclicks.io` on Hostinger (you have this!)
- Basic command line knowledge

#### Step 1: Create a Google Cloud Project

1. **Go to Google Cloud Console**
   - Visit [console.cloud.google.com](https://console.cloud.google.com)
   - Sign in with your Google account

2. **Create a New Project**
   - Click the project dropdown at the top
   - Click "New Project"
   - Project name: `seo-analyzer` (or your preferred name)
   - Click "Create"
   - Wait for project creation (30 seconds)

3. **Enable Billing**
   - Go to "Billing" in the left menu
   - Link your billing account (use the $300 free credits)
   - Select your project and enable billing

#### Step 2: Enable Required APIs

1. **Enable Cloud Run API**
   - Go to "APIs & Services" → "Library"
   - Search for "Cloud Run API"
   - Click "Enable"

2. **Enable Cloud SQL Admin API**
   - Search for "Cloud SQL Admin API"
   - Click "Enable"

3. **Enable Cloud Memorystore API**
   - Search for "Cloud Memorystore for Redis API"
   - Click "Enable"

4. **Enable Cloud Build API**
   - Search for "Cloud Build API"
   - Click "Enable"

5. **Enable Secret Manager API** (for storing environment variables securely)
   - Search for "Secret Manager API"
   - Click "Enable"

#### Step 3: Install Google Cloud SDK

1. **Download Google Cloud SDK**
   - Visit [cloud.google.com/sdk/docs/install](https://cloud.google.com/sdk/docs/install)
   - Download for your operating system (Windows/Mac/Linux)

2. **Install and Initialize**
   ```bash
   # After installation, initialize
   gcloud init
   
   # Select your project
   # Choose your default region (e.g., us-central1)
   # Login with your Google account
   ```

3. **Verify Installation**
   ```bash
   gcloud --version
   ```

#### Step 4: Create Cloud SQL PostgreSQL Database

1. **Create Database Instance**
   ```bash
   gcloud sql instances create seo-analyzer-db \
     --database-version=POSTGRES_15 \
     --tier=db-f1-micro \
     --region=us-central1 \
     --root-password=YOUR_SECURE_PASSWORD
   ```
   ⚠️ **Replace `YOUR_SECURE_PASSWORD` with a strong password** (save this!)

2. **Create Database**
   ```bash
   gcloud sql databases create seo_analyzer \
     --instance=seo-analyzer-db
   ```

3. **Get Connection String**
   ```bash
   gcloud sql instances describe seo-analyzer-db
   ```
   - Note the connection name (format: `PROJECT_ID:REGION:INSTANCE_NAME`)
   - Your `DATABASE_URL` will be: `postgresql://postgres:YOUR_PASSWORD@/seo_analyzer?host=/cloudsql/PROJECT_ID:REGION:INSTANCE_NAME`

#### Step 5: Create Cloud Memorystore Redis Instance

1. **Create Redis Instance**
   ```bash
   gcloud redis instances create seo-analyzer-redis \
     --size=1 \
     --region=us-central1 \
     --redis-version=redis_7_0
   ```
   - This creates a 1GB Redis instance (sufficient for caching)
   - Wait 5-10 minutes for creation

2. **Get Redis Connection Details**
   ```bash
   gcloud redis instances describe seo-analyzer-redis --region=us-central1
   ```
   - Note the `host` IP address
   - Your `REDIS_URL` will be: `redis://HOST_IP:6379`

#### Step 6: Prepare Your Application

1. **Create Dockerfile** (if not exists)
   Create `Dockerfile` in the `moreclicks` folder:
   ```dockerfile
   FROM node:18-alpine AS base
   
   # Install dependencies only when needed
   FROM base AS deps
   RUN apk add --no-cache libc6-compat
   WORKDIR /app
   
   COPY package.json package-lock.json* ./
   RUN npm ci
   
   # Rebuild the source code only when needed
   FROM base AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .
   
   # Generate Prisma Client
   RUN npx prisma generate
   
   # Build Next.js
   ENV NEXT_TELEMETRY_DISABLED 1
   RUN npm run build
   
   # Production image
   FROM base AS runner
   WORKDIR /app
   
   ENV NODE_ENV production
   ENV NEXT_TELEMETRY_DISABLED 1
   
   RUN addgroup --system --gid 1001 nodejs
   RUN adduser --system --uid 1001 nextjs
   
   COPY --from=builder /app/public ./public
   COPY --from=builder /app/.next/standalone ./
   COPY --from=builder /app/.next/static ./.next/static
   COPY --from=builder /app/prisma ./prisma
   COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
   
   USER nextjs
   
   EXPOSE 3000
   
   ENV PORT 3000
   ENV HOSTNAME "0.0.0.0"
   
   CMD ["node", "server.js"]
   ```

2. **Update next.config.js** for standalone output:
   ```javascript
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     output: 'standalone',
     // ... your existing config
   }
   
   module.exports = nextConfig
   ```

3. **Push Code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit for GCP deployment"
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

#### Step 7: Store Environment Variables in Secret Manager

1. **Create Secrets for Each Environment Variable**
   ```bash
   # Database URL
   echo -n "postgresql://postgres:PASSWORD@/seo_analyzer?host=/cloudsql/PROJECT_ID:REGION:INSTANCE_NAME" | \
     gcloud secrets create database-url --data-file=-
   
   # Redis URL
   echo -n "redis://REDIS_IP:6379" | \
     gcloud secrets create redis-url --data-file=-
   
   # NextAuth Secret
   echo -n "YOUR_NEXTAUTH_SECRET" | \
     gcloud secrets create nextauth-secret --data-file=-
   
   # Add other secrets similarly
   # Google OAuth
   gcloud secrets create google-client-id --data-file=- <<< "YOUR_GOOGLE_CLIENT_ID"
   gcloud secrets create google-client-secret --data-file=- <<< "YOUR_GOOGLE_CLIENT_SECRET"
   
   # API Keys
   gcloud secrets create anthropic-api-key --data-file=- <<< "YOUR_ANTHROPIC_API_KEY"
   gcloud secrets create dataforseo-login --data-file=- <<< "YOUR_DATAFORSEO_LOGIN"
   gcloud secrets create dataforseo-password --data-file=- <<< "YOUR_DATAFORSEO_PASSWORD"
   gcloud secrets create serper-api-key --data-file=- <<< "YOUR_SERPER_API_KEY"
   gcloud secrets create scrapedo-api-key --data-file=- <<< "YOUR_SCRAPEDO_API_KEY"
   
   # Payment Providers
   gcloud secrets create dodo-api-key --data-file=- <<< "YOUR_DODO_API_KEY"
   gcloud secrets create dodo-webhook-secret --data-file=- <<< "YOUR_DODO_WEBHOOK_SECRET"
   ```

2. **Grant Cloud Run Access to Secrets**
   ```bash
   # Get your service account email (will be created with Cloud Run)
   SERVICE_ACCOUNT="PROJECT_NUMBER-compute@developer.gserviceaccount.com"
   
   # Grant access to all secrets
   gcloud secrets add-iam-policy-binding database-url \
     --member="serviceAccount:${SERVICE_ACCOUNT}" \
     --role="roles/secretmanager.secretAccessor"
   # Repeat for all secrets
   ```

#### Step 8: Deploy to Cloud Run

1. **Build and Deploy Using Cloud Build**
   ```bash
   # Set your project
   gcloud config set project YOUR_PROJECT_ID
   
   # Submit build
   gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/seo-analyzer
   ```

2. **Deploy to Cloud Run**
   ```bash
   gcloud run deploy seo-analyzer \
     --image gcr.io/YOUR_PROJECT_ID/seo-analyzer \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --add-cloudsql-instances PROJECT_ID:REGION:INSTANCE_NAME \
     --set-env-vars "NODE_ENV=production" \
     --set-secrets "DATABASE_URL=database-url:latest,REDIS_URL=redis-url:latest,NEXTAUTH_SECRET=nextauth-secret:latest,GOOGLE_CLIENT_ID=google-client-id:latest,GOOGLE_CLIENT_SECRET=google-client-secret:latest,ANTHROPIC_API_KEY=anthropic-api-key:latest,DATAFORSEO_LOGIN=dataforseo-login:latest,DATAFORSEO_PASSWORD=dataforseo-password:latest,SERPER_API_KEY=serper-api-key:latest,SCRAPEDO_API_KEY=scrapedo-api-key:latest,DODO_API_KEY=dodo-api-key:latest,DODO_WEBHOOK_SECRET=dodo-webhook-secret:latest" \
     --memory 2Gi \
     --cpu 2 \
     --timeout 300 \
     --max-instances 10
   ```

3. **Set Additional Environment Variables**
   After deployment, update environment variables:
   ```bash
   # First, use the Cloud Run URL (we'll update to custom domain later)
   SERVICE_URL=$(gcloud run services describe seo-analyzer --region us-central1 --format 'value(status.url)')
   
   gcloud run services update seo-analyzer \
     --region us-central1 \
     --update-env-vars "NEXTAUTH_URL=${SERVICE_URL},NEXT_PUBLIC_APP_URL=${SERVICE_URL}"
   
   # After configuring custom domain (moreclicks.io), update again:
   # gcloud run services update seo-analyzer \
   #   --region us-central1 \
   #   --update-env-vars "NEXTAUTH_URL=https://moreclicks.io,NEXT_PUBLIC_APP_URL=https://moreclicks.io"
   ```

#### Step 9: Run Database Migrations

1. **Connect to Cloud Run Service**
   ```bash
   # Get service URL
   gcloud run services describe seo-analyzer --region us-central1 --format 'value(status.url)'
   ```

2. **Run Prisma Migrations**
   ```bash
   # Option 1: Using Cloud Run Jobs (recommended)
   gcloud run jobs create prisma-migrate \
     --image gcr.io/YOUR_PROJECT_ID/seo-analyzer \
     --region us-central1 \
     --add-cloudsql-instances PROJECT_ID:REGION:INSTANCE_NAME \
     --set-secrets "DATABASE_URL=database-url:latest" \
     --command "npx" \
     --args "prisma,migrate,deploy"
   
   # Execute the job
   gcloud run jobs execute prisma-migrate --region us-central1
   
   # Option 2: Using Cloud Shell
   # Connect to Cloud Shell and run:
   # npx prisma migrate deploy
   ```

#### Step 10: Configure Custom Domain (moreclicks.io from Hostinger)

Since you have `moreclicks.io` domain on Hostinger, let's connect it to your Cloud Run service.

1. **Get Your Cloud Run Service URL**
   ```bash
   # Get the service URL
   gcloud run services describe seo-analyzer --region us-central1 --format 'value(status.url)'
   # Example output: https://seo-analyzer-xxxxx-uc.a.run.app
   ```

2. **Map Domain in Cloud Run**
   - Go to [Cloud Run Console](https://console.cloud.google.com/run)
   - Click on your `seo-analyzer` service
   - Click on the "MANAGE CUSTOM DOMAINS" tab
   - Click "ADD MAPPING"
   - Enter: `moreclicks.io` (or `www.moreclicks.io` if you want www)
   - Click "CONTINUE"
   - Cloud Run will provide you with DNS records to add

3. **Configure DNS in Hostinger**

   **Option A: Using Hostinger DNS (Recommended)**
   
   a. **Log in to Hostinger**
      - Go to [hpanel.hostinger.com](https://hpanel.hostinger.com)
      - Navigate to your `moreclicks.io` domain
      - Go to "DNS / Name Servers" section
   
   b. **Add DNS Records**
      
      Cloud Run will show you records like:
      ```
      Type: A
      Name: @ (or leave blank)
      Value: 216.239.32.21
      
      Type: A
      Name: @ (or leave blank)
      Value: 216.239.34.21
      
      Type: A
      Name: @ (or leave blank)
      Value: 216.239.36.21
      
      Type: A
      Name: @ (or leave blank)
      Value: 216.239.38.21
      ```
      
      **In Hostinger:**
      - Click "Add Record"
      - Type: `A`
      - Name: `@` (or leave blank for root domain)
      - Points to: `216.239.32.21` (use the IP from Cloud Run)
      - TTL: `3600` (or default)
      - Click "Add Record"
      - Repeat for all 4 A records provided by Cloud Run
   
   c. **For www subdomain (optional)**
      - Add a CNAME record:
        - Type: `CNAME`
        - Name: `www`
        - Points to: `ghs.googlehosted.com`
        - TTL: `3600`
   
   d. **Save Changes**
      - Click "Save" or "Update DNS"
      - Wait 5-10 minutes for DNS propagation

   **Option B: Using Google Cloud DNS (Advanced)**
   
   If you want to manage DNS in GCP:
   ```bash
   # Create DNS zone
   gcloud dns managed-zones create moreclicks-zone \
     --dns-name="moreclicks.io" \
     --description="DNS zone for moreclicks.io"
   
   # Get name servers
   gcloud dns managed-zones describe moreclicks-zone
   
   # Update name servers in Hostinger to point to Google Cloud DNS
   ```

4. **Verify DNS Propagation**
   ```bash
   # Check if DNS records are propagated
   dig moreclicks.io
   nslookup moreclicks.io
   
   # Or use online tools:
   # - https://dnschecker.org
   # - https://www.whatsmydns.net
   ```

5. **Wait for SSL Certificate**
   - Cloud Run automatically provisions SSL certificates via Let's Encrypt
   - This usually takes 10-30 minutes after DNS is configured
   - You can check status in Cloud Run → Custom Domains

6. **Update Environment Variables**
   ```bash
   # Update with your custom domain
   gcloud run services update seo-analyzer \
     --region us-central1 \
     --update-env-vars "NEXTAUTH_URL=https://moreclicks.io,NEXT_PUBLIC_APP_URL=https://moreclicks.io"
   ```

7. **Verify Domain is Working**
   - Visit `https://moreclicks.io` in your browser
   - You should see your application
   - Check that SSL certificate is valid (green lock icon)

8. **Update OAuth Redirect URIs**
   - Go to [Google Cloud Console → APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials)
   - Edit your OAuth 2.0 Client
   - Update authorized redirect URI to: `https://moreclicks.io/api/auth/callback/google`
   - Save changes

9. **Update Webhook URLs**
   - **Dodo Payments**: Update webhook URL to `https://moreclicks.io/api/dodopayments/webhook`
   - **LemonSqueezy** (if using): Update webhook URL to `https://moreclicks.io/api/lemonsqueezy/webhook`
   - **Stripe** (if using): Update webhook URL to `https://moreclicks.io/api/webhooks/stripe`

10. **Test Everything**
    - Visit `https://moreclicks.io`
    - Test sign-in/sign-up
    - Test all features
    - Verify webhooks are receiving events

#### Step 11: Update OAuth and Webhook URLs

**Important:** After configuring your custom domain `moreclicks.io` (Step 10), update these URLs:

1. **Google OAuth**
   - Go to [Google Cloud Console → APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials)
   - Edit your OAuth 2.0 Client
   - Add authorized redirect URI: `https://moreclicks.io/api/auth/callback/google`
   - Remove the old Cloud Run URL if you had added it

2. **Dodo Payments Webhook**
   - Go to Dodo Payments Dashboard → Webhooks
   - Update webhook URL: `https://moreclicks.io/api/dodopayments/webhook`

3. **LemonSqueezy Webhook** (if using)
   - Update webhook URL in LemonSqueezy dashboard: `https://moreclicks.io/api/lemonsqueezy/webhook`

4. **Stripe Webhook** (if using)
   - Go to Stripe Dashboard → Webhooks
   - Update webhook URL: `https://moreclicks.io/api/webhooks/stripe`

#### Step 12: Set Up Continuous Deployment (Optional)

1. **Create cloudbuild.yaml**
   ```yaml
   steps:
     - name: 'gcr.io/cloud-builders/docker'
       args: ['build', '-t', 'gcr.io/$PROJECT_ID/seo-analyzer', '.']
     - name: 'gcr.io/cloud-builders/docker'
       args: ['push', 'gcr.io/$PROJECT_ID/seo-analyzer']
     - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
       entrypoint: gcloud
       args:
         - 'run'
         - 'deploy'
         - 'seo-analyzer'
         - '--image'
         - 'gcr.io/$PROJECT_ID/seo-analyzer'
         - '--region'
         - 'us-central1'
         - '--platform'
         - 'managed'
   ```

2. **Connect GitHub Repository**
   - Go to Cloud Build → Triggers
   - Click "Create Trigger"
   - Connect your GitHub repository
   - Set trigger to run on push to `main` branch
   - Use the `cloudbuild.yaml` file

#### Step 13: Monitor and Optimize

1. **View Logs**
   ```bash
   gcloud run services logs read seo-analyzer --region us-central1
   ```

2. **Monitor Costs**
   - Go to "Billing" → "Reports"
   - Set up budget alerts (recommended: $50/month to start)

3. **Scale Settings**
   - Cloud Run auto-scales based on traffic
   - Adjust `--max-instances` if needed
   - Monitor CPU and memory usage

#### GCP Cost Estimation (Monthly)

With $300 free credits, you can run for several months:

- **Cloud Run**: ~$10-30/month (depending on traffic)
- **Cloud SQL (db-f1-micro)**: ~$7/month
- **Cloud Memorystore (1GB)**: ~$30/month
- **Cloud Build**: ~$5-10/month
- **Total**: ~$52-77/month

**Free Tier Includes:**
- Cloud Run: 2 million requests/month free
- Cloud SQL: No free tier (but db-f1-micro is cheap)
- Cloud Memorystore: No free tier

#### Troubleshooting

**Service Won't Start:**
```bash
# Check logs
gcloud run services logs read seo-analyzer --region us-central1 --limit 50

# Check service status
gcloud run services describe seo-analyzer --region us-central1
```

**Database Connection Issues:**
- Verify Cloud SQL instance is running
- Check connection name format
- Verify service account has Cloud SQL Client role

**Environment Variables Not Loading:**
- Verify secrets exist: `gcloud secrets list`
- Check IAM permissions on secrets
- Verify secret names in deployment command

**Build Fails:**
- Check Dockerfile syntax
- Verify all dependencies in package.json
- Review Cloud Build logs

#### Useful Commands

```bash
# View service URL
gcloud run services describe seo-analyzer --region us-central1 --format 'value(status.url)'

# Update environment variables
gcloud run services update seo-analyzer --region us-central1 --update-env-vars "KEY=VALUE"

# View service logs
gcloud run services logs read seo-analyzer --region us-central1 --follow

# Delete service (if needed)
gcloud run services delete seo-analyzer --region us-central1

# Scale service
gcloud run services update seo-analyzer --region us-central1 --min-instances 1 --max-instances 10
```

#### Next Steps

1. ✅ Test all features on deployed service
2. ✅ Set up monitoring and alerts
3. ✅ Configure custom domain
4. ✅ Set up automated backups for database
5. ✅ Review and optimize costs

### Option 5: Self-Hosted (Docker)

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npx prisma generate
   RUN npm run build
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. **Create docker-compose.yml**
   ```yaml
   version: '3.8'
   services:
     app:
       build: .
       ports:
         - "3000:3000"
       environment:
         - DATABASE_URL=${DATABASE_URL}
         - NEXTAUTH_URL=${NEXTAUTH_URL}
         # ... other env vars
       depends_on:
         - postgres
         - redis
     
     postgres:
       image: postgres:15
       environment:
         POSTGRES_PASSWORD: ${DB_PASSWORD}
       volumes:
         - postgres_data:/var/lib/postgresql/data
     
     redis:
       image: redis:7-alpine
   ```

3. **Deploy**
   ```bash
   docker-compose up -d
   ```

## Post-Deployment Steps

### 1. Update OAuth Redirect URIs

**Google OAuth:**
- Go to Google Cloud Console
- Update authorized redirect URI to: `https://your-domain.com/api/auth/callback/google`

**Stripe:**
- Go to Stripe Dashboard → Webhooks
- Update webhook URL to: `https://your-domain.com/api/webhooks/stripe`
- Verify webhook secret matches

### 2. Run Database Migrations

```bash
# If using Prisma migrations
npx prisma migrate deploy

# Or if using db push
npx prisma db push
```

### 3. Verify Environment Variables

Check that all environment variables are set:
- Database connection
- Redis connection
- API keys
- OAuth credentials
- Stripe keys

### 4. Test All Features

- [ ] Sign in/up works
- [ ] Website analysis works
- [ ] Keyword research works
- [ ] Competitor analysis works
- [ ] Subscription checkout works
- [ ] Webhooks receive events
- [ ] Usage limits enforced

### 5. Set Up Monitoring

**Recommended:**
- Vercel Analytics (if using Vercel)
- Sentry for error tracking
- LogRocket for session replay
- Uptime monitoring (UptimeRobot, Pingdom)

### 6. Set Up Backups

**Database:**
- Enable automatic backups
- Set retention period (7-30 days)

**Redis:**
- Configure persistence
- Set up backups if needed

## Environment-Specific Configuration

### Production

```bash
NEXTAUTH_URL=https://moreclicks.io
NEXT_PUBLIC_APP_URL=https://moreclicks.io
NODE_ENV=production
```

### Staging

```bash
NEXTAUTH_URL=https://staging.your-domain.com
NEXT_PUBLIC_APP_URL=https://staging.your-domain.com
NODE_ENV=production
```

## Troubleshooting

### Build Fails

- Check Node.js version (18+)
- Verify all dependencies installed
- Check for TypeScript errors
- Review build logs

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Check database is accessible
- Verify SSL settings if required
- Check firewall rules

### API Errors

- Verify API keys are correct
- Check API quotas/limits
- Review error logs
- Test API endpoints directly

### Authentication Issues

- Verify OAuth redirect URIs
- Check `NEXTAUTH_SECRET` is set
- Verify `NEXTAUTH_URL` matches domain
- Check session configuration

## Performance Optimization

### Enable Caching

- Redis caching is already configured
- Verify Redis connection
- Monitor cache hit rates

### Database Optimization

- Add indexes for frequently queried fields
- Use connection pooling
- Monitor query performance

### CDN Configuration

- Vercel automatically provides CDN
- For other platforms, configure CDN
- Enable static asset caching

## Security Checklist

- [ ] All environment variables secured
- [ ] HTTPS enabled
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (Prisma handles this)
- [ ] XSS protection
- [ ] CSRF protection (NextAuth handles this)

## Monitoring & Alerts

Set up alerts for:
- High error rates
- Slow response times
- API quota limits
- Database connection issues
- Payment processing errors

## Rollback Plan

1. Keep previous deployment version
2. Have database backup ready
3. Document rollback procedure
4. Test rollback process

## Success Criteria

Your deployment is successful when:
- ✅ All pages load correctly
- ✅ Authentication works
- ✅ All API endpoints respond
- ✅ Database queries work
- ✅ Stripe webhooks receive events
- ✅ No console errors
- ✅ Performance is acceptable

## Support

If you encounter issues:
1. Check deployment logs
2. Review error messages
3. Verify environment variables
4. Test locally first
5. Check platform-specific documentation

