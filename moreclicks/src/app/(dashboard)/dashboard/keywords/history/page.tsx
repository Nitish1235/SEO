'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ArrowLeft, BarChart3 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function KeywordsHistoryPage() {
  const [keywords, setKeywords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/keywords/list?limit=50')
      .then((res) => res.json())
      .then((data) => {
        setKeywords(data.keywords || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/keywords">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Keyword Research History</h1>
          <p className="text-muted-foreground mt-2">View all your keyword research</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-20 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : keywords.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No keyword research yet</h3>
            <p className="text-muted-foreground mb-4">
              Start by researching a keyword to see results here.
            </p>
            <Link href="/dashboard/keywords">
              <Button>Start New Research</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {keywords.map((keyword) => (
            <Card key={keyword.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{keyword.keyword}</h3>
                      <Badge
                        variant={
                          keyword.status === 'completed'
                            ? 'default'
                            : keyword.status === 'processing'
                              ? 'outline'
                              : 'destructive'
                        }
                      >
                        {keyword.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <span>Volume: {keyword.searchVolume?.toLocaleString() || 'N/A'}</span>
                      <span>•</span>
                      <span>Difficulty: {keyword.keywordDifficulty || 'N/A'}</span>
                      <span>•</span>
                      <span>CPC: ${keyword.cpc?.toFixed(2) || 'N/A'}</span>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(keyword.createdAt), { addSuffix: true })}</span>
                    </div>
                  </div>
                  {keyword.status === 'completed' && (
                    <Link href={`/dashboard/keywords/${keyword.id}`}>
                      <Button variant="outline">View Results</Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

