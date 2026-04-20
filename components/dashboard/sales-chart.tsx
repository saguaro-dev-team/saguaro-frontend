"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts'
import type { VentasMensuales } from "@/lib/types"

interface SalesChartProps {
  data: VentasMensuales[]
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    notation: 'compact'
  }).format(value)
}

export function SalesChart({ data }: SalesChartProps) {
  return (
    <Card className="bg-card border-border col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-foreground">Ventas Mensuales</CardTitle>
        <CardDescription className="text-muted-foreground">
          Evolución de ingresos durante el año
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.65 0.15 145)" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="oklch(0.65 0.15 145)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.01 260)" />
              <XAxis 
                dataKey="mes" 
                stroke="oklch(0.65 0 0)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="oklch(0.65 0 0)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'oklch(0.16 0.01 260)',
                  border: '1px solid oklch(0.28 0.01 260)',
                  borderRadius: '8px',
                  color: 'oklch(0.98 0 0)'
                }}
                formatter={(value: number) => [formatCurrency(value), 'Ventas']}
                labelStyle={{ color: 'oklch(0.65 0 0)' }}
              />
              <Area
                type="monotone"
                dataKey="ventas"
                stroke="oklch(0.65 0.15 145)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorVentas)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
