import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname
    
    // Allow sitemap and robots files without any processing
    if (pathname === '/sitemap.xml' || pathname === '/robots.txt') {
      return NextResponse.next()
    }
    
    const isAuthPage = pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up')
    const isPublicPage = pathname.startsWith('/pricing') || pathname === '/' || pathname.startsWith('/blog') || pathname.startsWith('/about') || pathname.startsWith('/contact') || pathname.startsWith('/privacy') || pathname.startsWith('/terms') || pathname.startsWith('/cookies') || pathname.startsWith('/disclaimer')
    const isDashboard = pathname.startsWith('/dashboard')
    const isApiAuth = pathname.startsWith('/api/auth')

    // Don't interfere with NextAuth API routes
    if (isApiAuth) {
      return NextResponse.next()
    }

    // If authenticated and on auth page, redirect to dashboard
    if (token && isAuthPage) {
      const callbackUrl = req.nextUrl.searchParams.get('callbackUrl')
      // Validate callbackUrl is safe (starts with / and doesn't contain // or protocol)
      let redirectUrl = '/dashboard'
      if (callbackUrl && callbackUrl.startsWith('/') && !callbackUrl.includes('//') && !callbackUrl.includes(':')) {
        redirectUrl = callbackUrl
      }
      console.log('Redirecting authenticated user from auth page to:', redirectUrl)
      return NextResponse.redirect(new URL(redirectUrl, req.url))
    }

    // If not authenticated and trying to access dashboard, redirect to sign-in
    if (!token && isDashboard) {
      const signInUrl = new URL('/sign-in', req.url)
      signInUrl.searchParams.set('callbackUrl', pathname)
      console.log('Redirecting unauthenticated user to sign-in with callback:', pathname)
      return NextResponse.redirect(signInUrl)
    }

    // Allow all other requests (public pages, etc.)
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname
        
        // Always allow sitemap and robots
        if (pathname === '/sitemap.xml' || pathname === '/sitemap' || pathname === '/robots.txt' || pathname === '/robots') {
          return true
        }
        
        // Don't check authorization for NextAuth API routes
        if (pathname.startsWith('/api/auth')) {
          return true
        }
        
        // Dashboard routes require authentication
        if (pathname.startsWith('/dashboard')) {
          return !!token
        }
        
        // All other routes are allowed
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - sitemap.xml, sitemap.ts (sitemap files)
     * - robots.txt (robots file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|sitemap|robots).*)',
  ],
}

