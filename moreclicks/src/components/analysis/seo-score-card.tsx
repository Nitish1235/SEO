'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SEOScoreCardProps {
  score: number
}

export function SEOScoreCard({ score }: SEOScoreCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Needs Improvement'
    return 'Poor'
  }

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle2 className="h-5 w-5 text-green-600" />
    if (score >= 60) return <AlertCircle className="h-5 w-5 text-yellow-600" />
    return <XCircle className="h-5 w-5 text-red-600" />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>SEO Score</span>
          {getScoreIcon(score)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <span className={cn('text-5xl font-bold', getScoreColor(score))}>
                {score}
              </span>
              <span className="text-2xl text-muted-foreground">/ 100</span>
            </div>
            <Badge variant={score >= 80 ? 'default' : score >= 60 ? 'outline' : 'destructive'}>
              {getScoreLabel(score)}
            </Badge>
          </div>
          <div className="relative h-24 w-24">
            <svg className="h-24 w-24 -rotate-90 transform">
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-muted"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${(score / 100) * 251.2} 251.2`}
                className={cn('transition-all', getScoreColor(score))}
              />
            </svg>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

