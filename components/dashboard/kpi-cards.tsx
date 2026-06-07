"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  TrendingUp,
  AlertTriangle,
  Package,
  Layers
} from "lucide-react"
import type { KPIData } from "@/lib/types"

interface KPICardsProps {
  data: KPIData
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0
  }).format(value)
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('es-CL').format(value)
}

export function KPICards({ data }: KPICardsProps) {
  const kpis = [
    {
      title: "Ticket Promedio",
      value: formatCurrency(data.ticketPromedio),
      description: "Gasto medio por cliente",
      icon: DollarSign,
      trend: "+12.5%",
      trendUp: true
    },
    {
      title: "Ventas Totales",
      value: formatCurrency(data.totalVentas),
      description: "Ingresos del período",
      icon: TrendingUp,
      trend: "+8.2%",
      trendUp: true
    },
    {
      title: "Total Pedidos",
      value: formatNumber(data.totalPedidos),
      description: "Órdenes completadas",
      icon: ShoppingCart,
      trend: "+15.3%",
      trendUp: true
    },
    {
      title: "Clientes Registrados",
      value: formatNumber(data.clientesRegistrados),
      description: "Usuarios activos",
      icon: Users,
      trend: "+22.1%",
      trendUp: true
    },
    {
      title: "Variantes de Calzado",
      value: formatNumber(data.totalVariantes),
      description: "Tallas y colores activos",
      icon: Layers,
      trend: "Total en catálogo",
      trendUp: true
    },
    {
      title: "Tasa de Conversión",
      value: `${data.tasaConversion}%`,
      description: "Visitas a compras",
      icon: Package,
      trend: "+0.8%",
      trendUp: true
    },
    {
      title: "Stock Crítico",
      value: formatNumber(data.productosConStockCritico),
      description: "Productos bajo mínimo",
      icon: AlertTriangle,
      trend: "-2",
      trendUp: false,
      isWarning: true
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7">
      {kpis.map((kpi) => (
        <Card key={kpi.title} className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {kpi.title}
            </CardTitle>
            <kpi.icon className={`h-4 w-4 ${kpi.isWarning ? 'text-warning' : 'text-primary'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{kpi.value}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs font-medium ${
                kpi.isWarning 
                  ? 'text-warning' 
                  : kpi.trendUp 
                    ? 'text-primary' 
                    : 'text-destructive'
              }`}>
                {kpi.trend}
              </span>
              <span className="text-xs text-muted-foreground">{kpi.description}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
