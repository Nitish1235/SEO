'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ProcessingOverlay } from '@/components/shared/processing-overlay'

export default function CompetitorsPage() {
  const [keyword, setKeyword] = useState('')
  const [userUrl, setUserUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/competitors/find-from-keyword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword, userUrl }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Competitor analysis failed')
      }

      router.push(`/dashboard/competitors/${data.id}`)
    } catch (err: any) {
      setError(err.message || 'Failed to analyze competitors')
      setLoading(false)
    }
  }

  return (
    <>
      <ProcessingOverlay 
        isProcessing={loading}
        message="Analyzing competitors"
        subMessage="Scraping competitor data and generating insights..."
      />
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold">
              <span className="gradient-text-2">Competitor</span>
              <span className="block gradient-text-4">Analysis</span>
            </h1>
            <p className="text-purple-600 font-bold mt-2 text-lg tracking-wide">
              Compare your website with competitors ranking for the same keywords.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="gradient-text-2">New Competitor Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="keyword" className="text-sm font-medium text-foreground mb-2 block">
                  Keyword
                </label>
                <Input
                  id="keyword"
                  type="text"
                  placeholder="e.g., seo tools"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="userUrl" className="text-sm font-medium text-foreground mb-2 block">
                  Your Website URL
                </label>
                <Input
                  id="userUrl"
                  type="url"
                  placeholder="https://yourwebsite.com"
                  value={userUrl}
                  onChange={(e) => setUserUrl(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button type="submit" disabled={loading || !keyword || !userUrl} className="w-full">
                {loading ? 'Analyzing...' : 'Analyze Competitors'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

