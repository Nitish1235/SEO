'use client'

import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface UsageCardProps {
  title: string
  used: number
  limit: number
  unit?: string
}

export function UsageCard({ title, used, limit, unit = '' }: UsageCardProps) {
  const percentage = limit > 0 ? Math.min((used / limit) * 100, 100) : 0
  const remaining = Math.max(limit - used, 0)

  return (
    <Card className="p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <span className="text-sm font-semibold text-foreground">
          {used} / {limit} {unit}
        </span>
      </div>
      <Progress value={percentage} className="h-2" />
      <p className="mt-2 text-xs text-muted-foreground">
        {remaining} {unit} remaining
      </p>
    </Card>
  )
}

