# Dodo Payments Setup Guide

This guide will walk you through setting up Dodo Payments as the primary payment provider for your SEO Analyzer SaaS application.

## 📋 Prerequisites

1. A Dodo Payments account (sign up at https://dodopayments.com)
2. Your application deployed or running locally
3. Access to your environment variables

## 🚀 Step-by-Step Setup

### Step 1: Create a Dodo Payments Account

1. Go to https://dodopayments.com
2. Click "Sign Up" and create your merchant account
3. Complete the account verification process (KYC)
4. Provide necessary business information for compliance

### Step 2: Verify Your Account

1. Complete identity verification (KYC) as required
2. **Important**: Payout verification is only available after you reach a minimum of **$50 in user subscriptions**
3. Once you reach the $50 threshold, you can submit payout details (bank account information)
4. Wait for compliance team approval
5. Once approved, you'll be able to receive payouts

### Step 3: Create Subscription Plans

You need to create 3 subscription plans (one for each tier: Basic, Pro, Agency).

#### For Basic Plan ($29/month):

1. Go to **Products** → **Create Product**
2. Product Name: "SEO Analyzer - Basic Plan"
3. Description: "Basic SEO analysis subscription"
4. Product Type: **Subscription** (recurring)
5. Price: $29.00
6. Billing Period: Monthly (recurring subscription)
7. Click **Create Product**
8. **Copy the Product ID** (you'll need this for `DODO_PLAN_BASIC`)
   - ⚠️ **Important**: Use the `product_id`, not a plan_id

#### For Pro Plan ($49/month):

1. Create another product: "SEO Analyzer - Pro Plan"
2. Product Type: **Subscription** (recurring)
3. Price: $49.00
4. Billing Period: Monthly (recurring subscription)
5. **Copy the Product ID** (for `DODO_PLAN_PRO`)

#### For Agency Plan ($129/month):

1. Create another product: "SEO Analyzer - Agency Plan"
2. Product Type: **Subscription** (recurring)
3. Price: $129.00
4. Billing Period: Monthly (recurring subscription)
5. **Copy the Product ID** (for `DODO_PLAN_AGENCY`)

### Step 4: Get Your API Key

1. Go to **Developer** → **API Keys** (or **Settings** → **API**)
2. Click **Create API Key** or **Generate API Key**
3. Give it a name (e.g., "SEO Analyzer API Key")
4. Select appropriate permissions (read/write for subscriptions and customers)
5. **Copy the API Key** (you'll need this for `DODO_API_KEY`)
6. ⚠️ **Important**: Store this securely - you may not be able to see it again!

### Step 5: Set Up Webhooks

1. Go to **Developer** → **Webhooks** (or **Settings** → **Webhooks**)
2. Click **Create Webhook** or **Add Webhook**
3. Webhook URL: `https://yourdomain.com/api/dodopayments/webhook`
   - Replace `yourdomain.com` with your actual domain
   - For local testing: Use a tool like ngrok or similar
4. Enable the following events (check all that apply):

   **Subscription Events (Essential):**
   - ✅ `subscription.active` - When subscription becomes active
   - ✅ `subscription.cancelled` - When subscription is cancelled
   - ✅ `subscription.expired` - When subscription expires
   - ✅ `subscription.failed` - When payment fails
   - ✅ `subscription.renewed` - When subscription renews
   - ✅ `subscription.updated` - When subscription details change
   - ✅ `subscription.plan_changed` - When user upgrades/downgrades plan

   **Payment Events (Important):**
   - ✅ `payment.succeeded` - When payment succeeds
   - ✅ `payment.failed` - When payment fails
   - ✅ `payment.processing` - To track payment status (optional but recommended)
   - ✅ `payment.cancelled` - When payment is cancelled (optional)

   **Note**: At minimum, subscribe to all subscription events and `payment.succeeded`/`payment.failed` for proper functionality.
   
   **Refund Events**: Not required (no refund policy currently implemented)

5. Click **Create Webhook** or **Save**
6. **Copy the Webhook Secret** (you'll need this for `DODO_WEBHOOK_SECRET`)

### Step 6: Configure Environment Variables

Add the following to your `.env.local` file:

```bash
# Dodo Payments Configuration (Primary Payment Provider)
DODO_API_KEY="your_api_key_here"
# API Base URL (use test for development, live for production)
# Test Mode: https://test.dodopayments.com
# Live Mode: https://live.dodopayments.com
DODO_API_BASE_URL="https://test.dodopayments.com"  # Optional, defaults to test mode
DODO_WEBHOOK_SECRET="your_webhook_secret_here"
DODO_CUSTOMER_PORTAL_URL="https://app.dodopayments.com"  # Optional, defaults to this

# Product IDs for each subscription tier (these are product_id values, not plan_id)
# Note: Dodo Payments uses products, so create subscription products and use their product_id
DODO_PLAN_BASIC="product_id_for_basic_plan"
DODO_PLAN_PRO="product_id_for_pro_plan"
DODO_PLAN_AGENCY="product_id_for_agency_plan"
```

### Step 7: Update Database Schema

Run the following command to update your database schema with Dodo Payments fields:

```bash
npx prisma db push
```

Or if using migrations:

```bash
npx prisma migrate dev --name add_dodo_payments
```

This will add the following fields:
- `dodoCustomerId` to the `User` model
- `dodoSubscriptionId`, `dodoPlanId`, and `dodoCurrentPeriodEnd` to the `Subscription` model

### Step 8: Update Your Application

The application has been updated to use Dodo Payments as the primary payment provider. The following routes now prioritize Dodo Payments:

- ✅ `/api/subscription/create-checkout` - Creates Dodo Payments checkout (primary)
- ✅ `/api/subscription/portal` - Redirects to Dodo Payments customer portal (primary)
- ✅ `/api/subscription/status` - Returns subscription status (prioritizes Dodo Payments)
- ✅ `/api/dodopayments/webhook` - Handles webhook events

### Step 9: Test the Integration

#### Test Checkout Flow:

1. Start your application: `npm run dev`
2. Sign in to your dashboard
3. Go to **Billing** page
4. Click **Subscribe** on any plan
5. You should be redirected to Dodo Payments checkout
6. Use Dodo Payments test mode (if available) or test card
7. Complete the checkout
8. Verify you're redirected back to your app

#### Test Webhook:

1. In Dodo Payments dashboard, go to **Webhooks**
2. Find your webhook and click **Test Webhook** or **Send Test Event**
3. Select an event (e.g., `subscription.created`)
4. Check your application logs to verify the webhook was received
5. Verify the subscription was created in your database

#### Verify Database:

1. Check that `dodoCustomerId` is set in the `User` table
2. Verify `dodoSubscriptionId`, `dodoPlanId`, and `dodoCurrentPeriodEnd` are set in the `Subscription` table
3. Confirm subscription status is `active`

## 🔍 Verification Checklist

- [ ] Dodo Payments account created and verified
- [ ] KYC completed and account approved
- [ ] 3 subscription plans created (Basic, Pro, Agency)
- [ ] Plan IDs copied for all 3 plans
- [ ] API key created and copied
- [ ] Webhook created with correct URL
- [ ] All required webhook events subscribed (see Step 5)
- [ ] Webhook secret copied
- [ ] All environment variables set in `.env.local`
- [ ] Database schema updated (`npx prisma db push`)
- [ ] Application restarted after adding env variables
- [ ] Checkout flow tested successfully
- [ ] Webhook tested and verified
- [ ] Subscription appears in database after checkout
- [ ] Customer portal accessible

## 📝 Environment Variables Reference

| Variable | Description | Where to Find | Required |
|----------|-------------|---------------|----------|
| `DODO_API_KEY` | Your API key for authentication | Developer → API Keys → Create API Key | Yes |
| `DODO_API_BASE_URL` | Base URL for Dodo Payments API | Usually `https://api.dodopayments.com/v1` | No (has default) |
| `DODO_WEBHOOK_SECRET` | Secret for webhook verification | Developer → Webhooks → Your webhook | Yes |
| `DODO_PLAN_BASIC` | Plan ID for Basic subscription | Plans → Basic Plan → Plan ID | Yes |
| `DODO_PLAN_PRO` | Plan ID for Pro subscription | Plans → Pro Plan → Plan ID | Yes |
| `DODO_PLAN_AGENCY` | Plan ID for Agency subscription | Plans → Agency Plan → Plan ID | Yes |
| `DODO_CUSTOMER_PORTAL_URL` | URL for customer portal | Usually `https://app.dodopayments.com` | No (has default) |

## 📡 Webhook Events Reference

The following webhook events are handled by the application:

### Subscription Events

| Event | Description | Action Taken |
|-------|-------------|--------------|
| `subscription.active` | Subscription becomes active | Updates subscription status to 'active' |
| `subscription.created` | New subscription created | Creates subscription record in database |
| `subscription.updated` | Subscription details updated | Updates subscription in database |
| `subscription.renewed` | Subscription renewed | Updates renewal date and status |
| `subscription.plan_changed` | User upgraded/downgraded plan | Updates plan and limits in database |
| `subscription.cancelled` | Subscription cancelled | Updates status to 'canceled' |
| `subscription.expired` | Subscription expired | Updates status to 'canceled' |
| `subscription.failed` | Payment failed | Updates status to 'past_due' |

### Payment Events

| Event | Description | Action Taken |
|-------|-------------|--------------|
| `payment.succeeded` | Payment completed successfully | Activates subscription if inactive |
| `payment.completed` | Payment completed (alias) | Activates subscription if inactive |
| `payment.failed` | Payment failed | Marks subscription as 'past_due' |
| `payment.processing` | Payment being processed | Logged for monitoring (no action) |
| `payment.cancelled` | Payment cancelled | Logged for monitoring (no action) |

**Minimum Required Events**: For basic functionality, subscribe to at least:
- All subscription events (`subscription.*`)
- `payment.succeeded`
- `payment.failed`

## 🐛 Troubleshooting

### Checkout Not Working

- Verify all environment variables are set correctly
- Check that plan IDs match your subscription plans
- Ensure API key has proper permissions
- Verify API base URL is correct
- Check browser console for errors
- Review application logs for API errors

### Webhook Not Receiving Events

- Verify webhook URL is correct and accessible
- Check that webhook secret matches in environment variables
- Ensure webhook events are enabled in Dodo Payments dashboard
- For local development, use ngrok or similar tool to expose your local server
- Check webhook logs in Dodo Payments dashboard
- Verify webhook endpoint is receiving requests (check application logs)

### Subscription Not Created After Checkout

- Check webhook logs in Dodo Payments dashboard
- Verify webhook endpoint is receiving requests
- Check application logs for webhook processing errors
- Verify database connection is working
- Ensure database schema is updated with Dodo Payments fields
- Check that `dodoCustomerId` is set in User table

### Customer Portal Not Accessible

- Ensure user has a Dodo Payments customer ID (`dodoCustomerId`)
- Verify subscription exists in database
- Check that `dodoSubscriptionId` is set
- Verify `DODO_CUSTOMER_PORTAL_URL` is correct (if custom)
- Check application logs for portal URL generation errors

### API Errors

- Verify API key is valid and not expired
- Check API key permissions
- Ensure API base URL is correct
- Review Dodo Payments API documentation for endpoint changes
- Check rate limits if receiving 429 errors

## 🔐 Security Notes

1. **Never commit** your API keys or secrets to version control
2. Use environment variables for all sensitive data
3. Keep your webhook secret secure
4. Regularly rotate API keys
5. Monitor webhook events for suspicious activity
6. Use HTTPS for all webhook endpoints
7. Verify webhook signatures in production

## 📚 Additional Resources

- [Dodo Payments Documentation](https://docs.dodopayments.com/)
- [Dodo Payments API Reference](https://docs.dodopayments.com/api-reference)
- [Dodo Payments Webhooks Guide](https://docs.dodopayments.com/webhooks)
- [Dodo Payments Integration Guide](https://docs.dodopayments.com/api-reference/integration-guide)

## ✅ Next Steps

After completing the setup:

1. Test the full subscription flow end-to-end
2. Monitor webhook events in production
3. Set up error alerts for failed webhooks
4. Configure email notifications for subscription events (optional)
5. Test subscription cancellation and renewal flows
6. **Once you reach $50 in subscriptions**, submit payout details for verification
7. Verify payout process works correctly after approval
8. Set up monitoring for subscription status changes

## 💰 Payout Information

**Important**: Dodo Payments requires a minimum of **$50 in user subscriptions** before you can complete payout verification. This means:

- You can start accepting payments immediately after setup
- Funds will accumulate in your Dodo Payments account
- Once you reach the $50 threshold, you can submit payout details
- After compliance approval, payouts will be enabled
- Monitor your account balance in the Dodo Payments dashboard

## 🔄 Fallback Payment Providers

The application supports multiple payment providers with the following priority:

1. **Dodo Payments** (Primary) - Used if configured
2. **LemonSqueezy** (Fallback) - Used if Dodo Payments not configured
3. **Stripe** (Fallback) - Used if neither Dodo Payments nor LemonSqueezy configured

To switch between providers, simply configure the environment variables for your preferred provider. The application will automatically use the first available provider in the priority order.

---

**Note**: This integration assumes Dodo Payments API follows standard REST API patterns. If the actual API structure differs, you may need to adjust the service implementation in `src/lib/services/dodopayments.ts` to match Dodo Payments' specific API format.

