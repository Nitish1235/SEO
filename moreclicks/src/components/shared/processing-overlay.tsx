'use client'

import { useEffect, useState, useRef } from 'react'
import { Zap, Loader2 } from 'lucide-react'

interface ProcessingOverlayProps {
  isProcessing: boolean
  message?: string
  subMessage?: string
}

export function ProcessingOverlay({ 
  isProcessing, 
  message = 'Processing your request...',
  subMessage 
}: ProcessingOverlayProps) {
  const [dots, setDots] = useState('')
  const [progress, setProgress] = useState(0)
  const progressRef = useRef(0)
  const animationFrameRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (!isProcessing) {
      setProgress(0)
      progressRef.current = 0
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      return
    }

    // Reset progress when starting
    setProgress(0)
    progressRef.current = 0

    // Animate dots
    const dotsInterval = setInterval(() => {
      setDots((prev) => {
        if (prev === '...') return ''
        return prev + '.'
      })
    }, 500)

    // Animate progress bar smoothly from 0 to 90%
    // Use a faster, more visible animation
    const startTime = Date.now()
    const duration = 20000 // 20 seconds to reach 90%
    const targetProgress = 90

    const animate = () => {
      if (!isProcessing) {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
        return
      }

      const elapsed = Date.now() - startTime
      const newProgress = Math.min((elapsed / duration) * targetProgress, targetProgress)
      
      progressRef.current = newProgress
      setProgress(newProgress)

      if (newProgress < targetProgress) {
        animationFrameRef.current = requestAnimationFrame(animate)
      }
    }

    // Start animation immediately
    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      clearInterval(dotsInterval)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isProcessing])

  // Complete progress when processing finishes
  useEffect(() => {
    if (!isProcessing && progress > 0) {
      // Quickly complete to 100%
      const completeInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(completeInterval)
            return 100
          }
          return Math.min(prev + 5, 100)
        })
      }, 50)

      // Reset after a short delay
      setTimeout(() => {
        setProgress(0)
        progressRef.current = 0
      }, 500)

      return () => clearInterval(completeInterval)
    }
  }, [isProcessing, progress])

  if (!isProcessing) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md">
      <div className="relative flex flex-col items-center justify-center space-y-6 p-8">
        {/* Animated Logo Container */}
        <div className="relative">
          {/* Pulsing Background Circles */}
          <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" style={{ animationDuration: '2s' }} />
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse" style={{ animationDuration: '1.5s' }} />
          
          {/* Logo Container */}
          <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10 border-2 border-primary/40 flex items-center justify-center shadow-2xl shadow-primary/20">
            {/* Rotating Rings */}
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-primary/60 animate-spin" style={{ animationDuration: '2s' }} />
            <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-primary/50 border-l-primary/40 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
            <div className="absolute inset-4 rounded-full border-2 border-transparent border-t-primary/30 border-r-primary/20 animate-spin" style={{ animationDuration: '3s' }} />
            
            {/* Center Icon */}
            <div className="relative z-10">
              <Zap className="h-12 w-12 text-primary animate-pulse" fill="currentColor" style={{ filter: 'drop-shadow(0 0 8px hsl(var(--primary)))' }} />
            </div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold text-foreground flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span>{message}</span>
            <span className="inline-block w-6 text-left text-primary">{dots}</span>
          </h3>
          {subMessage && (
            <p className="text-sm text-muted-foreground">{subMessage}</p>
          )}
        </div>

        {/* Animated Progress Bar */}
        <div className="w-80 h-2 bg-muted/50 rounded-full overflow-hidden shadow-inner border border-border/50">
          <div 
            className="h-full bg-gradient-to-r from-primary via-primary to-primary/90 rounded-full shadow-lg shadow-primary/50"
            style={{ 
              width: `${Math.max(0, Math.min(100, progress))}%`,
              background: 'linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--primary)) 100%)',
              boxShadow: '0 0 10px hsl(var(--primary) / 0.5)',
              transition: 'width 0.1s linear',
            }} 
          />
        </div>
      </div>
    </div>
  )
}

