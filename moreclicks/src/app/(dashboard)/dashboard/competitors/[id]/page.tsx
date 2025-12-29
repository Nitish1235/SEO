'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Loader2, ExternalLink, TrendingUp, TrendingDown, Minus, FileText, Image as ImageIcon, BarChart3, Lightbulb, Target, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export default function CompetitorAnalysisResultsPage() {
  const params = useParams()
  const [analysis, setAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      fetch(`/api/competitors/${params.id}`)
        .then((res) => {
          if (!res.ok) {
            return res.json().then((err) => {
              throw new Error(err.error || `HTTP ${res.status}`)
            })
          }
          return res.json()
        })
        .then((data) => {
          setAnalysis(data)
          setLoading(false)
        })
        .catch((err) => {
          setError(err.message || 'Failed to load competitor analysis')
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

  if (error || !analysis || analysis.status === 'failed') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/competitors">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Competitor Analysis</h1>
          </div>
        </div>
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <p className="text-destructive mb-4">{error || 'Analysis failed. Please try again.'}</p>
              <Link href="/dashboard/competitors">
                <Button>Start New Analysis</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (analysis.status === 'processing') {
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
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Analyzing competitors... This may take a few moments.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const comparison = typeof analysis.comparison === 'object' && analysis.comparison !== null ? analysis.comparison : {}
  const competitors = Array.isArray(analysis.competitors) ? analysis.competitors : []
  const userMetrics = comparison.user || {}
  const averages = comparison.averages || {}
  const gaps = comparison.gaps || {}
  const aiInsights = analysis.aiInsights || {}

  // Helper function to format gap descriptions
  const formatGapDescription = (key: string, gap: any) => {
    const keyMap: Record<string, { singular: string; plural: string; unit: string }> = {
      wordCount: { singular: 'word', plural: 'words', unit: '' },
      h1Count: { singular: 'H1 heading', plural: 'H1 headings', unit: '' },
      h2Count: { singular: 'H2 section', plural: 'H2 sections', unit: '' },
      h3Count: { singular: 'H3 section', plural: 'H3 sections', unit: '' },
      imagesCount: { singular: 'image', plural: 'images', unit: '' },
      imagesWithAlt: { singular: 'image with alt text', plural: 'images with alt text', unit: '' },
      internalLinks: { singular: 'internal link', plural: 'internal links', unit: '' },
      externalLinks: { singular: 'external link', plural: 'external links', unit: '' },
      linksWithText: { singular: 'link with text', plural: 'links with text', unit: '' },
      linksWithoutText: { singular: 'link without text', plural: 'links without text', unit: '' },
      titleLength: { singular: 'character in title', plural: 'characters in title', unit: ' chars' },
      metaDescriptionLength: { singular: 'character in meta description', plural: 'characters in meta description', unit: ' chars' },
      readingTime: { singular: 'minute', plural: 'minutes', unit: ' min' },
      altTextCoverage: { singular: 'percentage point', plural: 'percentage points', unit: '%' },
    }
    
    const mapping = keyMap[key] || { singular: 'item', plural: 'items', unit: '' }
    const value = Math.abs(gap.value)
    const isPlural = value !== 1
    const item = isPlural ? mapping.plural : mapping.singular
    
    if (gap.isPositive) {
      return `${value.toFixed(0)}${mapping.unit} more ${item}`
    } else {
      return `${value.toFixed(0)}${mapping.unit} fewer ${item}`
    }
  }

  // Separate positive and negative gaps
  const positiveGaps = Object.entries(gaps)
    .filter(([_, gap]: [string, any]) => gap?.isPositive)
    .map(([key, gap]: [string, any]) => ({ key, ...gap, description: formatGapDescription(key, gap) }))
  
  const negativeGaps = Object.entries(gaps)
    .filter(([_, gap]: [string, any]) => gap?.isNegative)
    .map(([key, gap]: [string, any]) => ({ key, ...gap, description: formatGapDescription(key, gap) }))
  
  const criticalGaps = negativeGaps
    .filter(gap => Math.abs(gap.percentage) > 20) // More than 20% behind
    .sort((a, b) => Math.abs(b.percentage) - Math.abs(a.percentage))

  // Prepare chart data
  const wordCountData = [
    { name: 'You', value: userMetrics.wordCount || 0, type: 'user' },
    ...competitors.map((c: any) => ({ name: c.domain, value: c.wordCount || 0, type: 'competitor' })),
    { name: 'Average', value: Math.round(averages.wordCount || 0), type: 'average' },
  ]

  const imageCountData = [
    { name: 'You', value: userMetrics.imagesCount || 0, type: 'user' },
    ...competitors.map((c: any) => ({ name: c.domain, value: c.imagesCount || 0, type: 'competitor' })),
    { name: 'Average', value: Math.round(averages.imagesCount || 0), type: 'average' },
  ]

  const getComparisonBadge = (userValue: number, avgValue: number) => {
    if (userValue >= avgValue * 1.1) {
      return <Badge variant="default" className="bg-green-500"><TrendingUp className="h-3 w-3 mr-1" />Above</Badge>
    } else if (userValue >= avgValue * 0.9) {
      return <Badge variant="secondary"><Minus className="h-3 w-3 mr-1" />On Par</Badge>
    } else {
      return <Badge variant="destructive"><TrendingDown className="h-3 w-3 mr-1" />Below</Badge>
    }
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/competitors">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Competitor Analysis</h1>
            <p className="text-muted-foreground mt-1">
              Keyword: <span className="font-semibold text-foreground">{analysis.sourceKeyword}</span> • 
              Your URL: <a href={analysis.userUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">{analysis.userUrl}</a>
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats Comparison */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Word Count
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-3xl font-bold">{userMetrics.wordCount?.toLocaleString() || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Avg: {Math.round(averages.wordCount || 0).toLocaleString()}</p>
              </div>
              {getComparisonBadge(userMetrics.wordCount || 0, averages.wordCount || 0)}
            </div>
            {gaps.wordCount?.isNegative && (
              <p className="text-xs text-orange-500 mt-2">
                Behind by {Math.round(gaps.wordCount.value).toLocaleString()} words ({Math.abs(gaps.wordCount.percentage).toFixed(0)}%)
              </p>
            )}
            {gaps.wordCount?.isPositive && (
              <p className="text-xs text-green-500 mt-2">
                Ahead by {Math.round(gaps.wordCount.value).toLocaleString()} words ({gaps.wordCount.percentage.toFixed(0)}%)
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              H2 Sections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-3xl font-bold">{userMetrics.h2Count || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Avg: {Math.round(averages.h2Count || 0)}</p>
              </div>
              {getComparisonBadge(userMetrics.h2Count || 0, averages.h2Count || 0)}
            </div>
            {gaps.h2Count?.isNegative && (
              <p className="text-xs text-orange-500 mt-2">
                Behind by {Math.round(gaps.h2Count.value)} sections ({Math.abs(gaps.h2Count.percentage).toFixed(0)}%)
              </p>
            )}
            {gaps.h2Count?.isPositive && (
              <p className="text-xs text-green-500 mt-2">
                Ahead by {Math.round(gaps.h2Count.value)} sections ({gaps.h2Count.percentage.toFixed(0)}%)
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Images
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-3xl font-bold">{userMetrics.imagesCount || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Avg: {Math.round(averages.imagesCount || 0)}</p>
              </div>
              {getComparisonBadge(userMetrics.imagesCount || 0, averages.imagesCount || 0)}
            </div>
            {gaps.imagesCount?.isNegative && (
              <p className="text-xs text-orange-500 mt-2">
                Behind by {Math.round(gaps.imagesCount.value)} images ({Math.abs(gaps.imagesCount.percentage).toFixed(0)}%)
              </p>
            )}
            {gaps.imagesCount?.isPositive && (
              <p className="text-xs text-green-500 mt-2">
                Ahead by {Math.round(gaps.imagesCount.value)} images ({gaps.imagesCount.percentage.toFixed(0)}%)
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Visual Comparisons */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Word Count Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={wordCountData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={12} />
                <YAxis />
                <Tooltip formatter={(value: number) => value.toLocaleString()} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {wordCountData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={
                      entry.type === 'user' ? '#3B82F6' :
                      entry.type === 'average' ? '#F59E0B' :
                      '#10B981'
                    } />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Image Count Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={imageCountData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={12} />
                <YAxis />
                <Tooltip formatter={(value: number) => value.toLocaleString()} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {imageCountData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={
                      entry.type === 'user' ? '#3B82F6' :
                      entry.type === 'average' ? '#F59E0B' :
                      '#10B981'
                    } />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Competitors with Detailed Insights */}
      {competitors.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Target className="h-6 w-6" />
            Competitors ({competitors.length})
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {competitors.map((competitor: any, index: number) => {
              const competitorInsight = aiInsights.competitorInsights?.find((ci: any) => ci.domain === competitor.domain)
              
              return (
                <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2 flex items-center gap-2">
                          <span className="font-bold">{competitor.domain}</span>
                          <Badge variant="outline" className="text-xs">#{index + 1}</Badge>
                        </CardTitle>
                        <a
                          href={competitor.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          View Page
                        </a>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Title */}
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Page Title</p>
                      <p className="text-sm font-medium leading-tight">{competitor.title || 'N/A'}</p>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">Words</p>
                        <p className="text-lg font-bold">{competitor.wordCount?.toLocaleString() || '0'}</p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">H2</p>
                        <p className="text-lg font-bold">{competitor.h2Count || '0'}</p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">Images</p>
                        <p className="text-lg font-bold">{competitor.imagesCount || '0'}</p>
                      </div>
                    </div>

                    {/* SEO Metrics */}
                    <div className="border-t pt-3">
                      <p className="text-xs font-medium text-muted-foreground mb-2">SEO Metrics</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-muted-foreground">Title Length</p>
                          <p className="font-medium">{competitor.titleLength || 0} chars
                            {competitor.titleHasKeyword && <span className="text-green-500 ml-1">✓</span>}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Meta Length</p>
                          <p className="font-medium">{competitor.metaDescriptionLength || 0} chars
                            {competitor.metaHasKeyword && <span className="text-green-500 ml-1">✓</span>}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Internal Links</p>
                          <p className="font-medium">{competitor.internalLinks || 0}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">External Links</p>
                          <p className="font-medium">{competitor.externalLinks || 0}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Links w/ Text</p>
                          <p className="font-medium">{competitor.linksWithText || 0}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Links w/o Text</p>
                          <p className="font-medium text-orange-500">{competitor.linksWithoutText || 0}</p>
                        </div>
                      </div>
                    </div>

                    {/* Content Strategy */}
                    {competitor.contentStrategy && (
                      <div className="border-t pt-3">
                        <p className="text-xs font-medium text-muted-foreground mb-2">Content Strategy</p>
                        <div className="flex flex-wrap gap-2">
                          {competitor.contentStrategy.hasFAQ && (
                            <Badge variant="secondary" className="text-xs">FAQ Section</Badge>
                          )}
                          {competitor.contentStrategy.hasList && (
                            <Badge variant="secondary" className="text-xs">Lists</Badge>
                          )}
                          {competitor.contentStrategy.hasTable && (
                            <Badge variant="secondary" className="text-xs">Tables</Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {competitor.contentStrategy.avgWordsPerHeading} words/heading
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {competitor.contentStrategy.imageDensity} imgs/1k words
                          </Badge>
                        </div>
                      </div>
                    )}

                    {/* Image Strategy */}
                    {competitor.imageStrategy && (
                      <div className="border-t pt-3">
                        <p className="text-xs font-medium text-muted-foreground mb-2">Image Strategy</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span>Alt Text Coverage</span>
                              <span className="font-semibold">{competitor.imageStrategy.altTextCoverage}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  competitor.imageStrategy.altTextCoverage >= 80 ? 'bg-green-500' :
                                  competitor.imageStrategy.altTextCoverage >= 50 ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${competitor.imageStrategy.altTextCoverage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* AI Insights for this competitor */}
                    {competitorInsight && (
                      <div className="border-t pt-3 space-y-2">
                        <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                          <Lightbulb className="h-3 w-3" />
                          Key Insights
                        </p>
                        {competitorInsight.whatTheyDoWell && competitorInsight.whatTheyDoWell.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-1">What They Do Well:</p>
                            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                              {competitorInsight.whatTheyDoWell.slice(0, 3).map((item: string, idx: number) => (
                                <li key={idx}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {competitorInsight.keyTakeaways && competitorInsight.keyTakeaways.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">Takeaways:</p>
                            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                              {competitorInsight.keyTakeaways.slice(0, 2).map((item: string, idx: number) => (
                                <li key={idx}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Gap Analysis */}
      {(positiveGaps.length > 0 || negativeGaps.length > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          {positiveGaps.length > 0 && (
            <Card className="border-2 border-green-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <TrendingUp className="h-5 w-5" />
                  Where You're Ahead
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {positiveGaps.slice(0, 5).map((gap: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-green-500/10 rounded-lg">
                      <div className="flex-1">
                        <span className="text-sm font-medium capitalize block">{gap.key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className="text-xs text-muted-foreground">{gap.description}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-green-600 dark:text-green-400">
                          +{gap.percentage.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {negativeGaps.length > 0 && (
            <Card className="border-2 border-orange-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                  <TrendingDown className="h-5 w-5" />
                  Where You're Behind
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {negativeGaps
                    .sort((a, b) => Math.abs(b.percentage) - Math.abs(a.percentage))
                    .slice(0, 5)
                    .map((gap: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-orange-500/10 rounded-lg">
                        <div className="flex-1">
                          <span className="text-sm font-medium capitalize block">{gap.key.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <span className="text-xs text-muted-foreground">{gap.description}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                            {Math.abs(gap.percentage).toFixed(0)}% behind
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Critical Gaps */}
      {criticalGaps.length > 0 && (
        <Card className="border-2 border-red-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="h-5 w-5" />
              Critical Gaps (Priority Fixes)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {criticalGaps.map((gap: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                  <div className="flex-1">
                    <p className="font-semibold capitalize text-sm">{gap.key.replace(/([A-Z])/g, ' $1').trim()}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {gap.description} • {Math.abs(gap.percentage).toFixed(0)}% behind average
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-600 dark:text-red-400">
                      {Math.abs(gap.percentage).toFixed(0)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Insights */}
      {aiInsights && Object.keys(aiInsights).length > 0 && (
        <>
          {/* Image Insights */}
          {aiInsights.imageInsights && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Image Optimization Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {aiInsights.imageInsights.altTextIssues && (
                  <div>
                    <p className="text-sm font-semibold mb-2">Alt Text Issues</p>
                    <p className="text-sm text-muted-foreground">{aiInsights.imageInsights.altTextIssues}</p>
                  </div>
                )}
                {aiInsights.imageInsights.recommendations && Array.isArray(aiInsights.imageInsights.recommendations) && (
                  <div>
                    <p className="text-sm font-semibold mb-2">Recommendations</p>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      {aiInsights.imageInsights.recommendations.map((rec: string, idx: number) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {/* Show actual numbers */}
                <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                  <div>
                    <p className="text-xs text-muted-foreground">Your Alt Text Coverage</p>
                    <p className="text-lg font-bold">
                      {userMetrics.imagesCount > 0 
                        ? Math.round((userMetrics.imagesWithAlt / userMetrics.imagesCount) * 100) 
                        : 0}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {userMetrics.imagesWithAlt} / {userMetrics.imagesCount} images
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Industry Average</p>
                    <p className="text-lg font-bold">{Math.round(averages.altTextCoverage || 0)}%</p>
                    <p className="text-xs text-muted-foreground">
                      {userMetrics.imagesWithoutAlt > 0 && (
                        <span className="text-orange-500">
                          {userMetrics.imagesWithoutAlt} missing alt text
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                {/* Alt text quality breakdown */}
                {userMetrics.imagesAltQuality && (
                  <div className="pt-3 border-t">
                    <p className="text-xs font-semibold mb-2">Alt Text Quality Breakdown</p>
                    <div className="grid grid-cols-5 gap-2 text-xs">
                      <div className="text-center p-2 bg-green-500/10 rounded">
                        <p className="font-bold text-green-600 dark:text-green-400">{userMetrics.imagesAltQuality.good || 0}</p>
                        <p className="text-muted-foreground">Good</p>
                      </div>
                      <div className="text-center p-2 bg-yellow-500/10 rounded">
                        <p className="font-bold text-yellow-600 dark:text-yellow-400">{userMetrics.imagesAltQuality.poor || 0}</p>
                        <p className="text-muted-foreground">Poor</p>
                      </div>
                      <div className="text-center p-2 bg-orange-500/10 rounded">
                        <p className="font-bold text-orange-600 dark:text-orange-400">{userMetrics.imagesAltQuality.generic || 0}</p>
                        <p className="text-muted-foreground">Generic</p>
                      </div>
                      <div className="text-center p-2 bg-red-500/10 rounded">
                        <p className="font-bold text-red-600 dark:text-red-400">{userMetrics.imagesAltQuality.tooLong || 0}</p>
                        <p className="text-muted-foreground">Too Long</p>
                      </div>
                      <div className="text-center p-2 bg-gray-500/10 rounded">
                        <p className="font-bold">{userMetrics.imagesAltQuality.missing || 0}</p>
                        <p className="text-muted-foreground">Missing</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Content Insights */}
          {aiInsights.contentInsights && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Content Optimization Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {aiInsights.contentInsights.titleIssues && (
                  <div>
                    <p className="text-sm font-semibold mb-2">Title Tag Issues</p>
                    <p className="text-sm text-muted-foreground">{aiInsights.contentInsights.titleIssues}</p>
                    <div className="mt-2 p-2 bg-muted rounded text-xs">
                      <p><strong>Your Title:</strong> "{userMetrics.title}" ({userMetrics.titleLength} chars)</p>
                      <p><strong>Keyword in Title:</strong> {userMetrics.titleHasKeyword ? '✓ Yes' : '✗ No'} | 
                      <strong> Industry Avg:</strong> {Math.round(averages.titleKeywordUsage || 0)}% include keyword</p>
                    </div>
                  </div>
                )}
                {aiInsights.contentInsights.metaIssues && (
                  <div>
                    <p className="text-sm font-semibold mb-2">Meta Description Issues</p>
                    <p className="text-sm text-muted-foreground">{aiInsights.contentInsights.metaIssues}</p>
                    <div className="mt-2 p-2 bg-muted rounded text-xs">
                      <p><strong>Your Meta:</strong> "{userMetrics.metaDescription.substring(0, 100)}..." ({userMetrics.metaDescriptionLength} chars)</p>
                      <p><strong>Keyword in Meta:</strong> {userMetrics.metaHasKeyword ? '✓ Yes' : '✗ No'} | 
                      <strong> Industry Avg:</strong> {Math.round(averages.metaKeywordUsage || 0)}% include keyword</p>
                    </div>
                  </div>
                )}
                {aiInsights.contentInsights.headingIssues && (
                  <div>
                    <p className="text-sm font-semibold mb-2">Heading Structure Issues</p>
                    <p className="text-sm text-muted-foreground">{aiInsights.contentInsights.headingIssues}</p>
                  </div>
                )}
                {aiInsights.contentInsights.recommendations && Array.isArray(aiInsights.contentInsights.recommendations) && (
                  <div>
                    <p className="text-sm font-semibold mb-2">Recommendations</p>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      {aiInsights.contentInsights.recommendations.map((rec: string, idx: number) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Link Insights */}
          {aiInsights.linkInsights && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Link Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {aiInsights.linkInsights.internalLinkIssues && (
                  <div>
                    <p className="text-sm font-semibold mb-2">Internal Linking</p>
                    <p className="text-sm text-muted-foreground">{aiInsights.linkInsights.internalLinkIssues}</p>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 bg-muted rounded">
                        <p><strong>Your Internal Links:</strong> {userMetrics.internalLinks}</p>
                        <p className="text-muted-foreground">Avg: {Math.round(averages.internalLinks || 0)}</p>
                      </div>
                      <div className="p-2 bg-muted rounded">
                        <p><strong>Links With Text:</strong> {userMetrics.linksWithText}</p>
                        <p className="text-muted-foreground">Without Text: {userMetrics.linksWithoutText}</p>
                      </div>
                    </div>
                  </div>
                )}
                {aiInsights.linkInsights.externalLinkIssues && (
                  <div>
                    <p className="text-sm font-semibold mb-2">External Linking</p>
                    <p className="text-sm text-muted-foreground">{aiInsights.linkInsights.externalLinkIssues}</p>
                  </div>
                )}
                {aiInsights.linkInsights.anchorTextIssues && (
                  <div>
                    <p className="text-sm font-semibold mb-2">Anchor Text Issues</p>
                    <p className="text-sm text-muted-foreground">{aiInsights.linkInsights.anchorTextIssues}</p>
                  </div>
                )}
                {aiInsights.linkInsights.recommendations && Array.isArray(aiInsights.linkInsights.recommendations) && (
                  <div>
                    <p className="text-sm font-semibold mb-2">Recommendations</p>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      {aiInsights.linkInsights.recommendations.map((rec: string, idx: number) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Main AI Insights */}
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                AI-Powered Strategic Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
            {aiInsights.summary && (
              <div>
                <p className="text-sm font-semibold mb-2">Summary</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{aiInsights.summary}</p>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              {aiInsights.strengths && aiInsights.strengths.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2 flex items-center gap-2 text-green-600 dark:text-green-400">
                    <TrendingUp className="h-4 w-4" />
                    Your Strengths
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                    {aiInsights.strengths.map((item: string, idx: number) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {aiInsights.weaknesses && aiInsights.weaknesses.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2 flex items-center gap-2 text-orange-600 dark:text-orange-400">
                    <AlertCircle className="h-4 w-4" />
                    Areas to Improve
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                    {aiInsights.weaknesses.map((item: string, idx: number) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {aiInsights.recommendations && aiInsights.recommendations.length > 0 && (
              <div>
                <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Prioritized Recommendations
                </p>
                <div className="space-y-2">
                  {aiInsights.recommendations.map((rec: string, idx: number) => (
                    <div key={idx} className="flex gap-3 p-3 bg-muted/50 rounded-lg">
                      <Badge variant="outline" className="h-6 w-6 flex items-center justify-center p-0 shrink-0">
                        {idx + 1}
                      </Badge>
                      <p className="text-sm text-muted-foreground flex-1">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section-wise Recommendations */}
            {aiInsights.sectionRecommendations && Object.keys(aiInsights.sectionRecommendations).length > 0 && (
              <div className="pt-6 border-t">
                <p className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Section-by-Section Action Items
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  {aiInsights.sectionRecommendations.title && aiInsights.sectionRecommendations.title.length > 0 && (
                    <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                      <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2">Title Tag</p>
                      <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                        {aiInsights.sectionRecommendations.title.map((rec: string, idx: number) => (
                          <li key={idx}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {aiInsights.sectionRecommendations.metaDescription && aiInsights.sectionRecommendations.metaDescription.length > 0 && (
                    <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                      <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-2">Meta Description</p>
                      <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                        {aiInsights.sectionRecommendations.metaDescription.map((rec: string, idx: number) => (
                          <li key={idx}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {aiInsights.sectionRecommendations.headings && aiInsights.sectionRecommendations.headings.length > 0 && (
                    <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                      <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-2">Heading Structure</p>
                      <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                        {aiInsights.sectionRecommendations.headings.map((rec: string, idx: number) => (
                          <li key={idx}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {aiInsights.sectionRecommendations.content && aiInsights.sectionRecommendations.content.length > 0 && (
                    <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                      <p className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 mb-2">Content</p>
                      <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                        {aiInsights.sectionRecommendations.content.map((rec: string, idx: number) => (
                          <li key={idx}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {aiInsights.sectionRecommendations.images && aiInsights.sectionRecommendations.images.length > 0 && (
                    <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                      <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 mb-2">Images</p>
                      <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                        {aiInsights.sectionRecommendations.images.map((rec: string, idx: number) => (
                          <li key={idx}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {aiInsights.sectionRecommendations.links && aiInsights.sectionRecommendations.links.length > 0 && (
                    <div className="p-3 bg-pink-500/10 rounded-lg border border-pink-500/20">
                      <p className="text-xs font-semibold text-pink-600 dark:text-pink-400 mb-2">Links</p>
                      <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                        {aiInsights.sectionRecommendations.links.map((rec: string, idx: number) => (
                          <li key={idx}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        </>
      )}
    </div>
  )
}
