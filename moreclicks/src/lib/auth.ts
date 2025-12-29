import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import { prisma } from './prisma'

// Validate Google OAuth credentials
const googleClientId = process.env.GOOGLE_CLIENT_ID
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET

if (!googleClientId || !googleClientSecret || googleClientId === '' || googleClientSecret === '') {
  console.error('⚠️  Google OAuth credentials are missing!')
  console.error('Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your .env.local file')
  console.error('See SETUP.md for instructions on how to get Google OAuth credentials')
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    GoogleProvider({
      clientId: googleClientId || 'missing-client-id',
      clientSecret: googleClientSecret || 'missing-client-secret',
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in - store user data in token
      if (user) {
        token.id = user.id
        token.email = user.email || ''
        token.name = user.name || null
        token.picture = user.image || null
      }
      // Ensure email is always available
      if (!token.email && user?.email) {
        token.email = user.email
      }
      return token
    },
    async session({ session, token }) {
      // Ensure session has user data from token
      if (session.user && token) {
        (session.user as any).id = token.id as string
        session.user.email = (token.email as string) || ''
        session.user.name = (token.name as string) || null
        session.user.image = (token.picture as string) || null
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // Allow sign in - PrismaAdapter will handle user creation/update
      if (!user.email) {
        console.error('User email is missing')
        return false
      }
      console.log('Sign in successful for user:', user.email)
      return true
    },
    async redirect({ url, baseUrl }) {
      // Handle redirect after sign in
      // Use NEXTAUTH_URL if available, otherwise use baseUrl
      const nextAuthUrl = process.env.NEXTAUTH_URL || baseUrl
      
      // If url is a relative path, make it absolute
      if (url.startsWith('/')) {
        // Ensure it's a valid path (not containing // or protocol)
        if (!url.includes('//') && !url.includes(':')) {
          return `${nextAuthUrl}${url}`
        }
      }
      
      // If url is on the same origin, allow it
      try {
        const urlObj = new URL(url)
        const baseUrlObj = new URL(nextAuthUrl)
        if (urlObj.origin === baseUrlObj.origin) {
          // Validate the path is safe
          if (urlObj.pathname.startsWith('/') && !urlObj.pathname.includes('//')) {
            return url
          }
        }
      } catch (e) {
        // Invalid URL, fall through to default
        console.error('Invalid redirect URL:', url, e)
      }
      
      // Default to dashboard
      return `${nextAuthUrl}/dashboard`
    },
  },
  pages: {
    signIn: '/sign-in',
    error: '/error', // Redirect errors to error page
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
}

