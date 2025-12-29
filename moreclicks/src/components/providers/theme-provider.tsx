'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Initialize theme from localStorage if available (only on client)
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('theme') as Theme | null
      if (storedTheme && ['light', 'dark', 'system'].includes(storedTheme)) {
        return storedTheme
      }
    }
    return 'system'
  })
  
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
    // Initialize resolved theme based on current theme
    if (typeof window !== 'undefined') {
      const initialTheme = (() => {
        const storedTheme = localStorage.getItem('theme') as Theme | null
        if (storedTheme && ['light', 'dark', 'system'].includes(storedTheme)) {
          return storedTheme
        }
        return 'system'
      })()
      
      if (initialTheme === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      }
      return initialTheme
    }
    return 'light'
  })
  
  // Apply theme to document
  useEffect(() => {
    if (typeof window === 'undefined') return

    const root = window.document.documentElement
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark')

    let resolved: 'light' | 'dark' = 'light'

    if (theme === 'system') {
      // Use system preference
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      resolved = systemTheme
      root.classList.add(systemTheme)
    } else {
      resolved = theme
      root.classList.add(theme)
    }

    setResolvedTheme(resolved)
  }, [theme])

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined' || theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      const root = window.document.documentElement
      root.classList.remove('light', 'dark')
      const newTheme = e.matches ? 'dark' : 'light'
      root.classList.add(newTheme)
      setResolvedTheme(newTheme)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme)
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme)
    }
  }

  // Always provide the context - this prevents the "must be used within ThemeProvider" error
  const contextValue: ThemeContextType = {
    theme,
    resolvedTheme,
    setTheme: handleSetTheme,
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

