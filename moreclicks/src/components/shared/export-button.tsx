'use client'

import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

interface ExportButtonProps {
  data: any
  filename: string
  format?: 'json' | 'csv'
  children?: React.ReactNode
}

export function ExportButton({ data, filename, format = 'json', children }: ExportButtonProps) {
  const handleExport = () => {
    if (format === 'json') {
      const jsonStr = JSON.stringify(data, null, 2)
      const blob = new Blob([jsonStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${filename}.json`
      link.click()
      URL.revokeObjectURL(url)
    } else if (format === 'csv') {
      // Simple CSV conversion (works for arrays of objects)
      if (Array.isArray(data) && data.length > 0) {
        const headers = Object.keys(data[0])
        const rows = data.map((item) =>
          headers.map((header) => {
            const value = item[header]
            return typeof value === 'string' && value.includes(',')
              ? `"${value}"`
              : value
          })
        )
        const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${filename}.csv`
        link.click()
        URL.revokeObjectURL(url)
      }
    }
  }

  return (
    <Button variant="outline" onClick={handleExport}>
      {children || (
        <>
          <Download className="mr-2 h-4 w-4" />
          Export {format.toUpperCase()}
        </>
      )}
    </Button>
  )
}

