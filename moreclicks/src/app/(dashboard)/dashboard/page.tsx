'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UsageCard } from '@/components/dashboard/usage-card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Search, BarChart3, Users, ArrowRight } from 'lucide-react'
import { RecentActivity } from '@/components/dashboard/recent-activity'

export default function DashboardPage() {
  const { data: session } = useSession()
  const [usage, setUsage] = useState({
    analyses: { used: 0, limit: 3 },
    keywords: { used: 0, limit: 5 },
    competitors: { used: 0, limit: 1 },
  })

  useEffect(() => {
    // Fetch usage data
    fetch('/api/usage')
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setUsage({
            analyses: { used: data.analysesUsed || 0, limit: data.analysesLimit || 3 },
            keywords: { used: data.keywordsUsed || 0, limit: data.keywordsLimit || 5 },
            competitors: { used: data.competitorsUsed || 0, limit: data.competitorsLimit || 1 },
          })
        }
      })
      .catch(console.error)
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back! Analyze your website, research keywords, and track competitors.
        </p>
      </div>

      {/* Usage Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <UsageCard
          title="Website Analyses"
          used={usage.analyses.used}
          limit={usage.analyses.limit}
          unit="analyses"
        />
        <UsageCard
          title="Keyword Research"
          used={usage.keywords.used}
          limit={usage.keywords.limit}
          unit="keywords"
        />
        <UsageCard
          title="Competitor Analysis"
          used={usage.competitors.used}
          limit={usage.competitors.limit}
          unit="analyses"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Analyze Website
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Get a comprehensive SEO audit of your website with 50+ metrics.
            </p>
            <Link href="/dashboard/analyze">
              <Button className="w-full">
                Start Analysis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Keyword Research
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Find high-value keywords with volume, difficulty, and CPC data.
            </p>
            <Link href="/dashboard/keywords">
              <Button className="w-full" variant="outline">
                Research Keywords
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Competitor Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Compare your website with competitors and find opportunities.
            </p>
            <Link href="/dashboard/competitors">
              <Button className="w-full" variant="outline">
                Analyze Competitors
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentActivity />
      </div>
    </div>
  )
}

