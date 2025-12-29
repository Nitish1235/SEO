# Dodo Payments API Flow Documentation

This document describes the end-to-end payment architecture and API flow for Dodo Payments integration, following the official documentation.

## Architecture Overview

```
[Browser / Mobile App]
   |
   | 1) "Buy" -> call your backend
   v
[Your Backend API]  ------------------->  [Your DB]
   | 2) Create Checkout Session                |
   |    POST /checkouts                        |
   v
[Dodo Payments API]  ---> returns { checkout_url, session_id }
   |
   | 3) User is redirected to checkout_url
   v
[Dodo Hosted Checkout Page]
   |
   | 4) Payment attempt
   | 5) Redirect user to your return_url
   v
[Your Frontend Return Page]  (NEVER treat redirect alone as "paid")
   |
   | 6) Wait for backend confirmation
   v
[Your Backend Webhook Endpoint]
   |
   | 7) Receive payment events (payment.succeeded / payment.failed)
   v
[Your DB updated -> provision entitlement]
```

**Key Point**: Your backend + webhooks are the source of truth for "paid". Never grant access solely based on redirect.

## Environment Configuration

### Base URLs
- **Test Mode**: `https://test.dodopayments.com`
- **Live Mode**: `https://live.dodopayments.com`

### Authentication
All API requests require:
```
Authorization: Bearer <DODO_PAYMENTS_API_KEY>
```

### Amounts
Amounts are returned in smallest currency unit:
- USD: cents (e.g., $29.00 = 2900)
- INR: paise (e.g., ₹100.00 = 10000)

## API Flow Steps

### Step 1: Create Products (Setup - One-time)

Before selling, create products in Dodo Payments dashboard:
1. Go to **Products** → **Create Product**
2. Select **Subscription** type for recurring plans
3. Set price, billing period, etc.
4. Copy the **Product ID** (not Plan ID)

**When**: Once during setup, or when adding new SKUs/prices.

### Step 2: Create Checkout Session (Backend → Dodo)

**API**: `POST /checkouts`

**When**: User clicks "Pay / Buy", create session server-side.

**Request Body**:
```json
{
  "product_cart": [
    { "product_id": "prod_123", "quantity": 1 }
  ],
  "customer": {
    "email": "customer@example.com",
    "name": "John Doe"
    // OR attach existing: "customer_id": "cust_123"
  },
  "billing_address": {
    "country": "IN",
    "zipcode": "560001"
  },
  "return_url": "https://yourapp.com/checkout/return",
  "metadata": {
    "order_id": "order_123",
    "user_id": "user_456"
  },
  "allowed_payment_method_types": ["credit", "debit", "upi_collect"]
}
```

**Important**: Always include `credit` and `debit` in `allowed_payment_method_types` as fallback.

**Response**:
```json
{
  "session_id": "sess_123",
  "checkout_url": "https://checkout.dodopayments.com/..."
}
```

### Step 3: Redirect User to Hosted Checkout (Frontend)

**When**: Immediately after backend returns `checkout_url`.

**Frontend Code**:
```javascript
window.location.href = checkout_url
```

### Step 4: User Completes Payment (Dodo Hosted)

Dodo handles:
- Payment method collection
- 3DS authentication if needed
- Payment processing

### Step 5: User Redirected to Return URL (Frontend)

**When**: After success/failure.

**Important**: Treat this as UX only. **Do NOT grant access** solely because browser returned.

**Frontend should**:
- Show loading/processing state
- Poll backend or wait for webhook confirmation
- Display success/failure message based on backend state

### Step 6: Webhook Confirms Payment State (Dodo → Backend)

**When**: Asynchronously after payment processing.

**Events to Handle**:
- `payment.succeeded` - Payment successful
- `payment.failed` - Payment failed
- `subscription.active` - Subscription activated
- `subscription.canceled` - Subscription canceled
- `subscription.expired` - Subscription expired

**Webhook Handler Should**:
1. Verify webhook signature (using webhook secret)
2. Idempotently update DB (avoid double-fulfillment)
3. Provision purchase (unlock content, create license, etc.)
4. Notify frontend (polling endpoint, websocket, etc.)

**Example Webhook Event**:
```json
{
  "type": "payment.succeeded",
  "data": {
    "id": "pay_123",
    "status": "completed",
    "amount": 2900,
    "currency": "USD",
    "customer_id": "cust_123",
    "subscription_id": "sub_123",
    "metadata": {
      "user_id": "user_456"
    }
  }
}
```

### Step 7: Post-Payment Operations (Backend ↔ Dodo)

**Retrieve Payment**:
- `GET /payments/{payment_id}` - Get single payment
- `GET /payments` - List payments (with filters)
- `GET /payments/{payment_id}/line-items` - Get line items

**When**: Admin screens, customer support, reconciliation jobs, or server-side confirmation.

## Implementation in This Codebase

### Service Layer (`src/lib/services/dodopayments.ts`)

- `createCheckout()` - Creates checkout session with proper product_cart format
- `createCustomer()` - Creates or retrieves customer
- `getPayment()` - Retrieves payment details
- `listPayments()` - Lists payments with filters
- `getPaymentLineItems()` - Gets payment line items
- `verifyWebhookSignature()` - Verifies webhook authenticity

### API Routes

- `POST /api/subscription/create-checkout` - Creates checkout session
- `POST /api/dodopayments/webhook` - Handles webhook events

### Key Features

1. **Inline Customer Creation**: Can create customer inline in checkout (simpler)
2. **Metadata Support**: Passes user_id and plan in metadata for webhook processing
3. **Payment Method Fallback**: Always includes credit/debit as fallback
4. **Idempotent Webhooks**: Handles duplicate events safely
5. **Source of Truth**: Webhooks are the authoritative source for payment status

## Testing

### Test Mode
Use `https://test.dodopayments.com` for development and testing.

### Test Cards
Check Dodo Payments documentation for test card numbers.

### Webhook Testing
Use tools like ngrok to expose local webhook endpoint:
```bash
ngrok http 3000
# Use https://your-ngrok-url.ngrok.io/api/dodopayments/webhook
```

## Security Best Practices

1. **Never expose API keys** in client-side code
2. **Always verify webhook signatures** before processing
3. **Use HTTPS** for all webhook endpoints
4. **Implement idempotency** in webhook handlers
5. **Log all webhook events** for debugging and audit
6. **Never trust redirect URLs alone** - always verify via webhook

## References

- [Checkout Sessions API](https://docs.dodopayments.com/api-reference/checkout-sessions/create)
- [Payments API](https://docs.dodopayments.com/api-reference/payments/get-payments)
- [Webhooks Guide](https://docs.dodopayments.com/developer-resources/webhooks)
- [One-time Payments](https://docs.dodopayments.com/features/one-time-payment-products)

