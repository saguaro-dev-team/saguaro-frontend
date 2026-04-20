"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts'

interface CategoryChartProps {
  data: {
    categoria: string
    ventas: number
    porcentaje: number
  }[]
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    notation: 'compact'
  }).format(value)
}

const COLORS = [
  'oklch(0.65 0.15 145)',
  'oklch(0.7 0.18 200)',
  'oklch(0.75 0.15 80)',
  'oklch(0.6 0.2 35)',
  'oklch(0.65 0.18 280)'
]

export function CategoryChart({ data }: CategoryChartProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Ventas por Categoría</CardTitle>
        <CardDescription className="text-muted-foreground">
          Distribución de ingresos por línea de producto
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.01 260)" horizontal={false} />
              <XAxis 
                type="number"
                stroke="oklch(0.65 0 0)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <YAxis 
                type="category"
                dataKey="categoria"
                stroke="oklch(0.65 0 0)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={80}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'oklch(0.16 0.01 260)',
                  border: '1px solid oklch(0.28 0.01 260)',
                  borderRadius: '8px',
                  color: 'oklch(0.98 0 0)'
                }}
                formatter={(value: number, _name: string, props: { payload: { porcentaje: number } }) => [
                  `${formatCurrency(value)} (${props.payload.porcentaje}%)`, 
                  'Ventas'
                ]}
                labelStyle={{ color: 'oklch(0.65 0 0)' }}
              />
              <Bar dataKey="ventas" radius={[0, 4, 4, 0]}>
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
