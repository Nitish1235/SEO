'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PLANS } from '@/lib/config/pricing'
import { Check, RefreshCw } from 'lucide-react'

export default function BillingPage() {
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [subscribing, setSubscribing] = useState<string | null>(null)

  const fetchSubscription = () => {
    setLoading(true)
    fetch('/api/subscription/status')
      .then((res) => res.json())
      .then((data) => {
        setSubscription(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    fetchSubscription()
  }, [])

  const handleSync = async () => {
    setSyncing(true)
    try {
      // Try sync first
      let response = await fetch('/api/subscription/sync', {
        method: 'POST',
      })
      let data = await response.json()
      
      if (!data.success) {
        // If sync fails and user has a subscription, try the simpler fix endpoint
        if (subscription?.plan) {
          console.log('Sync failed, trying fix endpoint...', data)
          response = await fetch('/api/subscription/fix', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ plan: subscription.plan }),
          })
          data = await response.json()
        } else {
          // No subscription exists, sync couldn't find payment
          alert(`No subscription found. Please subscribe to a plan to get started.`)
          setSyncing(false)
          return
        }
      }
      
      if (data.success) {
        const planName = PLANS[data.plan as keyof typeof PLANS]?.name || data.plan
        alert(`Subscription updated successfully! Plan: ${planName}\nLimits: ${data.limits?.analyses} analyses, ${data.limits?.keywords} keywords, ${data.limits?.competitors} competitors`)
        fetchSubscription() // Refresh subscription status
        // Also refresh the page to update usage limits
        setTimeout(() => window.location.reload(), 1000)
      } else {
        alert(`Update failed: ${data.message || data.error}\n\nPlease contact support or try the manual fix script.`)
      }
    } catch (error: any) {
      console.error('Sync error:', error)
      alert(`Failed to sync subscription: ${error.message}\n\nPlease try the fix endpoint or contact support.`)
    } finally {
      setSyncing(false)
    }
  }

  const handleSubscribe = async (planId: string) => {
    setSubscribing(planId)
    try {
      const response = await fetch('/api/subscription/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        setSubscribing(null)
      }
    } catch (error) {
      console.error('Subscription error:', error)
      setSubscribing(null)
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Current Plan</span>
            {subscription?.status && (
              <Badge variant={subscription.status === 'active' ? 'default' : 'destructive'}>
                {subscription.status}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {subscription && subscription.plan ? (
            <>
              <div>
                <p className="text-sm text-muted-foreground">Plan</p>
                <p className="font-semibold text-lg">{PLANS[subscription.plan as keyof typeof PLANS]?.name || subscription.plan}</p>
              </div>
              {(subscription.currentPeriodEnd || subscription.lemonSqueezyCurrentPeriodEnd || subscription.stripeCurrentPeriodEnd) && (
                <div>
                  <p className="text-sm text-muted-foreground">Renews on</p>
                  <p className="font-medium">
                    {new Date(
                      subscription.currentPeriodEnd || 
                      subscription.lemonSqueezyCurrentPeriodEnd || 
                      subscription.stripeCurrentPeriodEnd
                    ).toLocaleDateString()}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div>
              <p className="text-sm text-muted-foreground">No active subscription</p>
              <p className="text-sm text-muted-foreground mt-1">Click "Sync Subscription" to check for payments or subscribe to a plan below.</p>
            </div>
          )}
          <div className="flex gap-2">
            <Button 
              onClick={handleSync} 
              variant={subscription?.plan ? "outline" : "default"}
              disabled={syncing}
            >
              {syncing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sync Subscription
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        {Object.entries(PLANS).map(([key, plan]) => {
          const isSubscribing = subscribing === key
          const isCurrentPlan = subscription?.plan === key
          
          // Different colors for each plan - theme-aware
          const planColors = {
            basic: {
              // Light theme colors
              hover: 'hover:bg-blue-600 hover:text-white hover:border-blue-600 dark:hover:bg-blue-500',
              active: 'active:bg-blue-700 active:scale-95 dark:active:bg-blue-600',
              ring: 'focus:ring-blue-500 focus:ring-2 dark:focus:ring-blue-400',
              gradient: 'hover:shadow-lg hover:shadow-blue-500/50 dark:hover:shadow-blue-400/50',
              // Base colors for light theme
              base: 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-300',
            },
            pro: {
              // Light theme colors
              hover: 'hover:bg-purple-600 hover:text-white hover:border-purple-600 dark:hover:bg-purple-500',
              active: 'active:bg-purple-700 active:scale-95 dark:active:bg-purple-600',
              ring: 'focus:ring-purple-500 focus:ring-2 dark:focus:ring-purple-400',
              gradient: 'hover:shadow-lg hover:shadow-purple-500/50 dark:hover:shadow-purple-400/50',
              // Base colors for light theme
              base: 'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-950 dark:border-purple-800 dark:text-purple-300',
            },
            agency: {
              // Light theme colors
              hover: 'hover:bg-orange-600 hover:text-white hover:border-orange-600 dark:hover:bg-orange-500',
              active: 'active:bg-orange-700 active:scale-95 dark:active:bg-orange-600',
              ring: 'focus:ring-orange-500 focus:ring-2 dark:focus:ring-orange-400',
              gradient: 'hover:shadow-lg hover:shadow-orange-500/50 dark:hover:shadow-orange-400/50',
              // Base colors for light theme
              base: 'bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-950 dark:border-orange-800 dark:text-orange-300',
            },
          }
          
          const colors = planColors[key as keyof typeof planColors] || planColors.basic
          
          return (
            <Card 
              key={key} 
              className={`
                ${key === 'pro' ? 'border-primary border-2 dark:border-primary' : 'border-2'} 
                transition-all duration-300
                hover:shadow-xl hover:shadow-blue-500/20 dark:hover:shadow-blue-500/30
                hover:scale-[1.02]
                hover:border-opacity-100
                ${isCurrentPlan ? 'ring-2 ring-green-500 dark:ring-green-400 shadow-lg' : ''}
                ${key === 'basic' ? 'hover:border-blue-400 dark:hover:border-blue-500' : ''}
                ${key === 'pro' ? 'hover:border-purple-400 dark:hover:border-purple-500' : ''}
                ${key === 'agency' ? 'hover:border-orange-400 dark:hover:border-orange-500' : ''}
              `}
            >
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
                  className={`
                    w-full 
                    group
                    transition-all duration-200 
                    transform
                    hover:scale-105
                    ${isCurrentPlan 
                      ? 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white border-green-600 dark:border-green-700 shadow-md hover:shadow-green-500/50' 
                      : key === 'pro' 
                        ? 'bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 text-white border-purple-600 dark:border-purple-700 shadow-md hover:shadow-purple-500/50'
                        : key === 'basic'
                          ? 'border-blue-500 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 hover:border-blue-600 dark:hover:border-blue-500'
                          : 'border-orange-500 text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-950/50 hover:bg-orange-600 hover:text-white dark:hover:bg-orange-500 hover:border-orange-600 dark:hover:border-orange-500'
                    }
                    ${colors.active}
                    ${colors.ring}
                    ${colors.gradient}
                    ${isSubscribing ? 'opacity-75 cursor-wait' : ''}
                    font-semibold
                    relative
                    overflow-hidden
                    border-2
                    shadow-sm
                    hover:shadow-xl
                    dark:shadow-md
                  `}
                  variant={isCurrentPlan ? 'default' : key === 'pro' ? 'default' : 'outline'}
                  onClick={() => handleSubscribe(key)}
                  disabled={isSubscribing || isCurrentPlan}
                >
                  {isSubscribing ? (
                    <>
                      <span className="inline-block animate-pulse mr-2">⏳</span>
                      Processing...
                    </>
                  ) : isCurrentPlan ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Current Plan
                    </>
                  ) : (
                    <>
                      <span className="relative z-10">Subscribe</span>
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

