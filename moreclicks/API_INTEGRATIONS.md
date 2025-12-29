# Complete API Integrations List

This document lists all external APIs used in the project, how they're integrated, and where they're used.

## 📡 External APIs Overview

| API Service | Purpose | Authentication | Base URL |
|------------|---------|---------------|----------|
| **DataForSEO** | Keyword metrics only | Basic Auth (Login/Password) | `https://api.dataforseo.com/v3` |
| **Serper.dev** | Google SERP results, rankings | API Key (Header) | `https://google.serper.dev` |
| **Scrape.do** | Web scraping, competitor content, on-page analysis | API Key (Query param) | `https://api.scrape.do` |
| **Claude AI (Anthropic)** | AI analysis, content recommendations | API Key (SDK) | SDK-based |
| **LemonSqueezy** | Payment processing, subscriptions | Bearer Token | `https://api.lemonsqueezy.com/v1` |

---

## 1. DataForSEO API

### Service Files
- `src/lib/services/dataforseo/keywords.ts` ✅ **ONLY THIS IS USED**
- ~~`src/lib/services/dataforseo/serp.ts`~~ ❌ **NOT USED - Replaced by Serper.dev**
- ~~`src/lib/services/dataforseo/onpage.ts`~~ ❌ **NOT USED - Replaced by Scrape.do**

### Authentication
```typescript
// Basic Auth with Base64 encoding
const credentials = Buffer.from(`${DATAFORSEO_LOGIN}:${DATAFORSEO_PASSWORD}`).toString('base64')
Authorization: `Basic ${credentials}`
```

### Environment Variables
```bash
DATAFORSEO_LOGIN=your_email@example.com
DATAFORSEO_PASSWORD=your_api_token
```

### API Endpoints Used

#### 1.1 Keyword Metrics API
**Endpoint:** `POST /dataforseo_labs/google/bulk_keyword_difficulty/live`  
**Endpoint:** `POST /dataforseo_labs/google/historical_search_volume/live`

**Used In:**
- `POST /api/keywords/research` - Get keyword metrics (volume, difficulty, CPC)
- `POST /api/serp-tracker` - Get keyword data for tracking

**What It Does:**
- Returns search volume, keyword difficulty, CPC, competition level
- Provides monthly search trends

**Example Usage:**
```typescript
const metrics = await DataForSEOKeywordsService.getMetrics(['seo tools'], 'us', 'en')
// Returns: { search_volume, keyword_difficulty, cpc, competition, monthly_searches }
```

#### 1.2 Keyword Suggestions API
**Endpoint:** `POST /dataforseo_labs/google/keyword_suggestions/live`

**Used In:**
- `POST /api/keywords/research` - Get keyword variations

**What It Does:**
- Returns long-tail keyword variations
- Provides related search suggestions

#### 1.3 Related Keywords API
**Endpoint:** `POST /dataforseo_labs/google/related_keywords/live`

**Used In:**
- `POST /api/keywords/research` - Get related keywords

**What It Does:**
- Returns semantically related keywords
- Provides keyword expansion opportunities

### Caching Strategy
- **Keyword metrics:** 24 hours TTL

---

## 2. Serper.dev API

### Service File
- `src/lib/services/serper.ts`

### Authentication
```typescript
'X-API-KEY': SERPER_API_KEY
```

### Environment Variable
```bash
SERPER_API_KEY=your_serper_api_key
```

### API Endpoint Used

#### 2.1 Google Search API
**Endpoint:** `POST /search`

**Used In:**
- `POST /api/keywords/research` - Get SERP results (complementary to DataForSEO)
- `POST /api/competitors/find-from-keyword` - Find competitors
- `POST /api/serp-tracker` - Track rankings

**What It Does:**
- Returns Google search results (organic, paid, featured snippets)
- Extracts People Also Ask questions
- Gets related searches
- Provides answer boxes
- Returns knowledge graph data
- Fast response time (1-2 seconds)

**Example Usage:**
```typescript
const serp = await SerperService.getSERP('seo tools', { location: 'us', num: 10 })
// Returns: { organic: [...], peopleAlsoAsk: [...], answerBox: {...}, relatedSearches: [...] }
```

**Methods:**
- `getSERP(keyword, options)` - Get full SERP results
- `getTop10Rankings(keyword, location)` - Get top 10 rankings only
- `checkRanking(keyword, url, location)` - Check if URL ranks for keyword

---

## 3. Scrape.do API

### Service File
- `src/lib/services/scrapedo.ts`

### Authentication
```typescript
// API key passed as query parameter
?token=${SCRAPEDO_API_KEY}&url=${encodeURIComponent(url)}
```

### Environment Variable
```bash
SCRAPEDO_API_KEY=your_scrapedo_api_key
```

### API Endpoint Used

#### 3.1 Web Scraping API
**Endpoint:** `GET /?token={api_key}&url={target_url}`

**Used In:**
- `POST /api/competitors/find-from-keyword` - Scrape competitor content
- `POST /api/content-optimizer` - Scrape competitor for comparison
- `POST /api/seo-audit` - Scrape page for detailed analysis

**What It Does:**
- Scrapes HTML content from any URL
- Extracts title, meta tags (description, OG tags)
- Gets all headings (H1-H6)
- Counts words and calculates reading time
- Extracts images with alt text
- Gets all links (internal/external)
- Parses structured data (Schema.org)

**Example Usage:**
```typescript
const content = await ScrapeDoService.getCompetitorContent('https://example.com')
// Returns: { title, metaDescription, h1, wordCount, headings: {...}, images, links }
```

**Methods:**
- `scrapeURL(url)` - Scrape single URL
- `scrapeMultipleURLs(urls)` - Scrape multiple URLs (with rate limiting)
- `getCompetitorContent(url)` - Get structured competitor data

**Rate Limiting:**
- Processes in batches of 5 URLs
- 1 second delay between batches

---

## 4. Claude AI (Anthropic) API

### Service File
- `src/lib/services/claude.ts`

### Authentication
```typescript
// Uses Anthropic SDK
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
```

### Environment Variable
```bash
ANTHROPIC_API_KEY=sk-ant-...
```

### API Usage

#### 4.1 Claude 3.5 Sonnet
**Model:** `claude-3-5-sonnet-20240620`

**Used In:**
- `POST /api/analyze` - Generate SEO insights
- `POST /api/keywords/research` - Generate content briefs
- `POST /api/competitors/find-from-keyword` - Generate competitor insights
- `POST /api/content-optimizer` - Generate content optimization suggestions
- `POST /api/seo-audit` - Generate audit recommendations

**What It Does:**
- Analyzes SEO data and provides strategic recommendations
- Generates content briefs for keywords
- Provides actionable optimization suggestions
- Prioritizes action items based on impact
- Generates competitor analysis insights

**Example Usage:**
```typescript
const insights = await ClaudeService.generateSEOInsights({
  url: 'https://example.com',
  score: 75,
  analyses: { title: {...}, meta: {...}, ... }
})
// Returns: { summary, strengths, weaknesses, priorityActions, estimatedImpact }
```

**Methods:**
- `generateSEOInsights(data)` - Generate SEO analysis insights
- `generateContentBrief(keyword, serpData, metrics)` - Generate content brief

#### 4.2 Claude 3 Haiku (Alternative)
**Model:** `claude-3-haiku-20240307`

**Used For:**
- Faster, lighter content generation tasks
- Cost-effective for simple analyses

---

## 5. LemonSqueezy API

### Service File
- `src/lib/services/lemonsqueezy.ts`

### Authentication
```typescript
'Authorization': `Bearer ${LEMONSQUEEZY_API_KEY}`
```

### Environment Variables
```bash
LEMONSQUEEZY_API_KEY=your_api_key
LEMONSQUEEZY_STORE_ID=your_store_id
LEMONSQUEEZY_WEBHOOK_SECRET=your_webhook_secret
LEMONSQUEEZY_VARIANT_BASIC=variant_id
LEMONSQUEEZY_VARIANT_PRO=variant_id
LEMONSQUEEZY_VARIANT_AGENCY=variant_id
```

### API Endpoints Used

#### 5.1 Customers API
**Endpoint:** `GET /customers?filter[email]={email}`  
**Endpoint:** `POST /customers`

**Used In:**
- `POST /api/lemonsqueezy/customer` - Create/get customer
- `POST /api/lemonsqueezy/checkout` - Get customer for checkout

**What It Does:**
- Creates or retrieves customer records
- Links customers to subscriptions
- Stores customer email and name

**Example Usage:**
```typescript
const customer = await LemonSqueezyService.createCustomer('user@example.com', 'John Doe')
// Returns: { id, attributes: { email, name, status, ... } }
```

#### 5.2 Checkouts API
**Endpoint:** `POST /checkouts`

**Used In:**
- `POST /api/lemonsqueezy/checkout` - Generate checkout URL

**What It Does:**
- Creates checkout session
- Links to product variant
- Generates secure checkout URL
- Supports custom pricing

**Example Usage:**
```typescript
const checkout = await LemonSqueezyService.createCheckout(variantId, customerId)
// Returns: { id, attributes: { url, ... } }
```

#### 5.3 Subscriptions API
**Endpoint:** `GET /subscriptions/{subscriptionId}`

**Used In:**
- `GET /api/lemonsqueezy/status` - Get subscription status

**What It Does:**
- Retrieves subscription details
- Gets subscription status (active, canceled, etc.)
- Returns renewal dates
- Provides customer portal URL

**Example Usage:**
```typescript
const subscription = await LemonSqueezyService.getSubscription(subscriptionId)
// Returns: { id, attributes: { status, renews_at, urls: { customer_portal }, ... } }
```

#### 5.4 Webhooks
**Endpoint:** `POST /api/lemonsqueezy/webhook` (our endpoint)

**Webhook Events Handled:**
- `subscription_created` - New subscription
- `subscription_updated` - Subscription updated
- `subscription_payment_success` - Payment successful
- `subscription_cancelled` - Subscription cancelled
- `subscription_expired` - Subscription expired

**What It Does:**
- Verifies webhook signature
- Updates subscription status in database
- Links subscription to user account
- Sets plan limits based on variant

**Signature Verification:**
```typescript
LemonSqueezyService.verifyWebhookSignature(payload, signature)
// Uses HMAC SHA256 to verify webhook authenticity
```

---

## 📊 API Usage by Endpoint

### `/api/analyze` (Website SEO Analysis)
**APIs Used:**
- ✅ Scrape.do (page scraping)
- ✅ Claude AI (for insights)

**Data Flow:**
1. Scrape.do scrapes page → Returns content, title, meta, headings, images
2. Analyze scraped data → Calculate SEO metrics
3. Claude AI analyzes metrics → Returns strategic recommendations

---

### `/api/keywords/research` (Keyword Research)
**APIs Used:**
- ✅ DataForSEO Keywords API (metrics)
- ✅ Serper.dev (SERP results)
- ✅ Claude AI (content brief)

**Data Flow:**
1. DataForSEO gets keyword metrics (volume, difficulty, CPC)
2. Serper.dev gets SERP results
3. DataForSEO gets related keywords
4. Claude AI generates content brief

---

### `/api/competitors/find-from-keyword` (Competitor Analysis)
**APIs Used:**
- ✅ Serper.dev (SERP data)
- ✅ Scrape.do (competitor content)
- ✅ Claude AI (insights)

**Data Flow:**
1. Serper.dev finds competitors from SERP
2. Scrape.do analyzes competitor pages
3. Compare metrics with user's page
4. Claude AI generates competitive insights

---

### `/api/serp-tracker` (SERP Tracking)
**APIs Used:**
- ✅ Serper.dev (SERP results)
- ✅ DataForSEO Keywords API (metrics)

**Data Flow:**
1. Serper.dev gets current SERP results
2. Check ranking position for target URL
3. Store historical ranking data
4. Calculate ranking changes

---

### `/api/content-optimizer` (Content Optimization)
**APIs Used:**
- ✅ Scrape.do (if URL provided for competitor comparison)
- ✅ Claude AI (optimization suggestions)

**Data Flow:**
1. Analyze content metrics (word count, headings, etc.)
2. Scrape competitor if URL provided
3. Claude AI generates optimization suggestions
4. Calculate improvement scores

---

### `/api/seo-audit` (SEO Audit)
**APIs Used:**
- ✅ Scrape.do (detailed content analysis)
- ✅ Claude AI (recommendations)

**Data Flow:**
1. Scrape.do analyzes page content
2. Check technical, on-page, off-page, performance
3. Claude AI generates recommendations
4. Prioritize action items

---


---

### `/api/lemonsqueezy/*` (Payment Integration)
**APIs Used:**
- ✅ LemonSqueezy Customers API
- ✅ LemonSqueezy Checkouts API
- ✅ LemonSqueezy Subscriptions API
- ✅ LemonSqueezy Webhooks

**Data Flow:**
1. Create/get customer
2. Generate checkout URL
3. Handle webhook events
4. Update subscription status

---

## 🔄 Data Flow Diagram

```
User Request
    ↓
API Route (/api/*)
    ↓
Service Layer (lib/services/*)
    ↓
External APIs
    ├── DataForSEO → Keyword metrics, SERP, On-page data
    ├── Serper.dev → SERP results, rankings
    ├── Scrape.do → Competitor content
    ├── Claude AI → AI analysis & recommendations
    └── LemonSqueezy → Payments & subscriptions
    ↓
Data Processing & Caching
    ↓
Database (Prisma)
    ↓
Response to User
```

---

## 💾 Caching Strategy

| API | Cache TTL | Cache Key |
|-----|-----------|-----------|
| DataForSEO Keywords | 24 hours | `keyword:{keyword}` |
| Serper.dev | Not cached | N/A |
| Scrape.do | Not cached | N/A |
| Claude AI | Not cached | N/A |

**Cache Implementation:**
- Uses Redis (Upstash) for caching
- Cache keys stored in `CachedData` model
- Automatic expiration based on TTL

---

## 🔐 Security & Rate Limiting

### Rate Limits
- **DataForSEO Keywords:** 2,000 requests/minute
- **Serper.dev:** Based on plan (typically 2,500/month)
- **Scrape.do:** Based on plan
- **Claude AI:** Based on plan
- **LemonSqueezy:** Standard API limits

### Authentication
- All APIs use secure authentication (API keys, tokens)
- Webhook signatures verified for LemonSqueezy
- User authentication required for all endpoints

---

## 📝 Environment Variables Summary

```bash
# DataForSEO
DATAFORSEO_LOGIN=your_email@example.com
DATAFORSEO_PASSWORD=your_api_token

# Serper.dev
SERPER_API_KEY=your_serper_api_key

# Scrape.do
SCRAPEDO_API_KEY=your_scrapedo_api_key

# Claude AI (Anthropic)
ANTHROPIC_API_KEY=sk-ant-...

# LemonSqueezy
LEMONSQUEEZY_API_KEY=your_api_key
LEMONSQUEEZY_STORE_ID=your_store_id
LEMONSQUEEZY_WEBHOOK_SECRET=your_webhook_secret
LEMONSQUEEZY_VARIANT_BASIC=variant_id
LEMONSQUEEZY_VARIANT_PRO=variant_id
LEMONSQUEEZY_VARIANT_AGENCY=variant_id
```

---

## 🚀 API Cost Optimization

1. **Caching:** Reduces DataForSEO keyword API calls by 70-80%
2. **Batch Processing:** Processes multiple keywords in single API call
3. **Parallel Requests:** Uses Promise.all() for concurrent API calls
4. **Selective Usage:** Only uses expensive APIs when necessary
5. **Rate Limiting:** Prevents exceeding API quotas
6. **Replaced Expensive APIs:** Replaced DataForSEO SERP and On-Page with cheaper alternatives (Serper.dev, Scrape.do)

---

## 📚 API Documentation Links

- [DataForSEO API Docs](https://docs.dataforseo.com/v3/)
- [Serper.dev Docs](https://serper.dev/docs)
- [Scrape.do Docs](https://scrape.do/docs)
- [Claude AI Docs](https://docs.anthropic.com/)
- [LemonSqueezy API Docs](https://docs.lemonsqueezy.com/)

