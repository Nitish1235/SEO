'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { showToast } from '@/components/shared/toast'

export function AnalysisForm() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, type: 'instant' }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed')
      }

      // Show success toast
      showToast('Analysis started successfully!', 'success')
      // Redirect to analysis results page
      router.push(`/dashboard/analyze/${data.id}`)
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to start analysis'
      setError(errorMessage)
      showToast(errorMessage, 'error')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="url" className="text-sm font-medium text-foreground mb-2 block">
          Website URL
        </label>
        <Input
          id="url"
          type="url"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          disabled={loading}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Enter the full URL including https://
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Button type="submit" disabled={loading || !url} className="w-full">
        {loading ? 'Analyzing...' : 'Start Analysis'}
      </Button>
    </form>
  )
}

