"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts'

interface HourlyChartProps {
  data: {
    hora: string
    ventas: number
  }[]
}

export function HourlyChart({ data }: HourlyChartProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Distribución Horaria</CardTitle>
        <CardDescription className="text-muted-foreground">
          Pedidos por hora del día (promedio)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.01 260)" />
              <XAxis 
                dataKey="hora" 
                stroke="oklch(0.65 0 0)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="oklch(0.65 0 0)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'oklch(0.16 0.01 260)',
                  border: '1px solid oklch(0.28 0.01 260)',
                  borderRadius: '8px',
                  color: 'oklch(0.98 0 0)'
                }}
                formatter={(value: number) => [value, 'Pedidos']}
                labelStyle={{ color: 'oklch(0.65 0 0)' }}
              />
              <Line
                type="monotone"
                dataKey="ventas"
                stroke="oklch(0.7 0.18 200)"
                strokeWidth={2}
                dot={{ fill: 'oklch(0.7 0.18 200)', strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5, fill: 'oklch(0.7 0.18 200)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
