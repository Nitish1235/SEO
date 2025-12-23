'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Loader2, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default function CompetitorAnalysisResultsPage() {
  const params = useParams()
  const router = useRouter()
  const [analysis, setAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetch(`/api/competitors/${params.id}`)
        .then((res) => res.json())
        .then((data) => {
          setAnalysis(data)
          setLoading(false)
        })
        .catch((err) => {
          console.error(err)
          setLoading(false)
        })
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">Competitor analysis not found</p>
        <Link href="/dashboard/competitors">
          <Button>Start New Analysis</Button>
        </Link>
      </div>
    )
  }

  const comparison = typeof analysis.comparison === 'object' ? analysis.comparison : {}
  const competitors = Array.isArray(analysis.competitors) ? analysis.competitors : []

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/competitors">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Competitor Analysis</h1>
          <p className="text-muted-foreground mt-2">
            Keyword: <strong>{analysis.sourceKeyword}</strong> | Your URL: <strong>{analysis.userUrl}</strong>
          </p>
        </div>
      </div>

      {/* Your Website */}
      {comparison.user && (
        <Card>
          <CardHeader>
            <CardTitle>Your Website</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <p className="text-sm text-muted-foreground">Title</p>
                <p className="font-medium mt-1">{comparison.user.title || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Word Count</p>
                <p className="font-medium mt-1">{comparison.user.wordCount?.toLocaleString() || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">H1 Tags</p>
                <p className="font-medium mt-1">{comparison.user.h1Count || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">H2 Tags</p>
                <p className="font-medium mt-1">{comparison.user.h2Count || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Internal Links</p>
                <p className="font-medium mt-1">{comparison.user.internalLinks || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">External Links</p>
                <p className="font-medium mt-1">{comparison.user.externalLinks || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Images</p>
                <p className="font-medium mt-1">{comparison.user.imagesCount || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Competitors */}
      {competitors.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Competitors ({competitors.length})</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {competitors.map((competitor: any, index: number) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-lg">{competitor.domain}</span>
                    <a
                      href={competitor.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Title</p>
                      <p className="font-medium mt-1 text-sm">{competitor.title || 'N/A'}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Words</p>
                        <p className="font-medium">{competitor.wordCount?.toLocaleString() || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">H1</p>
                        <p className="font-medium">{competitor.h1Count || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">H2</p>
                        <p className="font-medium">{competitor.h2Count || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Int. Links</p>
                        <p className="font-medium">{competitor.internalLinks || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Ext. Links</p>
                        <p className="font-medium">{competitor.externalLinks || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Images</p>
                        <p className="font-medium">{competitor.imagesCount || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Comparison Averages */}
      {comparison.averages && (
        <Card>
          <CardHeader>
            <CardTitle>Industry Averages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Word Count</p>
                <p className="font-medium mt-1">{Math.round(comparison.averages.wordCount || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. H1 Tags</p>
                <p className="font-medium mt-1">{Math.round(comparison.averages.h1Count || 0)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. H2 Tags</p>
                <p className="font-medium mt-1">{Math.round(comparison.averages.h2Count || 0)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Internal Links</p>
                <p className="font-medium mt-1">{Math.round(comparison.averages.internalLinks || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

