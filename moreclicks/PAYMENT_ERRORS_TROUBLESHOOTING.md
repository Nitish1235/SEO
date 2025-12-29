# Payment Errors Troubleshooting Guide

## Dodo Payments 404 Error

### Error Message
```
Dodo Payments API error: 404 -
```

### Possible Causes

1. **Invalid Product ID**
   - The `product_id` (plan ID) doesn't exist in your Dodo Payments account
   - Product ID is incorrect or not configured

2. **Wrong API Base URL**
   - Using wrong environment (test vs live)
   - Base URL format is incorrect

3. **API Endpoint Not Found**
   - Endpoint path might be incorrect
   - API version mismatch

### Solutions

#### 1. Verify Product IDs

Check your `.env.local` file:
```bash
DODO_PLAN_BASIC="prod_xxxxx"  # Should be a valid product_id
DODO_PLAN_PRO="prod_xxxxx"
DODO_PLAN_AGENCY="prod_xxxxx"
```

**Important**: These should be **Product IDs**, not Plan IDs. Products are created in the Dodo Payments dashboard.

#### 2. Verify API Base URL

```bash
# For test/development
DODO_API_BASE_URL="https://test.dodopayments.com"

# For production
DODO_API_BASE_URL="https://live.dodopayments.com"
```

#### 3. Verify API Key

```bash
DODO_API_KEY="your_api_key_here"
```

Get your API key from:
- Dodo Payments Dashboard → Developer → API Keys

#### 4. Check Product Exists

1. Go to Dodo Payments Dashboard
2. Navigate to **Products**
3. Verify the products exist and are **Subscription** type
4. Copy the **Product ID** (not Plan ID)
5. Update `.env.local` with correct Product IDs

#### 5. Test API Connection

Check the logs for the exact URL being called:
```
[Dodo Payments] Creating checkout: {
  url: "https://test.dodopayments.com/checkouts",
  productId: "prod_xxxxx",
  ...
}
```

Verify:
- URL is correct
- Product ID matches your dashboard
- API key is valid

### Debug Steps

1. **Check Environment Variables**
   ```bash
   # In your terminal
   echo $DODO_API_KEY
   echo $DODO_API_BASE_URL
   echo $DODO_PLAN_BASIC
   ```

2. **Verify Product in Dashboard**
   - Login to Dodo Payments
   - Go to Products
   - Find your subscription products
   - Copy the exact Product ID

3. **Test with cURL** (optional)
   ```bash
   curl -X POST https://test.dodopayments.com/checkouts \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "product_cart": [{"product_id": "YOUR_PRODUCT_ID", "quantity": 1}],
       "return_url": "http://localhost:3000/dashboard/billing?success=true"
     }'
   ```

## LemonSqueezy 401 Error

### Error Message
```
LemonSqueezy API error: 401 - {"jsonapi":{"version":"1.0"},"errors":[{"detail":"Unauthenticated.","status":"401","title":"Unauthorized"}]}
```

### Cause
LemonSqueezy API key is missing, invalid, or incorrect.

### Solutions

#### 1. Verify API Key

Check your `.env.local`:
```bash
LEMONSQUEEZY_API_KEY="your_api_key_here"
```

Get your API key from:
- LemonSqueezy Dashboard → Settings → API

#### 2. Verify Store ID

```bash
LEMONSQUEEZY_STORE_ID="your_store_id"
```

#### 3. Check API Key Permissions

Ensure your API key has:
- Read permissions
- Write permissions (for creating customers/checkouts)

#### 4. Regenerate API Key

If the key is invalid:
1. Go to LemonSqueezy Dashboard
2. Settings → API
3. Create a new API key
4. Update `.env.local`
5. Restart dev server

## Common Issues

### Issue: Both Payment Providers Failing

**Symptoms:**
- Dodo Payments returns 404
- LemonSqueezy returns 401
- Checkout completely fails

**Solution:**
1. Verify at least one payment provider is properly configured
2. Check all environment variables are set
3. Restart dev server after updating `.env.local`
4. Check server logs for detailed error messages

### Issue: Plan IDs Not Configured

**Symptoms:**
- Error: "No payment provider configured for this plan"

**Solution:**
1. Set plan IDs in `.env.local`:
   ```bash
   # Dodo Payments (Product IDs)
   DODO_PLAN_BASIC="prod_xxxxx"
   DODO_PLAN_PRO="prod_xxxxx"
   DODO_PLAN_AGENCY="prod_xxxxx"
   
   # OR LemonSqueezy (Variant IDs)
   LEMONSQUEEZY_VARIANT_BASIC="variant_xxxxx"
   LEMONSQUEEZY_VARIANT_PRO="variant_xxxxx"
   LEMONSQUEEZY_VARIANT_AGENCY="variant_xxxxx"
   ```

2. Restart dev server

### Issue: Environment Variables Not Loading

**Symptoms:**
- Variables appear undefined
- Errors about missing configuration

**Solution:**
1. Ensure `.env.local` is in project root (same level as `package.json`)
2. Restart dev server after changes
3. Check for typos in variable names
4. Verify no extra spaces or quotes

## Quick Checklist

Before testing checkout:

- [ ] `DODO_API_KEY` is set and valid
- [ ] `DODO_API_BASE_URL` is set (test or live)
- [ ] `DODO_PLAN_BASIC`, `DODO_PLAN_PRO`, `DODO_PLAN_AGENCY` are set with valid Product IDs
- [ ] Products exist in Dodo Payments dashboard
- [ ] Products are Subscription type
- [ ] OR `LEMONSQUEEZY_API_KEY` is set and valid
- [ ] OR `LEMONSQUEEZY_VARIANT_*` IDs are set
- [ ] Dev server restarted after env changes
- [ ] Check server logs for detailed errors

## Getting Help

If issues persist:

1. **Check Server Logs** - Look for detailed error messages
2. **Verify Dashboard** - Ensure products/plans exist
3. **Test API Directly** - Use cURL or Postman to test endpoints
4. **Check Documentation**:
   - Dodo Payments: https://docs.dodopayments.com
   - LemonSqueezy: https://docs.lemonsqueezy.com

