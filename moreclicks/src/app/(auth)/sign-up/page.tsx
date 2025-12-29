'use client'

import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, Rocket } from 'lucide-react'

function SignUpForm() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4 hover:scale-105 transition-all duration-300 group">
            <div className="relative w-12 h-12 flex-shrink-0 translate-x-1 translate-y-1">
              <Image 
                src="/best seo tool.svg" 
                alt="MoreClicks Logo" 
                width={48} 
                height={48} 
                className="object-contain drop-shadow-lg group-hover:rotate-12 transition-transform duration-300"
              />
            </div>
            <span className="text-3xl font-black tracking-tight">
              <span className="text-yellow-400">more</span>
              <span className="text-purple-600">clicks</span>
              <span className="text-pink-500">.io</span>
            </span>
          </Link>
        </div>

        {/* Main Card */}
        <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-2 border-purple-200/50 dark:border-purple-800/50 shadow-2xl">
          <CardHeader className="text-center space-y-2 pb-6">
            <CardTitle className="text-4xl font-black gradient-text-2">
              Get Started!
            </CardTitle>
            <p className="text-purple-600 dark:text-purple-400 font-semibold text-lg">
              Join thousands of users boosting their SEO
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
                <p className="text-sm text-red-800 dark:text-red-200">
                  {error === 'AccessDenied' 
                    ? 'Access denied. Please contact support if you believe this is an error.'
                    : error === 'Configuration'
                    ? 'Server configuration error. Please contact support.'
                    : 'An error occurred during sign up. Please try again.'}
                </p>
              </div>
            )}
            <Button
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              onClick={async () => {
                try {
                  // Get callback URL from query params if available
                  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
                  
                  // Validate callbackUrl is safe
                  const safeCallbackUrl = callbackUrl.startsWith('/') && 
                    !callbackUrl.includes('//') && 
                    !callbackUrl.includes(':') 
                    ? callbackUrl 
                    : '/dashboard'
                  
                  const result = await signIn('google', { 
                    callbackUrl: safeCallbackUrl,
                    redirect: true 
                  })
                  
                  // If redirect is false, handle manually
                  if (result?.error) {
                    console.error('Sign up error:', result.error)
                    window.location.href = `/sign-up?error=${result.error}`
                  }
                } catch (error: any) {
                  console.error('Sign up error:', error)
                  // Redirect to error page
                  window.location.href = `/sign-up?error=${encodeURIComponent(error?.message || 'UnknownError')}`
                }
              }}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign up with Google
              <Rocket className="ml-2 h-5 w-5" />
            </Button>

            {/* Benefits */}
            <div className="space-y-3 pt-4 border-t border-purple-200/50">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
                <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">Free tier available - Start analyzing today</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
                <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">AI-powered insights and recommendations</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
                <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">No credit card required to start</p>
              </div>
            </div>

            <p className="text-center text-sm text-purple-600 dark:text-purple-400 font-medium pt-2">
              Already have an account?{' '}
              <Link href="/sign-in" className="text-purple-700 dark:text-purple-300 font-bold hover:text-purple-900 dark:hover:text-purple-200 hover:underline transition-colors">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-purple-500 dark:text-purple-400 mt-6">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <SignUpForm />
    </Suspense>
  )
}

