'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AnalysisForm } from '@/components/analysis/analysis-form'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function AnalyzePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Website Analysis</h1>
          <p className="text-muted-foreground mt-2">
            Enter a URL to get a comprehensive SEO audit with 50+ metrics.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>New Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <AnalysisForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/dashboard/analyze/history">
              <Button variant="outline" className="w-full justify-start">
                View Analysis History
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

