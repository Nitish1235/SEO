'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PLANS } from '@/lib/config/pricing'
import { Check, ExternalLink } from 'lucide-react'

export default function BillingPage() {
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/subscription/status')
      .then((res) => res.json())
      .then((data) => {
        setSubscription(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleSubscribe = async (planId: string) => {
    try {
      const response = await fetch('/api/subscription/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Subscription error:', error)
    }
  }

  const handleManageBilling = async () => {
    try {
      const response = await fetch('/api/subscription/portal', {
        method: 'POST',
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Billing portal error:', error)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Billing & Subscription</h1>
        <p className="text-muted-foreground mt-2">
          Manage your subscription and billing information.
        </p>
      </div>

      {subscription && subscription.plan && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Current Plan</span>
              <Badge variant={subscription.status === 'active' ? 'default' : 'destructive'}>
                {subscription.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Plan</p>
              <p className="font-semibold text-lg">{PLANS[subscription.plan as keyof typeof PLANS]?.name || subscription.plan}</p>
            </div>
            {subscription.stripeCurrentPeriodEnd && (
              <div>
                <p className="text-sm text-muted-foreground">Renews on</p>
                <p className="font-medium">
                  {new Date(subscription.stripeCurrentPeriodEnd).toLocaleDateString()}
                </p>
              </div>
            )}
            <Button onClick={handleManageBilling} variant="outline">
              Manage Billing
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {Object.entries(PLANS).map(([key, plan]) => (
          <Card key={key} className={key === 'pro' ? 'border-primary border-2' : ''}>
            <CardHeader>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="w-full"
                variant={key === 'pro' ? 'default' : 'outline'}
                onClick={() => handleSubscribe(key)}
              >
                Subscribe
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

