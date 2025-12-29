'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const errorMessages: Record<string, string> = {
    Configuration: 'There is a problem with the server configuration. Please contact support.',
    AccessDenied: 'You do not have permission to sign in.',
    Verification: 'The verification token has expired or has already been used.',
    Default: 'An error occurred during authentication. Please try again.',
  }

  const errorMessage = error ? errorMessages[error] || errorMessages.Default : errorMessages.Default

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl">Authentication Error</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">{errorMessage}</p>
          <div className="flex gap-2">
            <Button asChild className="flex-1">
              <Link href="/sign-in">Try Again</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/">Go Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

