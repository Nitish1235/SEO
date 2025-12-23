'use client'

import { useEffect, useState } from 'react'
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  duration?: number
}

let toastId = 0
const listeners = new Set<(toasts: Toast[]) => void>()
let toasts: Toast[] = []

export function showToast(message: string, type: Toast['type'] = 'info', duration = 5000) {
  const id = `toast-${++toastId}`
  const toast: Toast = { id, message, type, duration }
  toasts = [...toasts, toast]
  listeners.forEach((listener) => listener(toasts))

  if (duration > 0) {
    setTimeout(() => {
      toasts = toasts.filter((t) => t.id !== id)
      listeners.forEach((listener) => listener(toasts))
    }, duration)
  }

  return id
}

export function ToastContainer() {
  const [currentToasts, setCurrentToasts] = useState<Toast[]>([])

  useEffect(() => {
    const listener = (newToasts: Toast[]) => {
      setCurrentToasts(newToasts)
    }
    listeners.add(listener)
    setCurrentToasts(toasts)

    return () => {
      listeners.delete(listener)
    }
  }, [])

  const icons = {
    success: CheckCircle2,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  }

  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  }

  if (currentToasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {currentToasts.map((toast) => {
        const Icon = icons[toast.type]
        return (
          <div
            key={toast.id}
            className={cn(
              'flex items-center gap-3 rounded-lg border p-4 shadow-lg min-w-[300px] max-w-md',
              colors[toast.type]
            )}
          >
            <Icon className="h-5 w-5 flex-shrink-0" />
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            <button
              onClick={() => {
                toasts = toasts.filter((t) => t.id !== toast.id)
                listeners.forEach((listener) => listener(toasts))
              }}
              className="flex-shrink-0 text-current opacity-70 hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}

