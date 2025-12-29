# LemonSqueezy Setup Guide

This guide will walk you through setting up LemonSqueezy as the primary payment provider for your SEO Analyzer SaaS application.

## 📋 Prerequisites

1. A LemonSqueezy account (sign up at https://lemonsqueezy.com)
2. Your application deployed or running locally
3. Access to your environment variables

## 🚀 Step-by-Step Setup

### Step 1: Create a LemonSqueezy Account

1. Go to https://lemonsqueezy.com
2. Click "Sign Up" and create your account
3. Complete the onboarding process

### Step 2: Create Your Store

1. In the LemonSqueezy dashboard, create a new store
2. Note your **Store ID** (you'll need this for environment variables)
3. Configure your store settings (name, currency, etc.)

### Step 3: Create Products and Variants

You need to create 3 products (one for each plan: Basic, Pro, Agency) with subscription variants.

#### For Basic Plan ($29/month):

1. Go to **Products** → **Create Product**
2. Product Name: "SEO Analyzer - Basic Plan"
3. Description: "Basic SEO analysis subscription"
4. Price: $29.00
5. Billing Period: Monthly (recurring)
6. Click **Create Product**
7. **Copy the Variant ID** (you'll need this for `LEMONSQUEEZY_VARIANT_BASIC`)

#### For Pro Plan ($49/month):

1. Create another product: "SEO Analyzer - Pro Plan"
2. Price: $49.00
3. Billing Period: Monthly (recurring)
4. **Copy the Variant ID** (for `LEMONSQUEEZY_VARIANT_PRO`)

#### For Agency Plan ($129/month):

1. Create another product: "SEO Analyzer - Agency Plan"
2. Price: $129.00
3. Billing Period: Monthly (recurring)
4. **Copy the Variant ID** (for `LEMONSQUEEZY_VARIANT_AGENCY`)

### Step 4: Get Your API Key

1. Go to **Settings** → **API**
2. Click **Create API Key**
3. Give it a name (e.g., "SEO Analyzer API Key")
4. **Copy the API Key** (you'll need this for `LEMONSQUEEZY_API_KEY`)
5. ⚠️ **Important**: Store this securely - you won't be able to see it again!

### Step 5: Set Up Webhooks

1. Go to **Settings** → **Webhooks**
2. Click **Create Webhook**
3. Webhook URL: `https://yourdomain.com/api/lemonsqueezy/webhook`
   - Replace `yourdomain.com` with your actual domain
   - For local testing: Use a tool like ngrok or similar
4. Select the following events:
   - `subscription_created`
   - `subscription_updated`
   - `subscription_cancelled`
   - `subscription_expired`
   - `subscription_payment_success`
5. Click **Create Webhook**
6. **Copy the Webhook Secret** (you'll need this for `LEMONSQUEEZY_WEBHOOK_SECRET`)

### Step 6: Configure Environment Variables

Add the following to your `.env.local` file:

```bash
# LemonSqueezy Configuration (Primary Payment Provider)
LEMONSQUEEZY_API_KEY="your_api_key_here"
LEMONSQUEEZY_STORE_ID="your_store_id_here"
LEMONSQUEEZY_WEBHOOK_SECRET="your_webhook_secret_here"

# Variant IDs for each plan
LEMONSQUEEZY_VARIANT_BASIC="variant_id_for_basic_plan"
LEMONSQUEEZY_VARIANT_PRO="variant_id_for_pro_plan"
LEMONSQUEEZY_VARIANT_AGENCY="variant_id_for_agency_plan"
```

### Step 7: Update Your Application

The application has been updated to use LemonSqueezy as the primary payment provider. The following routes now use LemonSqueezy:

- ✅ `/api/subscription/create-checkout` - Creates LemonSqueezy checkout
- ✅ `/api/subscription/portal` - Redirects to LemonSqueezy customer portal
- ✅ `/api/subscription/status` - Returns subscription status (prioritizes LemonSqueezy)
- ✅ `/api/lemonsqueezy/webhook` - Handles webhook events

### Step 8: Test the Integration

#### Test Checkout Flow:

1. Start your application: `npm run dev`
2. Sign in to your dashboard
3. Go to **Billing** page
4. Click **Subscribe** on any plan
5. You should be redirected to LemonSqueezy checkout
6. Use LemonSqueezy test card: `4242 4242 4242 4242`
7. Complete the checkout
8. Verify you're redirected back to your app

#### Test Webhook:

1. In LemonSqueezy dashboard, go to **Webhooks**
2. Find your webhook and click **Test Webhook**
3. Select an event (e.g., `subscription_created`)
4. Check your application logs to verify the webhook was received
5. Verify the subscription was created in your database

## 🔍 Verification Checklist

- [ ] LemonSqueezy account created
- [ ] Store created and Store ID noted
- [ ] 3 products created (Basic, Pro, Agency)
- [ ] Variant IDs copied for all 3 plans
- [ ] API key created and copied
- [ ] Webhook created with correct URL
- [ ] Webhook secret copied
- [ ] All environment variables set in `.env.local`
- [ ] Application restarted after adding env variables
- [ ] Checkout flow tested successfully
- [ ] Webhook tested and verified
- [ ] Subscription appears in database after checkout

## 📝 Environment Variables Reference

| Variable | Description | Where to Find |
|----------|-------------|---------------|
| `LEMONSQUEEZY_API_KEY` | Your API key for authentication | Settings → API → Create API Key |
| `LEMONSQUEEZY_STORE_ID` | Your store's unique identifier | Store settings or URL |
| `LEMONSQUEEZY_WEBHOOK_SECRET` | Secret for webhook verification | Settings → Webhooks → Your webhook |
| `LEMONSQUEEZY_VARIANT_BASIC` | Variant ID for Basic plan | Product → Basic Plan → Variant ID |
| `LEMONSQUEEZY_VARIANT_PRO` | Variant ID for Pro plan | Product → Pro Plan → Variant ID |
| `LEMONSQUEEZY_VARIANT_AGENCY` | Variant ID for Agency plan | Product → Agency Plan → Variant ID |

## 🐛 Troubleshooting

### Checkout Not Working

- Verify all environment variables are set correctly
- Check that variant IDs match your products
- Ensure API key has proper permissions
- Check browser console for errors

### Webhook Not Receiving Events

- Verify webhook URL is correct and accessible
- Check that webhook secret matches in environment variables
- Ensure webhook events are selected in LemonSqueezy dashboard
- For local development, use ngrok or similar tool to expose your local server

### Subscription Not Created After Checkout

- Check webhook logs in LemonSqueezy dashboard
- Verify webhook endpoint is receiving requests
- Check application logs for webhook processing errors
- Verify database connection is working

### Customer Portal Not Accessible

- Ensure user has a LemonSqueezy customer ID
- Verify subscription exists in database
- Check that `lemonSqueezySubscriptionId` is set

## 🔐 Security Notes

1. **Never commit** your API keys or secrets to version control
2. Use environment variables for all sensitive data
3. Keep your webhook secret secure
4. Regularly rotate API keys
5. Monitor webhook events for suspicious activity

## 📚 Additional Resources

- [LemonSqueezy API Documentation](https://docs.lemonsqueezy.com/)
- [LemonSqueezy Webhooks Guide](https://docs.lemonsqueezy.com/help/webhooks)
- [LemonSqueezy Checkout Documentation](https://docs.lemonsqueezy.com/api/checkouts)

## ✅ Next Steps

After completing the setup:

1. Test the full subscription flow end-to-end
2. Monitor webhook events in production
3. Set up error alerts for failed webhooks
4. Configure email notifications for subscription events (optional)
5. Test subscription cancellation and renewal flows

---

**Note**: Stripe integration is still available as a fallback, but LemonSqueezy is now the primary payment provider. To switch back to Stripe, you would need to revert the changes in the checkout and portal routes.

