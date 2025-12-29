'use client'

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthSessionProvider
      basePath="/api/auth"
      // NextAuth will automatically retry on CLIENT_FETCH_ERROR
      // These errors are usually harmless and occur during initial load
      // or when the API route isn't immediately available
      refetchInterval={5 * 60} // Refetch every 5 minutes
      refetchOnWindowFocus={true} // Refetch when window gains focus
    >
      {children}
    </NextAuthSessionProvider>
  )
}

