'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SEOScoreCard } from '@/components/analysis/seo-score-card'
import { MetricsGrid } from '@/components/analysis/metrics-grid'
import { SEOChart } from '@/components/analysis/seo-chart'
import { ArrowLeft, Loader2, Download, CheckCircle2, XCircle, AlertCircle, Code, Share2, Image as ImageIcon, Link2, FileText, Globe, Zap } from 'lucide-react'
import Link from 'next/link'
import { ExportButton } from '@/components/shared/export-button'
import { Badge } from '@/components/ui/badge'

export default function AnalysisResultsPage() {
  const params = useParams()
  const router = useRouter()
  const [analysis, setAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetch(`/api/analyze/${params.id}`)
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
        <p className="text-muted-foreground">Analysis not found</p>
        <Link href="/dashboard/analyze">
          <Button>Start New Analysis</Button>
        </Link>
      </div>
    )
  }

  const metrics = [
    {
      name: 'Title Tag',
      status: analysis.results?.title?.status || 'pass',
      value: analysis.results?.title?.length || 0,
      recommendation: analysis.results?.title?.recommendation || '',
    },
    {
      name: 'Meta Description',
      status: analysis.results?.meta?.status || 'pass',
      value: analysis.results?.meta?.length || 0,
      recommendation: analysis.results?.meta?.recommendation || '',
    },
    {
      name: 'H1 Tags',
      status: analysis.results?.headings?.h1?.status || 'pass',
      value: analysis.results?.headings?.h1?.count || 0,
      recommendation: analysis.results?.headings?.recommendation || '',
    },
    {
      name: 'Word Count',
      status: analysis.results?.content?.status || 'pass',
      value: analysis.results?.content?.wordCount || 0,
      recommendation: analysis.results?.content?.recommendation || '',
    },
    {
      name: 'Internal Links',
      status: analysis.results?.links?.status || 'pass',
      value: analysis.results?.links?.internalLinks || 0,
      recommendation: analysis.results?.links?.recommendation || '',
    },
    {
      name: 'Images',
      status: analysis.results?.images?.status || 'pass',
      value: `${analysis.results?.images?.imagesWithAlt || 0} / ${analysis.results?.images?.totalImages || 0}`,
      recommendation: analysis.results?.images?.recommendation || '',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/analyze">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Analysis Results</h1>
            <p className="text-muted-foreground mt-2">{analysis.url}</p>
          </div>
        </div>
        <ExportButton data={analysis.results} filename={`analysis-${analysis.id}`}>
          <Download className="mr-2 h-4 w-4" />
          Export JSON
        </ExportButton>
      </div>

      <SEOScoreCard score={analysis.seoScore || 0} />

      {/* Chart Visualization */}
      <SEOChart
        data={[
          { name: 'Title', score: analysis.results?.title?.status === 'pass' ? 100 : analysis.results?.title?.status === 'warning' ? 60 : 0, status: analysis.results?.title?.status || 'pass' },
          { name: 'Meta', score: analysis.results?.meta?.status === 'pass' ? 100 : analysis.results?.meta?.status === 'warning' ? 60 : 0, status: analysis.results?.meta?.status || 'pass' },
          { name: 'Headings', score: analysis.results?.headings?.status === 'pass' ? 100 : analysis.results?.headings?.status === 'warning' ? 60 : 0, status: analysis.results?.headings?.status || 'pass' },
          { name: 'Content', score: analysis.results?.content?.status === 'pass' ? 100 : analysis.results?.content?.status === 'warning' ? 60 : 0, status: analysis.results?.content?.status || 'pass' },
          { name: 'Links', score: analysis.results?.links?.status === 'pass' ? 100 : analysis.results?.links?.status === 'warning' ? 60 : 0, status: analysis.results?.links?.status || 'pass' },
          { name: 'Images', score: analysis.results?.images?.status === 'pass' ? 100 : analysis.results?.images?.status === 'warning' ? 60 : 0, status: analysis.results?.images?.status || 'pass' },
          { name: 'Core Web Vitals', score: analysis.results?.cwv?.status === 'pass' ? 100 : analysis.results?.cwv?.status === 'warning' ? 60 : 0, status: analysis.results?.cwv?.status || 'pass' },
          { name: 'SSL', score: analysis.results?.ssl?.status === 'pass' ? 100 : 0, status: analysis.results?.ssl?.status || 'pass' },
        ]}
      />

      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-4">Metrics</h2>
        <MetricsGrid metrics={metrics} />
      </div>

      {/* Additional Technical Details */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Schema Markup */}
        {analysis.results?.schema && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Code className="h-5 w-5" />
                Schema Markup
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analysis.results.schema.found ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">{analysis.results.schema.count} schema(s) found</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {analysis.results.schema.types.map((type: string, i: number) => (
                      <Badge key={i} variant="secondary" className="text-xs">{type}</Badge>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-orange-500" />
                  <span className="text-sm text-muted-foreground">No schema markup detected</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Social Media Tags */}
        {analysis.results?.social && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Share2 className="h-5 w-5" />
                Social Media Tags
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Open Graph</span>
                {analysis.results.social.hasOG ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-xs text-muted-foreground">
                      {Object.keys(analysis.results.social.ogTags || {}).length} tag(s)
                    </span>
                  </div>
                ) : (
                  <XCircle className="h-4 w-4 text-orange-500" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Twitter Cards</span>
                {analysis.results.social.hasTwitter ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-xs text-muted-foreground">
                      {Object.keys(analysis.results.social.twitterTags || {}).length} tag(s)
                    </span>
                  </div>
                ) : (
                  <XCircle className="h-4 w-4 text-orange-500" />
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Content Structure */}
        {analysis.results?.contentStructure && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5" />
                Content Structure
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-2 bg-muted/50 rounded">
                  <p className="text-lg font-bold">{analysis.results.contentStructure.listCount || 0}</p>
                  <p className="text-xs text-muted-foreground">Lists</p>
                </div>
                <div className="text-center p-2 bg-muted/50 rounded">
                  <p className="text-lg font-bold">{analysis.results.contentStructure.tableCount || 0}</p>
                  <p className="text-xs text-muted-foreground">Tables</p>
                </div>
                <div className="text-center p-2 bg-muted/50 rounded">
                  <p className="text-lg font-bold">{analysis.results.contentStructure.hasFAQ ? 'Yes' : 'No'}</p>
                  <p className="text-xs text-muted-foreground">FAQ</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Language */}
        {analysis.results?.language && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Globe className="h-5 w-5" />
                Language
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium">{analysis.results.language.toUpperCase()}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Enhanced Image & Link Details */}
      <div className="grid gap-4 md:grid-cols-2">
        {analysis.results?.imageDetails && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ImageIcon className="h-5 w-5" />
                Image Optimization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">With Dimensions</span>
                <span className="text-sm font-medium">
                  {analysis.results.imageDetails.withDimensions} / {analysis.results.imageDetails.total}
                  {analysis.results.imageDetails.total > 0 && (
                    <span className="text-muted-foreground ml-1">
                      ({Math.round((analysis.results.imageDetails.withDimensions / analysis.results.imageDetails.total) * 100)}%)
                    </span>
                  )}
                </span>
              </div>
              {analysis.results.imageDetails.avgWidth > 0 && analysis.results.imageDetails.avgHeight > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Average Size</span>
                  <span className="text-sm font-medium">
                    {analysis.results.imageDetails.avgWidth} × {analysis.results.imageDetails.avgHeight}px
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {analysis.results?.linkDetails && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Link2 className="h-5 w-5" />
                Link Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Internal</span>
                <span className="text-sm font-medium">{analysis.results.linkDetails.internal}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">External</span>
                <span className="text-sm font-medium">{analysis.results.linkDetails.external}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Nofollow</span>
                <span className="text-sm font-medium">{analysis.results.linkDetails.nofollow}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* AI Insights */}
      {analysis.results?.aiInsights && (
        <div className="space-y-6">
          {/* Summary Card */}
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                AI-Powered Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-background/50 rounded-lg border border-primary/10">
                <p className="text-sm leading-relaxed text-foreground">
                  {analysis.results.aiInsights.summary}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Strengths & Weaknesses Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Strengths Card */}
            {analysis.results.aiInsights.strengths && analysis.results.aiInsights.strengths.length > 0 && (
              <Card className="border-2 border-green-500/20 bg-gradient-to-br from-green-500/5 to-green-500/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="p-1.5 rounded-lg bg-green-500/20">
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-green-600 dark:text-green-400">Strengths</span>
                    <Badge variant="secondary" className="ml-auto bg-green-500/20 text-green-700 dark:text-green-300">
                      {analysis.results.aiInsights.strengths.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.results.aiInsights.strengths.map((strength: string, i: number) => {
                      // Extract bold text and regular text
                      const parts = strength.split(/(\*\*[^*]+\*\*)/g)
                      return (
                        <div 
                          key={i} 
                          className="flex gap-3 p-3 bg-green-500/5 rounded-lg border border-green-500/10 hover:bg-green-500/10 transition-colors"
                        >
                          <div className="mt-0.5 shrink-0">
                            <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                          </div>
                          <p className="text-sm text-foreground leading-relaxed flex-1">
                            {parts.map((part, idx) => {
                              if (part.startsWith('**') && part.endsWith('**')) {
                                return (
                                  <span key={idx} className="font-semibold text-green-700 dark:text-green-300">
                                    {part.replace(/\*\*/g, '')}
                                  </span>
                                )
                              }
                              return <span key={idx}>{part}</span>
                            })}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Weaknesses Card */}
            {analysis.results.aiInsights.weaknesses && analysis.results.aiInsights.weaknesses.length > 0 && (
              <Card className="border-2 border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-orange-500/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="p-1.5 rounded-lg bg-orange-500/20">
                      <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <span className="text-orange-600 dark:text-orange-400">Areas to Improve</span>
                    <Badge variant="secondary" className="ml-auto bg-orange-500/20 text-orange-700 dark:text-orange-300">
                      {analysis.results.aiInsights.weaknesses.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.results.aiInsights.weaknesses.map((weakness: string, i: number) => {
                      // Extract bold text and regular text
                      const parts = weakness.split(/(\*\*[^*]+\*\*)/g)
                      return (
                        <div 
                          key={i} 
                          className="flex gap-3 p-3 bg-orange-500/5 rounded-lg border border-orange-500/10 hover:bg-orange-500/10 transition-colors"
                        >
                          <div className="mt-0.5 shrink-0">
                            <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                          </div>
                          <p className="text-sm text-foreground leading-relaxed flex-1">
                            {parts.map((part, idx) => {
                              if (part.startsWith('**') && part.endsWith('**')) {
                                return (
                                  <span key={idx} className="font-semibold text-orange-700 dark:text-orange-300">
                                    {part.replace(/\*\*/g, '')}
                                  </span>
                                )
                              }
                              return <span key={idx}>{part}</span>
                            })}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Priority Actions */}
          {analysis.results.aiInsights.priorityActions && analysis.results.aiInsights.priorityActions.length > 0 && (
            <Card className="border-2 border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-blue-500/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="p-1.5 rounded-lg bg-blue-500/20">
                    <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  Priority Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis.results.aiInsights.priorityActions.map((action: any, idx: number) => {
                    const impactColors = {
                      high: 'bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30',
                      medium: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/30',
                      low: 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30',
                    }
                    const effortColors = {
                      easy: 'bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30',
                      medium: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/30',
                      hard: 'bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/30',
                    }
                    return (
                      <div 
                        key={idx} 
                        className="flex gap-4 p-4 bg-background/50 rounded-lg border border-blue-500/10 hover:border-blue-500/20 transition-all"
                      >
                        <div className="shrink-0">
                          <div className={`h-10 w-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                            action.impact === 'high' ? 'bg-red-500/20 text-red-600 dark:text-red-400' :
                            action.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400' :
                            'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                          }`}>
                            {idx + 1}
                          </div>
                        </div>
                        <div className="flex-1 space-y-2">
                          <p className="text-sm font-semibold text-foreground leading-snug">
                            {action.action}
                          </p>
                          <div className="flex gap-2 flex-wrap">
                            <Badge 
                              variant="outline" 
                              className={`text-xs border ${impactColors[action.impact as keyof typeof impactColors] || impactColors.medium}`}
                            >
                              Impact: {action.impact}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={`text-xs border ${effortColors[action.effort as keyof typeof effortColors] || effortColors.medium}`}
                            >
                              Effort: {action.effort}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Estimated Impact */}
          {analysis.results.aiInsights.estimatedImpact && (
            <Card className="border-2 border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-purple-500/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="p-1.5 rounded-lg bg-purple-500/20">
                    <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  Estimated Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-background/50 rounded-lg border border-purple-500/10">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {analysis.results.aiInsights.estimatedImpact.split('\n').map((line: string, i: number) => {
                      // Handle markdown-style headers
                      if (line.startsWith('###')) {
                        return (
                          <h3 key={i} className="text-sm font-bold text-foreground mt-4 mb-2 first:mt-0">
                            {line.replace(/###\s*\*\*?|\*\*?/g, '')}
                          </h3>
                        )
                      }
                      // Handle bold text
                      if (line.startsWith('**') || line.includes('**')) {
                        const parts = line.split(/(\*\*[^*]+\*\*)/g)
                        return (
                          <p key={i} className="text-sm text-muted-foreground mb-2 leading-relaxed">
                            {parts.map((part, idx) => {
                              if (part.startsWith('**') && part.endsWith('**')) {
                                return (
                                  <span key={idx} className="font-semibold text-foreground">
                                    {part.replace(/\*\*/g, '')}
                                  </span>
                                )
                              }
                              return <span key={idx}>{part}</span>
                            })}
                          </p>
                        )
                      }
                      // Regular text
                      if (line.trim()) {
                        return (
                          <p key={i} className="text-sm text-muted-foreground mb-2 leading-relaxed">
                            {line}
                          </p>
                        )
                      }
                      return null
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

