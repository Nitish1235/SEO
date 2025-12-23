'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SEOScoreCard } from '@/components/analysis/seo-score-card'
import { MetricsGrid } from '@/components/analysis/metrics-grid'
import { SEOChart } from '@/components/analysis/seo-chart'
import { ArrowLeft, Loader2, Download } from 'lucide-react'
import Link from 'next/link'
import { ExportButton } from '@/components/shared/export-button'

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

      {analysis.results?.aiInsights && (
        <Card>
          <CardHeader>
            <CardTitle>AI Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Summary</h3>
              <p className="text-sm text-muted-foreground">
                {analysis.results.aiInsights.summary}
              </p>
            </div>
            {analysis.results.aiInsights.strengths && analysis.results.aiInsights.strengths.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Strengths</h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {analysis.results.aiInsights.strengths.map((strength: string, i: number) => (
                    <li key={i}>{strength}</li>
                  ))}
                </ul>
              </div>
            )}
            {analysis.results.aiInsights.weaknesses && analysis.results.aiInsights.weaknesses.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Weaknesses</h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {analysis.results.aiInsights.weaknesses.map((weakness: string, i: number) => (
                    <li key={i}>{weakness}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

