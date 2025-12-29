'use client'

import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ArrowLeft, Search, ExternalLink } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { SearchInput } from '@/components/shared/search-input'

export default function AnalysisHistoryPage() {
  const [analyses, setAnalyses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetch('/api/analyses?limit=50')
      .then((res) => res.json())
      .then((data) => {
        setAnalyses(data.analyses || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filteredAnalyses = useMemo(() => {
    if (!searchQuery) return analyses
    const query = searchQuery.toLowerCase()
    return analyses.filter(
      (analysis) =>
        analysis.url.toLowerCase().includes(query) ||
        analysis.domain.toLowerCase().includes(query)
    )
  }, [analyses, searchQuery])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/analyze">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analysis History</h1>
          <p className="text-muted-foreground mt-2">View all your website analyses</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <SearchInput
          placeholder="Search by URL or domain..."
          value={searchQuery}
          onSearch={setSearchQuery}
          className="max-w-md"
        />
        {filteredAnalyses.length !== analyses.length && (
          <span className="text-sm text-muted-foreground">
            Showing {filteredAnalyses.length} of {analyses.length}
          </span>
        )}
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
      ) : filteredAnalyses.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No analyses yet</h3>
            <p className="text-muted-foreground mb-4">
              Start by analyzing a website to see results here.
            </p>
            <Link href="/dashboard/analyze">
              <Button>Start New Analysis</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredAnalyses.map((analysis) => (
            <Card key={analysis.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{analysis.domain}</h3>
                      <Badge
                        variant={
                          analysis.status === 'completed'
                            ? 'default'
                            : analysis.status === 'processing'
                              ? 'outline'
                              : 'destructive'
                        }
                      >
                        {analysis.status}
                      </Badge>
                    </div>
                    <a
                      href={analysis.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
                    >
                      {analysis.url}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <span>SEO Score: {analysis.seoScore || 'N/A'}</span>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(analysis.createdAt), { addSuffix: true })}</span>
                    </div>
                  </div>
                  {analysis.status === 'completed' && (
                    <Link href={`/dashboard/analyze/${analysis.id}`}>
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

