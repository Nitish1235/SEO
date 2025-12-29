# Advanced SEO Analysis SaaS - Feature Documentation

## Overview

This document describes the advanced SEO analysis features that have been implemented, including new API integrations, endpoints, and enhanced data analysis capabilities.

## 🚀 New API Integrations

### 1. Serper.dev Integration
**Service:** `src/lib/services/serper.ts`

- **Purpose:** Fetch Google SERP results and top 10 rankings
- **Features:**
  - Get SERP results for keywords
  - Check ranking positions for specific URLs
  - Extract People Also Ask questions
  - Get related searches and answer boxes
  - Support for location and language parameters

**Environment Variable:**
```bash
SERPER_API_KEY=your_serper_api_key
```

### 2. Scrape.do Integration
**Service:** `src/lib/services/scrapedo.ts`

- **Purpose:** Scrape competitor content for detailed analysis
- **Features:**
  - Extract title, meta descriptions, headings (H1-H6)
  - Get word count and reading time
  - Extract images and links
  - Analyze content structure
  - Batch processing with rate limiting

**Environment Variable:**
```bash
SCRAPEDO_API_KEY=your_scrapedo_api_key
```

### 3. LemonSqueezy Integration
**Service:** `src/lib/services/lemonsqueezy.ts`

- **Purpose:** Payment processing and subscription management
- **Features:**
  - Create/get customers
  - Generate checkout URLs
  - Webhook signature verification
  - Subscription status management

**Environment Variables:**
```bash
LEMONSQUEEZY_API_KEY=your_api_key
LEMONSQUEEZY_STORE_ID=your_store_id
LEMONSQUEEZY_WEBHOOK_SECRET=your_webhook_secret
LEMONSQUEEZY_VARIANT_BASIC=variant_id_for_basic_plan
LEMONSQUEEZY_VARIANT_PRO=variant_id_for_pro_plan
LEMONSQUEEZY_VARIANT_AGENCY=variant_id_for_agency_plan
```

## 📊 New Core Features

### 1. SERP Tracker Endpoint
**Route:** `POST /api/serp-tracker`  
**Route:** `GET /api/serp-tracker`  
**Route:** `GET /api/serp-tracker/[id]`

**Purpose:** Track keyword rankings over time

**Features:**
- Track rankings for keywords with optional target URL
- Historical ranking data with timestamps
- Best/worst ranking tracking
- Ranking change detection
- Combines DataForSEO and Serper.dev data
- Location and language support

**Request Body:**
```json
{
  "keyword": "seo tools",
  "targetUrl": "https://example.com" (optional),
  "location": "us" (optional, default: "us"),
  "language": "en" (optional, default: "en")
}
```

**Response:**
```json
{
  "id": "tracking_id",
  "keyword": "seo tools",
  "currentRanking": 5,
  "previousRanking": 8,
  "bestRanking": 3,
  "worstRanking": 12,
  "rankingChange": 3,
  "rankings": [...],
  "serpData": {
    "top10": [...],
    "peopleAlsoAsk": [...],
    "relatedSearches": [...]
  }
}
```

### 2. Content Optimizer Endpoint
**Route:** `POST /api/content-optimizer`

**Purpose:** Analyze and optimize content with AI suggestions

**Features:**
- Analyze content metrics (word count, headings, keyword density)
- Compare with competitor content (if URL provided)
- Generate AI-powered optimization suggestions
- Provide optimized content version
- Calculate improvement scores

**Request Body:**
```json
{
  "url": "https://example.com/article" (optional),
  "content": "Your content here...",
  "targetKeyword": "seo optimization" (optional)
}
```

**Response:**
```json
{
  "id": "optimization_id",
  "originalMetrics": {
    "wordCount": 1200,
    "headings": { "h1": 1, "h2": 5, "h3": 8 },
    "keywordDensity": 1.5,
    "readingTime": 6
  },
  "suggestions": {
    "title": "Suggested title",
    "metaDescription": "Suggested meta",
    "headings": ["H2 suggestion 1", "H2 suggestion 2"],
    "keywordOptimization": [...],
    "contentStructure": [...]
  },
  "improvements": {
    "wordCount": { "current": 1200, "recommended": 1500, "score": 80 },
    "overallScore": 75
  },
  "optimizedContent": "..." (if requested)
}
```

### 3. SEO Audit Endpoint
**Route:** `POST /api/seo-audit`

**Purpose:** Comprehensive technical SEO audit

**Features:**
- Technical SEO analysis (HTTPS, mobile-friendly, robots.txt, etc.)
- On-page SEO analysis (title, meta, headings, images, content)
- Off-page SEO analysis (backlinks, domain authority)
- Performance analysis (page speed, image optimization)
- AI-generated recommendations
- Prioritized action items

**Request Body:**
```json
{
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "id": "audit_id",
  "scores": {
    "technical": 85,
    "onPage": 78,
    "offPage": 75,
    "performance": 82,
    "overall": 80
  },
  "issues": {
    "technical": { "checks": {...}, "issues": [...] },
    "onPage": { "checks": {...}, "issues": [...] },
    "offPage": { "checks": {...}, "issues": [...] },
    "performance": { "checks": {...}, "issues": [...] }
  },
  "recommendations": {
    "summary": "...",
    "technical": [...],
    "onPage": [...],
    "offPage": [...],
    "performance": [...]
  },
  "priorityActions": [...]
}
```


## 💳 LemonSqueezy Payment Integration

### Customer Endpoint
**Route:** `POST /api/lemonsqueezy/customer`

Creates or retrieves a LemonSqueezy customer for the authenticated user.

### Checkout Endpoint
**Route:** `POST /api/lemonsqueezy/checkout`

**Request Body:**
```json
{
  "variantId": "variant_id",
  "customPrice": 29.99 (optional)
}
```

**Response:**
```json
{
  "checkoutUrl": "https://lemonsqueezy.com/checkout/...",
  "checkoutId": "checkout_id"
}
```

### Webhook Endpoint
**Route:** `POST /api/lemonsqueezy/webhook`

Handles LemonSqueezy webhook events:
- `subscription_created`
- `subscription_updated`
- `subscription_payment_success`
- `subscription_cancelled`
- `subscription_expired`

### Status Endpoint
**Route:** `GET /api/lemonsqueezy/status`

Returns current subscription status and customer portal URL.

## 🔄 Enhanced Existing Endpoints

### Keyword Research (`/api/keywords/research`)
**Enhancements:**
- Now uses both DataForSEO and Serper.dev for comprehensive SERP data
- Better People Also Ask extraction
- Enhanced featured snippet detection
- More complete related searches

### Competitor Analysis (`/api/competitors/find-from-keyword`)
**Enhancements:**
- Uses Scrape.do for detailed content scraping
- Combines DataForSEO and Serper.dev SERP data
- Enhanced competitor metrics (reading time, detailed headings)
- AI-generated insights and recommendations
- Content gap analysis

## 📊 Database Schema Updates

New models added to `prisma/schema.prisma`:

1. **SERPTracking** - Tracks keyword rankings over time
2. **ContentOptimization** - Stores content optimization analyses
4. **SEOAudit** - Stores comprehensive SEO audit results

Updated models:
- **User** - Added `lemonSqueezyCustomerId`
- **Subscription** - Added LemonSqueezy fields and new usage limits

## 🎯 Advanced Metrics & AI Analysis

All endpoints now provide:

1. **Metrics-Based Analysis:**
   - Comprehensive data collection from multiple sources
   - Statistical analysis and comparisons
   - Opportunity scoring
   - Trend analysis

2. **AI-Powered Insights:**
   - Strategic recommendations using Claude AI
   - Content optimization suggestions
   - Prioritized action items
   - Competitive intelligence

3. **Data Fusion:**
   - Combines data from DataForSEO, Serper.dev, and Scrape.do
   - Cross-validates results for accuracy
   - Provides comprehensive insights

## 📝 Environment Variables

Add these to your `.env.local`:

```bash
# Serper.dev
SERPER_API_KEY=your_serper_api_key

# Scrape.do
SCRAPEDO_API_KEY=your_scrapedo_api_key

# LemonSqueezy
LEMONSQUEEZY_API_KEY=your_lemonsqueezy_api_key
LEMONSQUEEZY_STORE_ID=your_store_id
LEMONSQUEEZY_WEBHOOK_SECRET=your_webhook_secret
LEMONSQUEEZY_VARIANT_BASIC=variant_id
LEMONSQUEEZY_VARIANT_PRO=variant_id
LEMONSQUEEZY_VARIANT_AGENCY=variant_id
```

## 🚀 Usage Examples

### Track Keyword Rankings
```bash
curl -X POST http://localhost:3000/api/serp-tracker \
  -H "Content-Type: application/json" \
  -d '{
    "keyword": "seo tools",
    "targetUrl": "https://example.com",
    "location": "us"
  }'
```

### Optimize Content
```bash
curl -X POST http://localhost:3000/api/content-optimizer \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Your content here...",
    "targetKeyword": "seo optimization"
  }'
```

### Run SEO Audit
```bash
curl -X POST http://localhost:3000/api/seo-audit \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com"
  }'
```


## 🔧 Next Steps

1. **Database Migration:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

2. **Set up LemonSqueezy:**
   - Create products and variants in LemonSqueezy dashboard
   - Configure webhook URL: `https://yourdomain.com/api/lemonsqueezy/webhook`
   - Add variant IDs to environment variables

3. **Test Endpoints:**
   - Test all new endpoints with sample data
   - Verify API integrations
   - Check error handling

4. **Frontend Integration:**
   - Create UI components for new features
   - Add forms for SERP tracking, content optimization
   - Display audit results

## 📚 Additional Resources

- [DataForSEO API Documentation](https://docs.dataforseo.com/)
- [Serper.dev Documentation](https://serper.dev/docs)
- [Scrape.do Documentation](https://scrape.do/docs)
- [LemonSqueezy API Documentation](https://docs.lemonsqueezy.com/)
- [Claude API Documentation](https://docs.anthropic.com/)

