import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    // Allow access to public routes
    if (
      req.nextUrl.pathname.startsWith('/sign-in') ||
      req.nextUrl.pathname.startsWith('/sign-up') ||
      req.nextUrl.pathname.startsWith('/pricing') ||
      req.nextUrl.pathname === '/'
    ) {
      return NextResponse.next()
    }

    // Protect dashboard routes
    if (req.nextUrl.pathname.startsWith('/dashboard')) {
      if (!req.nextauth.token) {
        return NextResponse.redirect(new URL('/sign-in', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: ['/dashboard/:path*'],
}

