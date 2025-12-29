'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ProcessingOverlay } from '@/components/shared/processing-overlay'

export default function KeywordsPage() {
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/keywords/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Keyword research failed')
      }

      router.push(`/dashboard/keywords/${data.id}`)
    } catch (err: any) {
      setError(err.message || 'Failed to research keyword')
      setLoading(false)
    }
  }

  return (
    <>
      <ProcessingOverlay 
        isProcessing={loading}
        message="Researching keyword"
        subMessage="Gathering search volume, competition, and SERP data..."
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
              <span className="gradient-text-5">Keyword</span>
              <span className="block gradient-text-6">Research</span>
            </h1>
            <p className="text-purple-600 font-bold mt-2 text-lg tracking-wide">
              Research keywords with search volume, difficulty, CPC, and content briefs.
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="gradient-text-5">New Keyword Research</CardTitle>
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

              {error && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button type="submit" disabled={loading || !keyword} className="w-full">
                {loading ? 'Researching...' : 'Research Keyword'}
              </Button>
            </form>
          </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="gradient-text-6">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/dashboard/keywords/history">
                <Button variant="outline" className="w-full justify-start">
                  View Research History
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

