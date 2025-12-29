# Stripe Payment Setup Guide

This guide will walk you through setting up Stripe as a payment provider for your SEO Analyzer SaaS application. While LemonSqueezy is the primary provider, Stripe can be used as a fallback or alternative.

## 📋 Prerequisites

1. A Stripe account (sign up at https://stripe.com)
2. Your application deployed or running locally
3. Access to your environment variables
4. A domain name (for webhooks in production)

## 🚀 Step-by-Step Setup

### Step 1: Create a Stripe Account

1. Go to https://stripe.com
2. Click **"Start now"** or **"Sign in"**
3. Complete the account creation process
4. Verify your email address
5. Complete business information (you can use test mode initially)

### Step 2: Activate Your Account

1. In the Stripe Dashboard, you'll see prompts to activate your account
2. For testing, you can use **Test Mode** (toggle in the top right)
3. For production, complete:
   - Business information
   - Bank account details
   - Identity verification
   - Tax information

### Step 3: Get Your API Keys

1. Go to **Developers** → **API keys** in the Stripe Dashboard
2. You'll see two keys:
   - **Publishable key** (starts with `pk_test_` or `pk_live_`)
   - **Secret key** (starts with `sk_test_` or `sk_live_`)

3. **For Testing:**
   - Use the **Test mode** keys (toggle in top right)
   - Copy the **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Copy the **Secret key** → `STRIPE_SECRET_KEY`
   - ⚠️ **Important**: Never expose your secret key publicly!

4. **For Production:**
   - Switch to **Live mode** (toggle in top right)
   - Copy the live keys
   - Update your production environment variables

### Step 4: Create Products and Prices

You need to create 3 products (one for each plan: Basic, Pro, Agency) with recurring prices.

#### For Basic Plan ($29/month):

1. Go to **Products** → **Add product**
2. Fill in the form:
   - **Name**: "SEO Analyzer - Basic Plan"
   - **Description**: "Basic SEO analysis subscription - 10 analyses, 25 keywords, 3 competitors per month"
   - **Pricing model**: Recurring
   - **Price**: $29.00 USD
   - **Billing period**: Monthly
   - **Recurring**: Yes
3. Click **Save product**
4. After saving, you'll see the **Price ID** (starts with `price_`)
5. **Copy the Price ID** → This is your `STRIPE_PRICE_BASIC`

#### For Pro Plan ($49/month):

1. Click **Add product** again
2. Fill in:
   - **Name**: "SEO Analyzer - Pro Plan"
   - **Description**: "Pro SEO analysis subscription - 25 analyses, 100 keywords, 10 competitors per month"
   - **Pricing model**: Recurring
   - **Price**: $49.00 USD
   - **Billing period**: Monthly
   - **Recurring**: Yes
3. Click **Save product**
4. **Copy the Price ID** → This is your `STRIPE_PRICE_PRO`

#### For Agency Plan ($129/month):

1. Click **Add product** again
2. Fill in:
   - **Name**: "SEO Analyzer - Agency Plan"
   - **Description**: "Agency SEO analysis subscription - 75 analyses, 500 keywords, 50 competitors per month"
   - **Pricing model**: Recurring
   - **Price**: $129.00 USD
   - **Billing period**: Monthly
   - **Recurring**: Yes
3. Click **Save product**
4. **Copy the Price ID** → This is your `STRIPE_PRICE_AGENCY`

### Step 5: Set Up Billing Portal

The billing portal allows customers to manage their subscriptions.

1. Go to **Settings** → **Billing** → **Customer portal**
2. Click **Activate test link** (for testing) or **Activate link** (for production)
3. Configure portal settings:
   - **Business information**: Add your business name and support email
   - **Features**: Enable what customers can do:
     - ✅ Update payment method
     - ✅ Cancel subscription
     - ✅ Update billing information
     - ✅ View invoices
   - **Branding**: Customize colors and logo (optional)
4. Click **Save changes**

### Step 6: Set Up Webhooks

Webhooks notify your application about subscription events.

#### For Production:

1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. **Endpoint URL**: `https://yourdomain.com/api/webhooks/stripe`
   - Replace `yourdomain.com` with your actual domain
4. **Description**: "SEO Analyzer Subscription Webhooks"
5. **Events to send**: Click **"Select events"** and choose:
   - `checkout.session.completed` - When checkout is completed
   - `customer.subscription.created` - When subscription is created
   - `customer.subscription.updated` - When subscription is updated
   - `customer.subscription.deleted` - When subscription is cancelled
   - `invoice.payment_succeeded` - When payment succeeds
   - `invoice.payment_failed` - When payment fails
6. Click **Add endpoint**
7. **Copy the Signing secret** (starts with `whsec_`)
   - This is your `STRIPE_WEBHOOK_SECRET`
   - ⚠️ **Important**: Store this securely!

#### For Local Development:

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login to Stripe CLI:
   ```bash
   stripe login
   ```
3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
4. The CLI will show a webhook signing secret (starts with `whsec_`)
5. Use this secret in your `.env.local` for local testing

### Step 7: Configure Environment Variables

Add the following to your `.env.local` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY="sk_test_your_secret_key_here"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_publishable_key_here"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret_here"

# Stripe Price IDs for each plan
STRIPE_PRICE_BASIC="price_your_basic_price_id"
STRIPE_PRICE_PRO="price_your_pro_price_id"
STRIPE_PRICE_AGENCY="price_your_agency_price_id"
```

### Step 8: Update Your Application

The application already has Stripe integration in the following routes:

- ✅ `/api/subscription/create-checkout` - Creates Stripe checkout (fallback if LemonSqueezy not configured)
- ✅ `/api/subscription/portal` - Creates Stripe billing portal session (fallback)
- ✅ `/api/subscription/status` - Returns subscription status (supports Stripe)
- ✅ `/api/webhooks/stripe` - Handles webhook events

**Note**: The application is currently configured to use LemonSqueezy as primary. To make Stripe primary, you would need to update the checkout and portal routes to prioritize Stripe.

### Step 9: Test the Integration

#### Test Checkout Flow:

1. Start your application: `npm run dev`
2. Sign in to your dashboard
3. Go to **Billing** page
4. Click **Subscribe** on any plan
5. You should be redirected to Stripe checkout
6. Use Stripe test card numbers:
   - **Success**: `4242 4242 4242 4242`
   - **Decline**: `4000 0000 0000 0002`
   - **3D Secure**: `4000 0025 0000 3155`
7. Use any future expiry date (e.g., 12/25)
8. Use any 3-digit CVC (e.g., 123)
9. Use any postal code
10. Complete the checkout
11. Verify you're redirected back to your app with `?success=true`

#### Test Webhook (Local):

1. Start your local server: `npm run dev`
2. In another terminal, run:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
3. Complete a test checkout
4. Watch the terminal for webhook events
5. Check your application logs to verify webhook processing
6. Verify the subscription was created in your database

#### Test Webhook (Production):

1. Complete a test checkout in production
2. Go to **Developers** → **Webhooks** → Your webhook
3. Click on **Events** tab
4. Verify events were received and processed
5. Check for any failed events (red indicators)
6. Verify subscription in your database

#### Test Billing Portal:

1. With an active subscription, go to **Billing** page
2. Click **Manage Billing**
3. You should be redirected to Stripe billing portal
4. Test updating payment method
5. Test viewing invoices
6. Test canceling subscription (you can reactivate later)

## 🔍 Verification Checklist

- [ ] Stripe account created and activated
- [ ] Test mode API keys obtained
- [ ] 3 products created (Basic, Pro, Agency)
- [ ] Price IDs copied for all 3 plans
- [ ] Billing portal activated
- [ ] Webhook endpoint created
- [ ] Webhook signing secret copied
- [ ] All environment variables set in `.env.local`
- [ ] Application restarted after adding env variables
- [ ] Checkout flow tested successfully
- [ ] Webhook tested and verified (local or production)
- [ ] Subscription appears in database after checkout
- [ ] Billing portal accessible and functional

## 📝 Environment Variables Reference

| Variable | Description | Where to Find |
|----------|-------------|---------------|
| `STRIPE_SECRET_KEY` | Secret API key for server-side operations | Developers → API keys → Secret key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Publishable key for client-side | Developers → API keys → Publishable key |
| `STRIPE_WEBHOOK_SECRET` | Secret for webhook signature verification | Developers → Webhooks → Your endpoint → Signing secret |
| `STRIPE_PRICE_BASIC` | Price ID for Basic plan | Products → Basic Plan → Price ID |
| `STRIPE_PRICE_PRO` | Price ID for Pro plan | Products → Pro Plan → Price ID |
| `STRIPE_PRICE_AGENCY` | Price ID for Agency plan | Products → Agency Plan → Price ID |

## 🧪 Test Card Numbers

Stripe provides test card numbers for different scenarios:

| Card Number | Scenario |
|-------------|----------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 0002` | Card declined |
| `4000 0025 0000 3155` | 3D Secure authentication required |
| `4000 0000 0000 9995` | Insufficient funds |
| `4000 0000 0000 3220` | Requires authentication |

**For all test cards:**
- Use any future expiry date (e.g., 12/25)
- Use any 3-digit CVC (e.g., 123)
- Use any postal code

## 🐛 Troubleshooting

### Checkout Not Working

**Issue**: Checkout page doesn't load or redirect fails

**Solutions:**
- Verify `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` are set
- Check that price IDs match your Stripe products
- Ensure you're using test keys in test mode and live keys in live mode
- Check browser console for JavaScript errors
- Verify `NEXT_PUBLIC_APP_URL` is set correctly

### Webhook Not Receiving Events

**Issue**: Webhooks not being received or processed

**Solutions:**
- Verify webhook URL is correct and accessible
- Check that webhook secret matches in environment variables
- Ensure webhook events are selected in Stripe dashboard
- For local development, use Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- Check webhook endpoint logs for errors
- Verify webhook signature verification is working

### Subscription Not Created After Checkout

**Issue**: Checkout succeeds but subscription not in database

**Solutions:**
- Check webhook logs in Stripe dashboard
- Verify webhook endpoint is receiving requests
- Check application logs for webhook processing errors
- Verify database connection is working
- Check that `checkout.session.completed` event is selected
- Verify webhook signature verification

### Payment Method Update Fails

**Issue**: Can't update payment method in billing portal

**Solutions:**
- Verify billing portal is activated in Stripe dashboard
- Check that customer has an active subscription
- Ensure `STRIPE_SECRET_KEY` has proper permissions
- Verify customer ID is correctly stored in database

### Test Mode vs Live Mode Issues

**Issue**: Confusion between test and live modes

**Solutions:**
- Always use test mode keys for development
- Switch to live mode only in production
- Test mode and live mode have separate:
  - API keys
  - Products and prices
  - Webhooks
  - Customers
- Never mix test and live keys

## 🔐 Security Best Practices

1. **Never commit** API keys or secrets to version control
2. Use environment variables for all sensitive data
3. Keep your webhook secret secure
4. Regularly rotate API keys
5. Monitor webhook events for suspicious activity
6. Use HTTPS for all webhook endpoints
7. Verify webhook signatures before processing
8. Implement rate limiting on webhook endpoints
9. Log all webhook events for auditing
10. Use test mode for all development

## 📊 Monitoring and Analytics

### Stripe Dashboard Features:

1. **Payments**: Monitor successful and failed payments
2. **Subscriptions**: View all active subscriptions
3. **Customers**: Manage customer information
4. **Webhooks**: Monitor webhook delivery and failures
5. **Events**: View all API events
6. **Logs**: Check API request logs

### Key Metrics to Monitor:

- Subscription creation rate
- Payment success rate
- Failed payment rate
- Churn rate (cancellations)
- Monthly recurring revenue (MRR)
- Customer lifetime value (LTV)

## 🔄 Switching Between Test and Live Mode

### Before Going Live:

1. ✅ Test all checkout flows thoroughly
2. ✅ Test webhook processing
3. ✅ Test subscription management
4. ✅ Test billing portal
5. ✅ Verify all environment variables are updated
6. ✅ Update webhook URLs to production
7. ✅ Test with real payment methods (small amounts)
8. ✅ Monitor for errors

### Switching Steps:

1. **Update Environment Variables:**
   - Replace test keys with live keys
   - Update webhook secret
   - Update price IDs (if different)

2. **Update Webhook Endpoint:**
   - Create new webhook endpoint in live mode
   - Update webhook URL to production domain
   - Copy new webhook secret

3. **Test in Production:**
   - Complete a test checkout
   - Verify webhook processing
   - Check subscription creation

## 📚 Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Stripe Billing Portal](https://stripe.com/docs/billing/subscriptions/integrating-customer-portal)
- [Stripe Checkout](https://stripe.com/docs/payments/checkout)

## 🆘 Getting Help

If you encounter issues:

1. Check Stripe Dashboard → **Developers** → **Logs** for API errors
2. Review webhook event details in Stripe Dashboard
3. Check application logs for errors
4. Use Stripe's test mode to debug issues
5. Consult Stripe documentation
6. Contact Stripe support if needed

## ✅ Next Steps

After completing the setup:

1. Test the full subscription flow end-to-end
2. Monitor webhook events in production
3. Set up error alerts for failed payments
4. Configure email notifications for subscription events
5. Test subscription cancellation and renewal flows
6. Set up analytics to track subscription metrics
7. Implement dunning management for failed payments
8. Create customer support workflows

---

**Note**: This application currently uses LemonSqueezy as the primary payment provider. Stripe is available as a fallback. To make Stripe the primary provider, update the checkout and portal routes to prioritize Stripe over LemonSqueezy.

