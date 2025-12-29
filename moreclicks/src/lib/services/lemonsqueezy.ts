/**
 * LemonSqueezy API Service
 * Handles customer creation, checkout, webhooks, and subscription management
 */

const LEMONSQUEEZY_API_KEY = process.env.LEMONSQUEEZY_API_KEY!
const LEMONSQUEEZY_STORE_ID = process.env.LEMONSQUEEZY_STORE_ID!
const LEMONSQUEEZY_BASE_URL = 'https://api.lemonsqueezy.com/v1'
const LEMONSQUEEZY_WEBHOOK_SECRET = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!

export interface LemonSqueezyCustomer {
  id: string
  type: string
  attributes: {
    name: string
    email: string
    status: string
    city: string | null
    region: string | null
    country: string
    total_revenue_currency: number
    mrr: number
    status_formatted: string
    country_formatted: string
    total_revenue_currency_formatted: string
    mrr_formatted: string
    created_at: string
    updated_at: string
    test_mode: boolean
  }
}

export interface LemonSqueezyCheckout {
  id: string
  type: string
  attributes: {
    store_id: number
    variant_id: number
    custom_price: number | null
    product_options: any
    checkout_options: any
    checkout_data: any
    preview: boolean
    test_mode: boolean
    expiration: string | null
    payment_button_text: string
    product_name: string
    product_description: string | null
    discount_code: string | null
    created_at: string
    updated_at: string
    url: string
  }
}

export interface LemonSqueezySubscription {
  id: string
  type: string
  attributes: {
    store_id: number
    customer_id: number
    order_id: number
    order_item_id: number
    product_id: number
    variant_id: number
    product_name: string
    variant_name: string
    user_name: string
    user_email: string
    status: string
    status_formatted: string
    card_brand: string | null
    card_last_four: string | null
    pause: any | null
    cancelled: boolean
    trial_ends_at: string | null
    billing_anchor: number
    urls: {
      update_payment_method: string
      customer_portal: string
    }
    renews_at: string
    ends_at: string | null
    created_at: string
    updated_at: string
    test_mode: boolean
  }
}

export class LemonSqueezyService {
  /**
   * Create or get a customer
   */
  static async createCustomer(email: string, name?: string): Promise<LemonSqueezyCustomer> {
    try {
      // First, try to find existing customer
      const searchResponse = await fetch(
        `${LEMONSQUEEZY_BASE_URL}/customers?filter[email]=${encodeURIComponent(email)}`,
        {
          headers: {
            'Authorization': `Bearer ${LEMONSQUEEZY_API_KEY}`,
            'Accept': 'application/vnd.api+json',
            'Content-Type': 'application/vnd.api+json',
          },
        }
      )

      if (searchResponse.ok) {
        const searchData = await searchResponse.json()
        if (searchData.data && searchData.data.length > 0) {
          return searchData.data[0]
        }
      }

      // Create new customer
      const response = await fetch(`${LEMONSQUEEZY_BASE_URL}/customers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LEMONSQUEEZY_API_KEY}`,
          'Accept': 'application/vnd.api+json',
          'Content-Type': 'application/vnd.api+json',
        },
        body: JSON.stringify({
          data: {
            type: 'customers',
            attributes: {
              email,
              name: name || email,
            },
            relationships: {
              store: {
                data: {
                  type: 'stores',
                  id: LEMONSQUEEZY_STORE_ID,
                },
              },
            },
          },
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`LemonSqueezy API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      return data.data
    } catch (error) {
      console.error('LemonSqueezy createCustomer error:', error)
      throw error
    }
  }

  /**
   * Create a checkout URL
   */
  static async createCheckout(
    variantId: string,
    customerId?: string,
    customPrice?: number
  ): Promise<LemonSqueezyCheckout> {
    try {
      const body: any = {
        data: {
          type: 'checkouts',
          attributes: {
            custom_price: customPrice || null,
            product_options: {
              name: 'SEO Analysis Subscription',
              description: 'Advanced SEO analysis and optimization tools',
            },
            checkout_options: {
              embed: false,
              media: false,
              logo: true,
              desc: true,
              discount: true,
              dark: false,
              subscription_preview: true,
            },
            checkout_data: {
              email: customerId ? undefined : undefined, // Will be set by customer
              custom: {},
            },
            preview: false,
            test_mode: process.env.NODE_ENV !== 'production',
          },
          relationships: {
            store: {
              data: {
                type: 'stores',
                id: LEMONSQUEEZY_STORE_ID,
              },
            },
            variant: {
              data: {
                type: 'variants',
                id: variantId,
              },
            },
          },
        },
      }

      if (customerId) {
        body.data.relationships.customer = {
          data: {
            type: 'customers',
            id: customerId,
          },
        }
      }

      const response = await fetch(`${LEMONSQUEEZY_BASE_URL}/checkouts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LEMONSQUEEZY_API_KEY}`,
          'Accept': 'application/vnd.api+json',
          'Content-Type': 'application/vnd.api+json',
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`LemonSqueezy API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      return data.data
    } catch (error) {
      console.error('LemonSqueezy createCheckout error:', error)
      throw error
    }
  }

  /**
   * Get subscription status
   */
  static async getSubscription(subscriptionId: string): Promise<LemonSqueezySubscription> {
    try {
      const response = await fetch(`${LEMONSQUEEZY_BASE_URL}/subscriptions/${subscriptionId}`, {
        headers: {
          'Authorization': `Bearer ${LEMONSQUEEZY_API_KEY}`,
          'Accept': 'application/vnd.api+json',
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`LemonSqueezy API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      return data.data
    } catch (error) {
      console.error('LemonSqueezy getSubscription error:', error)
      throw error
    }
  }

  /**
   * Verify webhook signature
   */
  static verifyWebhookSignature(payload: string, signature: string): boolean {
    const crypto = require('crypto')
    const hmac = crypto.createHmac('sha256', LEMONSQUEEZY_WEBHOOK_SECRET)
    hmac.update(payload)
    const calculatedSignature = hmac.digest('hex')
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(calculatedSignature)
    )
  }
}

