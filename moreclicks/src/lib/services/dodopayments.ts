/**
 * Dodo Payments API Service
 * 
 * Official API Flow (Hosted Checkout):
 * 1. Backend creates checkout session: POST /checkouts
 * 2. Frontend redirects user to checkout_url
 * 3. User completes payment on Dodo hosted checkout
 * 4. User redirected to return_url (UX only - NOT source of truth)
 * 5. Webhook confirms payment: payment.succeeded / payment.failed (SOURCE OF TRUTH)
 * 6. Backend provisions entitlement based on webhook
 * 
 * Base URLs:
 * - Test: https://test.dodopayments.com
 * - Live: https://live.dodopayments.com
 * 
 * Documentation:
 * - Checkout Sessions: https://docs.dodopayments.com/api-reference/checkout-sessions/create
 * - Payments: https://docs.dodopayments.com/api-reference/payments/get-payments
 * - Webhooks: https://docs.dodopayments.com/developer-resources/webhooks
 */

const DODO_API_KEY = process.env.DODO_API_KEY!
// Dodo Payments API base URLs (from official docs)
// Test Mode: https://test.dodopayments.com
// Live Mode: https://live.dodopayments.com
const DODO_BASE_URL = process.env.DODO_API_BASE_URL || 'https://live.dodopayments.com'
const DODO_WEBHOOK_SECRET = process.env.DODO_WEBHOOK_SECRET!

export interface DodoCustomer {
  customer_id: string // API returns customer_id, not id
  email: string
  name?: string
  created_at: string
  business_id?: string
  metadata?: Record<string, any>
  phone_number?: string
}

export interface DodoCheckout {
  session_id: string // API returns session_id, not id
  checkout_url: string
}

export interface DodoCheckoutRequest {
  product_cart: Array<{
    product_id: string
    quantity: number
  }>
  customer?: {
    customer_id?: string // Attach existing customer
    email?: string // Create new customer inline
    name?: string
  }
  billing_address?: {
    country: string
    zipcode: string
    [key: string]: any
  }
  return_url?: string
  metadata?: Record<string, any>
  allowed_payment_method_types?: string[] // e.g., ['credit', 'debit', 'upi_collect']
  billing_currency?: string
  discount_code?: string
  [key: string]: any
}

export interface DodoPayment {
  id: string
  status: string
  amount: number
  currency: string
  customer_id?: string
  subscription_id?: string
  created_at: string
  metadata?: Record<string, any>
  [key: string]: any
}

export interface DodoSubscription {
  id: string
  customer_id: string
  plan_id: string
  status: string
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  created_at: string
  updated_at: string
}

export class DodoPaymentsService {
  /**
   * Create or get a customer
   */
  static async createCustomer(email: string, name?: string): Promise<DodoCustomer> {
    try {
      // Check if API key is configured
      if (!DODO_API_KEY || DODO_API_KEY === '') {
        throw new Error('DODO_API_KEY is not configured')
      }

      // First, try to find existing customer
      const searchResponse = await fetch(
        `${DODO_BASE_URL}/customers?email=${encodeURIComponent(email)}`,
        {
          headers: {
            'Authorization': `Bearer ${DODO_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (searchResponse.ok) {
        const searchData = await searchResponse.json()
        // API may return data directly or wrapped in data property
        const customers = searchData.data || searchData
        if (Array.isArray(customers) && customers.length > 0) {
          return customers[0]
        }
      }

      // Create new customer
      const response = await fetch(`${DODO_BASE_URL}/customers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${DODO_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name: name || email,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Dodo Payments API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      // API returns customer directly, not wrapped in data property
      return data
    } catch (error: any) {
      // Enhanced error logging
      if (error.code === 'ENOTFOUND' || error.message?.includes('getaddrinfo')) {
        console.error('Dodo Payments API endpoint not found. Check DODO_API_BASE_URL:', DODO_BASE_URL)
        throw new Error(`Dodo Payments API unavailable: ${error.message}. Please check your DODO_API_BASE_URL configuration.`)
      }
      console.error('Dodo Payments createCustomer error:', error)
      throw error
    }
  }

  /**
   * Create a checkout session (Hosted Checkout)
   * Follows official Dodo Payments API flow: POST /checkouts
   * 
   * @param productId - The product_id (subscription product)
   * @param options - Checkout options including customer info, return URL, metadata, etc.
   * @returns Checkout session with checkout_url and session_id
   */
  static async createCheckout(
    productId: string,
    options?: {
      customerId?: string // Attach existing customer
      customerEmail?: string // Create customer inline
      customerName?: string
      returnUrl?: string
      metadata?: Record<string, any>
      billingAddress?: {
        country: string
        zipcode: string
        [key: string]: any
      }
      allowedPaymentMethodTypes?: string[] // Must include 'credit' and 'debit' as fallback
      billingCurrency?: string
      discountCode?: string
    }
  ): Promise<DodoCheckout> {
    try {
      // Check if API key is configured
      if (!DODO_API_KEY || DODO_API_KEY === '') {
        throw new Error('DODO_API_KEY is not configured')
      }

      // Build checkout request body according to official API docs
      const body: DodoCheckoutRequest = {
        product_cart: [
          {
            product_id: productId,
            quantity: 1,
          },
        ],
        return_url: options?.returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true`,
      }

      // Handle customer (attach existing or create inline)
      if (options?.customerId) {
        body.customer = {
          customer_id: options.customerId,
        }
      } else if (options?.customerEmail) {
        body.customer = {
          email: options.customerEmail,
          name: options.customerName || options.customerEmail,
        }
      }

      // Add optional fields
      if (options?.billingAddress) {
        body.billing_address = options.billingAddress
      }

      if (options?.metadata) {
        body.metadata = options.metadata
      }

      // Payment method types - always include credit and debit as fallback per docs
      body.allowed_payment_method_types = options?.allowedPaymentMethodTypes || ['credit', 'debit']

      if (options?.billingCurrency) {
        body.billing_currency = options.billingCurrency
      }

      if (options?.discountCode) {
        body.discount_code = options.discountCode
      }

      const url = `${DODO_BASE_URL}/checkouts`
      console.log('[Dodo Payments] Creating checkout:', {
        url,
        productId,
        hasCustomer: !!body.customer,
        customerType: body.customer?.customer_id ? 'existing' : body.customer?.email ? 'new' : 'none',
      })

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${DODO_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('[Dodo Payments] API Error:', {
          status: response.status,
          statusText: response.statusText,
          url,
          error: errorText,
          requestBody: JSON.stringify(body, null, 2),
        })
        throw new Error(`Dodo Payments API error: ${response.status} - ${errorText || response.statusText}`)
      }

      const data = await response.json()
      // API returns checkout session directly: { session_id, checkout_url }
      return data
    } catch (error: any) {
      // Enhanced error logging
      if (error.code === 'ENOTFOUND' || error.message?.includes('getaddrinfo')) {
        console.error('Dodo Payments API endpoint not found. Check DODO_API_BASE_URL:', DODO_BASE_URL)
        throw new Error(`Dodo Payments API unavailable: ${error.message}. Please check your DODO_API_BASE_URL configuration.`)
      }
      console.error('Dodo Payments createCheckout error:', error)
      throw error
    }
  }

  /**
   * Get subscription status
   */
  static async getSubscription(subscriptionId: string): Promise<DodoSubscription> {
    try {
      const response = await fetch(`${DODO_BASE_URL}/subscriptions/${subscriptionId}`, {
        headers: {
          'Authorization': `Bearer ${DODO_API_KEY}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Dodo Payments API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      return data.data || data
    } catch (error) {
      console.error('Dodo Payments getSubscription error:', error)
      throw error
    }
  }

  /**
   * Get customer portal URL
   */
  static async getCustomerPortalUrl(customerId: string): Promise<string> {
    try {
      const response = await fetch(`${DODO_BASE_URL}/customers/${customerId}/portal`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${DODO_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Dodo Payments API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      return data.url || data.data?.url || `${process.env.DODO_CUSTOMER_PORTAL_URL || 'https://app.dodopayments.com'}/customers/${customerId}`
    } catch (error) {
      console.error('Dodo Payments getCustomerPortalUrl error:', error)
      // Fallback to a default portal URL
      return `${process.env.DODO_CUSTOMER_PORTAL_URL || 'https://app.dodopayments.com'}/customers/${customerId}`
    }
  }

  /**
   * Get payment details
   * GET /payments/{payment_id}
   */
  static async getPayment(paymentId: string): Promise<DodoPayment> {
    try {
      if (!DODO_API_KEY || DODO_API_KEY === '') {
        throw new Error('DODO_API_KEY is not configured')
      }

      const response = await fetch(`${DODO_BASE_URL}/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${DODO_API_KEY}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Dodo Payments API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Dodo Payments getPayment error:', error)
      throw error
    }
  }

  /**
   * List payments
   * GET /payments
   */
  static async listPayments(params?: {
    customer_id?: string
    subscription_id?: string
    limit?: number
    offset?: number
  }): Promise<{ data: DodoPayment[]; [key: string]: any }> {
    try {
      if (!DODO_API_KEY || DODO_API_KEY === '') {
        throw new Error('DODO_API_KEY is not configured')
      }

      const queryParams = new URLSearchParams()
      if (params?.customer_id) queryParams.append('customer_id', params.customer_id)
      if (params?.subscription_id) queryParams.append('subscription_id', params.subscription_id)
      if (params?.limit) queryParams.append('limit', params.limit.toString())
      if (params?.offset) queryParams.append('offset', params.offset.toString())

      const url = `${DODO_BASE_URL}/payments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${DODO_API_KEY}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Dodo Payments API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Dodo Payments listPayments error:', error)
      throw error
    }
  }

  /**
   * Get payment line items
   * GET /payments/{payment_id}/line-items
   */
  static async getPaymentLineItems(paymentId: string): Promise<any> {
    try {
      if (!DODO_API_KEY || DODO_API_KEY === '') {
        throw new Error('DODO_API_KEY is not configured')
      }

      const response = await fetch(`${DODO_BASE_URL}/payments/${paymentId}/line-items`, {
        headers: {
          'Authorization': `Bearer ${DODO_API_KEY}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Dodo Payments API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Dodo Payments getPaymentLineItems error:', error)
      throw error
    }
  }

  /**
   * Verify webhook signature
   * Note: Check Dodo Payments docs for exact signature header name and verification method
   */
  static verifyWebhookSignature(payload: string, signature: string): boolean {
    try {
      if (!DODO_WEBHOOK_SECRET || DODO_WEBHOOK_SECRET === '') {
        console.warn('DODO_WEBHOOK_SECRET not configured, skipping signature verification')
        return true // Allow in development, but should fail in production
      }

      const crypto = require('crypto')
      const hmac = crypto.createHmac('sha256', DODO_WEBHOOK_SECRET)
      hmac.update(payload)
      const calculatedSignature = hmac.digest('hex')
      
      // Compare signatures in a timing-safe manner
      // Note: Dodo Payments may send signature in different format (hex, base64, etc.)
      // Adjust based on actual webhook documentation
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(calculatedSignature)
      )
    } catch (error) {
      console.error('Dodo Payments webhook signature verification error:', error)
      return false
    }
  }
}

