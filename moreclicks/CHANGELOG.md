# Changelog

## Latest Updates (2024)

### Usage & Billing
- ✅ Free tier implemented: 1 analysis, 3 keywords, 0 competitors
- ✅ Usage tracking only on completed status (not processing or failed)
- ✅ Users not charged for external API failures
- ✅ LemonSqueezy payment provider integration

### UI/UX Enhancements
- ✅ Dark mode with theme toggle
- ✅ Processing overlay with animated logo and progress bar
- ✅ Enhanced competitor analysis UI with visual comparisons
- ✅ Improved AI insights display with color-coded cards
- ✅ Better error messages and user feedback

### Data & Analysis Improvements
- ✅ Enhanced DataForSEO API integration with better error handling
- ✅ Improved data extraction from Scrape.do
- ✅ Schema markup detection
- ✅ Open Graph and Twitter Card tags analysis
- ✅ Content structure analysis (FAQ, lists, tables)
- ✅ Image optimization details (alt text coverage, quality)
- ✅ Link analysis (internal/external/nofollow)
- ✅ Language detection

### Competitor Analysis Enhancements
- ✅ Visual comparisons with bar charts
- ✅ Content strategy analysis
- ✅ Image strategy insights
- ✅ Gap analysis (positive and negative gaps)
- ✅ Section-by-section action items
- ✅ Filters out non-useful domains (social media, wikis, blogs)

### AI Insights Improvements
- ✅ Comprehensive strengths and weaknesses (no limit)
- ✅ Priority actions with impact assessment
- ✅ Detailed section-wise recommendations
- ✅ Enhanced competitor insights

## Previous Updates

### History & Activity Features
- ✅ Added analysis history page (`/dashboard/analyze/history`)
- ✅ Added keyword research history page (`/dashboard/keywords/history`)
- ✅ Added recent activity widget on dashboard
- ✅ API routes for listing analyses, keywords, and competitors
- ✅ Improved navigation with better active state detection

### UI Improvements
- ✅ Enhanced dashboard with recent activity feed
- ✅ Added quick action cards on analysis and keywords pages
- ✅ Better loading states with skeleton loaders
- ✅ Improved empty states with helpful messages
- ✅ Better date formatting with `date-fns`

### Additional Features
- ✅ Subscription status API endpoint
- ✅ Stripe billing portal integration
- ✅ Enhanced billing page with current subscription display
- ✅ Route protection middleware
- ✅ Rate limiting utility
- ✅ Shared components (LoadingSpinner, ErrorMessage)

## Previous Implementation

### Core Features
- Website SEO analysis with 50+ metrics
- Keyword research with content briefs
- Competitor analysis
- AI-powered insights (Claude)
- Subscription management (Stripe)
- Usage tracking and limits

### Technical Stack
- Next.js 14 (App Router)
- TypeScript
- Prisma ORM
- PostgreSQL
- Redis (Upstash)
- DataForSEO APIs
- Claude AI
- NextAuth.js
- Stripe

