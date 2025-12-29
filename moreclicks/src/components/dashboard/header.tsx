'use client'

import { useSession, signOut } from 'next-auth/react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { User } from 'lucide-react'

export function Header() {
  const { data: session } = useSession()

  return (
    <header className="relative flex h-16 items-center justify-between border-b-2 border-blue-300/50 dark:border-blue-800/50 bg-blue-600 dark:bg-gray-900 px-6 shadow-lg overflow-hidden">
      <div className="absolute inset-0 bg-blue-700/30 dark:bg-gray-800/50"></div>
      <div className="relative z-10 flex items-center gap-2">
        <div className="relative w-10 h-10 flex-shrink-0 group translate-x-1 translate-y-1">
          <Image 
            src="/best seo tool.svg" 
            alt="MoreClicks Logo" 
            width={40} 
            height={40} 
            className="object-contain drop-shadow-lg group-hover:rotate-12 transition-transform duration-300"
          />
        </div>
        <h2 className="text-xl font-black tracking-tight">
          <span className="text-yellow-400 font-extrabold">more</span>
          <span className="text-cyan-300 font-extrabold">clicks</span>
          <span className="text-white font-extrabold">.io</span>
          <span className="text-white font-bold ml-3">Dashboard</span>
        </h2>
      </div>
      <div className="relative z-10 flex items-center gap-4">
        {session?.user && (
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="flex items-center gap-2 rounded-full bg-white/20 dark:bg-white/10 px-3 py-1.5 text-sm text-white dark:text-gray-200 backdrop-blur-sm hover:bg-white/30 dark:hover:bg-white/20 transition-all duration-200 hover:scale-105">
              <User className="h-4 w-4 text-purple-200 dark:text-purple-300" />
              <span className="font-medium">{session.user.name || 'User'}</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={async () => {
                try {
                  await signOut({ callbackUrl: '/' })
                } catch (error) {
                  console.error('Sign out error:', error)
                  // Fallback: redirect manually if signOut fails
                  window.location.href = '/'
                }
              }}
              className="bg-white/90 dark:bg-gray-800/90 text-purple-600 dark:text-purple-300 hover:bg-white dark:hover:bg-gray-800 hover:text-purple-700 dark:hover:text-purple-200 border-white/30 dark:border-gray-700 font-semibold transition-all duration-200 hover:scale-105"
            >
              Sign Out
            </Button>
          </div>
        )}
      </div>
      {/* Animated wave below topbar */}
      <div className="animated-wave"></div>
      {/* Floating particles */}
      <div className="floating-particles">
        <div className="particle" style={{ left: '10%' }}></div>
        <div className="particle" style={{ left: '30%' }}></div>
        <div className="particle" style={{ left: '50%' }}></div>
        <div className="particle" style={{ left: '70%' }}></div>
        <div className="particle" style={{ left: '90%' }}></div>
      </div>
    </header>
  )
}

