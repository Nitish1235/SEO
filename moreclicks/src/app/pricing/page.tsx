import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import { PLANS } from '@/lib/config/pricing'
import Link from 'next/link'

export default function PricingPage() {
  return (
    <div className="container mx-auto px-6 py-20">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          <span className="gradient-text-4">Pricing</span>
          <span className="block gradient-text mt-2">Plans</span>
        </h1>
        <p className="text-xl font-bold text-purple-600 tracking-wide">
          Choose the plan that fits your needs
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
        {Object.entries(PLANS).map(([key, plan]) => (
          <Card key={key} className={key === 'pro' ? 'border-primary border-2' : ''}>
            <CardHeader>
              <CardTitle className={`text-2xl ${key === 'basic' ? 'gradient-text' : key === 'pro' ? 'gradient-text-2' : 'gradient-text-3'}`}>{plan.name}</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold text-purple-600">${plan.price}</span>
                <span className="text-purple-500 font-medium">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-purple-600 font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Link href="/dashboard/billing" className="w-full">
                <Button className="w-full" variant={key === 'pro' ? 'default' : 'outline'}>
                  {key === 'agency' ? 'Contact Sales' : 'Get Started'}
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

