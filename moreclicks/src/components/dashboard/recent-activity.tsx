'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Search, BarChart3, Users, ExternalLink } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export function RecentActivity() {
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/analyses?limit=3').then((r) => r.json()),
      fetch('/api/keywords/list?limit=3').then((r) => r.json()),
      fetch('/api/competitors/list?limit=3').then((r) => r.json()),
    ])
      .then(([analyses, keywords, competitors]) => {
        const allActivities: any[] = []

        analyses.analyses?.forEach((item: any) => {
          allActivities.push({
            type: 'analysis',
            id: item.id,
            title: item.url,
            subtitle: `SEO Score: ${item.seoScore}`,
            status: item.status,
            createdAt: item.createdAt,
            icon: Search,
            href: `/dashboard/analyze/${item.id}`,
          })
        })

        keywords.keywords?.forEach((item: any) => {
          allActivities.push({
            type: 'keyword',
            id: item.id,
            title: item.keyword,
            subtitle: `Volume: ${item.searchVolume?.toLocaleString() || 'N/A'}`,
            status: item.status,
            createdAt: item.createdAt,
            icon: BarChart3,
            href: `/dashboard/keywords/${item.id}`,
          })
        })

        competitors.competitors?.forEach((item: any) => {
          allActivities.push({
            type: 'competitor',
            id: item.id,
            title: item.sourceKeyword || 'Competitor Analysis',
            subtitle: item.userDomain,
            status: 'completed',
            createdAt: item.createdAt,
            icon: Users,
            href: `/dashboard/competitors/${item.id}`,
          })
        })

        // Sort by date and take top 6
        allActivities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        setActivities(allActivities.slice(0, 6))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No recent activity. Start by analyzing a website or researching keywords.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.map((activity) => {
            const Icon = activity.icon
            return (
              <Link
                key={`${activity.type}-${activity.id}`}
                href={activity.href}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
              >
                <Icon className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm truncate">{activity.title}</p>
                    <Badge
                      variant={
                        activity.status === 'completed'
                          ? 'default'
                          : activity.status === 'processing'
                            ? 'outline'
                            : 'destructive'
                      }
                      className="text-xs"
                    >
                      {activity.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{activity.subtitle}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

