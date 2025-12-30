'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Search, Users, Settings, CreditCard, BarChart3, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Analyze', href: '/dashboard/analyze', icon: Search },
  { name: 'Keywords', href: '/dashboard/keywords', icon: BarChart3 },
  { name: 'Competitors', href: '/dashboard/competitors', icon: Users },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
]

// Helper to check if pathname matches or is a child of href
const isActivePath = (pathname: string | null, href: string) => {
  if (!pathname) return false
  if (pathname === href) return true
  if (href !== '/dashboard' && pathname.startsWith(href + '/')) return true
  return false
}

export function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-16 left-0 right-0 z-40 bg-blue-600 dark:bg-gray-900 border-b border-blue-300/50 dark:border-blue-800/50 px-3 sm:px-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="text-white hover:bg-white/20"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          <span className="ml-2 text-sm font-medium">Menu</span>
        </Button>
      </div>

      {/* Sidebar */}
      <div className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 flex h-full w-64 flex-col border-r border-border dark:border-gray-800 bg-card dark:bg-gray-900 transform transition-transform duration-300 ease-in-out",
        "lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Overlay for mobile */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-[-1] lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
        
        <div className="flex h-16 items-center border-b border-border dark:border-gray-800 px-4 sm:px-6">
          <h1 className="text-lg sm:text-xl font-bold text-foreground dark:text-gray-100">SEO Analyzer</h1>
        </div>
        <nav className="flex-1 space-y-1 px-2 sm:px-3 py-4 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = isActivePath(pathname, item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'flex items-center gap-2 sm:gap-3 rounded-lg px-2 sm:px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <item.icon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </>
  )
}

