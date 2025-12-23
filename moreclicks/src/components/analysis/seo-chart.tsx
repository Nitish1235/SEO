'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface SEOChartProps {
  data: {
    name: string
    score: number
    status: 'pass' | 'warning' | 'critical'
  }[]
}

export function SEOChart({ data }: SEOChartProps) {
  const chartData = data.map((item) => ({
    name: item.name,
    score: item.score,
    fill:
      item.status === 'pass'
        ? '#10B981'
        : item.status === 'warning'
          ? '#F59E0B'
          : '#EF4444',
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Metrics Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={100}
              fontSize={12}
            />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Bar dataKey="score" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

