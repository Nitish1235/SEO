'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Metric {
  name: string
  status: 'pass' | 'warning' | 'critical'
  value: string | number
  recommendation: string
}

interface MetricsGridProps {
  metrics: Metric[]
}

export function MetricsGrid({ metrics }: MetricsGridProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pass':
        return <Badge className="bg-green-100 text-green-800">Pass</Badge>
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
      case 'critical':
        return <Badge className="bg-red-100 text-red-800">Critical</Badge>
      default:
        return null
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {metrics.map((metric, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              <span>{metric.name}</span>
              {getStatusIcon(metric.status)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Value</span>
              {getStatusBadge(metric.status)}
            </div>
            <p className="text-lg font-semibold">{metric.value}</p>
            <p className="text-xs text-muted-foreground">{metric.recommendation}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

