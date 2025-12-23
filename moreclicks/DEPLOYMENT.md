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

### Option 4: Self-Hosted (Docker)

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
NEXTAUTH_URL=https://your-domain.com
NEXT_PUBLIC_APP_URL=https://your-domain.com
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

