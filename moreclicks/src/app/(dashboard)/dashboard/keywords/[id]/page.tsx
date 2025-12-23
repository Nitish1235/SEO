'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Loader2, TrendingUp, DollarSign, Users } from 'lucide-react'
import Link from 'next/link'

export default function KeywordResearchResultsPage() {
  const params = useParams()
  const router = useRouter()
  const [research, setResearch] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetch(`/api/keywords/${params.id}`)
        .then((res) => res.json())
        .then((data) => {
          setResearch(data)
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

  if (!research) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">Keyword research not found</p>
        <Link href="/dashboard/keywords">
          <Button>Start New Research</Button>
        </Link>
      </div>
    )
  }

  const serpData = typeof research.serpData === 'object' ? research.serpData : {}
  const contentBrief = typeof research.contentBrief === 'object' ? research.contentBrief : {}

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
          <h1 className="text-3xl font-bold text-foreground">Keyword Research: {research.keyword}</h1>
          <p className="text-muted-foreground mt-2">Comprehensive keyword analysis and content brief</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Search Volume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{research.searchVolume?.toLocaleString() || 'N/A'}</p>
            <p className="text-xs text-muted-foreground mt-1">Monthly searches</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Difficulty</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{research.keywordDifficulty || 'N/A'}</p>
            <p className="text-xs text-muted-foreground mt-1">0-100 scale</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              CPC
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${research.cpc?.toFixed(2) || 'N/A'}</p>
            <p className="text-xs text-muted-foreground mt-1">Cost per click</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Competition</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{(research.competition * 100)?.toFixed(0) || 'N/A'}%</p>
            <p className="text-xs text-muted-foreground mt-1">Competition level</p>
          </CardContent>
        </Card>
      </div>

      {/* Top SERP Results */}
      {serpData.topResults && serpData.topResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Ranking Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {serpData.topResults.slice(0, 10).map((result: any, index: number) => (
                <div key={index} className="border-b border-border pb-4 last:border-0">
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-1">
                      #{result.position}
                    </Badge>
                    <div className="flex-1">
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {result.title}
                      </a>
                      <p className="text-sm text-muted-foreground mt-1">{result.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{result.url}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* People Also Ask */}
      {serpData.paa && serpData.paa.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>People Also Ask</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {serpData.paa.map((item: any, index: number) => (
                <div key={index} className="border-l-2 border-primary pl-4">
                  <h3 className="font-medium text-foreground">{item.question}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{item.answer}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content Brief */}
      {contentBrief && Object.keys(contentBrief).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>AI Content Brief</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {contentBrief.title && (
              <div>
                <h3 className="font-semibold mb-2">Suggested Title</h3>
                <p className="text-sm text-muted-foreground">{contentBrief.title}</p>
              </div>
            )}
            {contentBrief.metaDescription && (
              <div>
                <h3 className="font-semibold mb-2">Meta Description</h3>
                <p className="text-sm text-muted-foreground">{contentBrief.metaDescription}</p>
              </div>
            )}
            {contentBrief.outline && contentBrief.outline.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Content Outline</h3>
                <ul className="space-y-2">
                  {contentBrief.outline.map((section: any, index: number) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      <strong>{section.heading}</strong>
                      {section.points && section.points.length > 0 && (
                        <ul className="list-disc list-inside ml-4 mt-1">
                          {section.points.map((point: string, pIndex: number) => (
                            <li key={pIndex}>{point}</li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {contentBrief.wordTarget && (
              <div>
                <h3 className="font-semibold mb-2">Target Word Count</h3>
                <p className="text-sm text-muted-foreground">{contentBrief.wordTarget} words</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Related Keywords */}
      {research.relatedKeywords && Array.isArray(research.relatedKeywords) && research.relatedKeywords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Related Keywords</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {research.relatedKeywords.map((keyword: any, index: number) => (
                <div key={index} className="border border-border rounded-lg p-4">
                  <h3 className="font-medium text-foreground">{keyword.keyword}</h3>
                  <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                    <span>Vol: {keyword.searchVolume?.toLocaleString() || 'N/A'}</span>
                    <span>Diff: {keyword.difficulty || 'N/A'}</span>
                    <span>CPC: ${keyword.cpc?.toFixed(2) || 'N/A'}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

