# Claude API Model Fix

## Issue
The Claude API was returning a 404 error because the model name `claude-3-5-sonnet-20240620` was outdated and no longer available.

## Fix Applied
Updated all Claude model references from `claude-3-5-sonnet-20240620` to `claude-3-5-sonnet-20241022` (latest version).

## Files Updated

1. **`src/lib/services/claude.ts`**
   - `generateSEOInsights()` method - Updated model name

2. **`src/app/api/competitors/find-from-keyword/route.ts`**
   - Competitor insights generation - Updated model name

3. **`src/app/api/content-optimizer/route.ts`**
   - Content optimization suggestions - Updated model name

## Current Model Usage

- **SEO Insights**: `claude-3-5-sonnet-20241022`
- **Content Briefs**: `claude-3-haiku-20240307` (unchanged - still valid)
- **Competitor Insights**: `claude-3-5-sonnet-20241022`
- **Content Optimization**: `claude-3-5-sonnet-20241022`

## Alternative Models (if needed)

If `claude-3-5-sonnet-20241022` still doesn't work, you can use:
- `claude-3-5-sonnet` (uses latest version automatically)
- `claude-3-opus-20240229` (more powerful, more expensive)
- `claude-3-sonnet-20240229` (older but stable)

## Testing

After this fix, the analyze endpoint should work correctly. The error should be resolved and Claude API calls should succeed.

