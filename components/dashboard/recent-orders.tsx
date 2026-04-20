"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Pedido } from "@/lib/types"

interface RecentOrdersProps {
  data: (Pedido & { cliente: string })[]
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0
  }).format(value)
}

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateString))
}

export function RecentOrders({ data }: RecentOrdersProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pagado':
        return 'bg-chart-2/20 text-chart-2 border-chart-2/30'
      case 'En Preparación':
        return 'bg-warning/20 text-warning border-warning/30'
      case 'Enviado':
        return 'bg-chart-5/20 text-chart-5 border-chart-5/30'
      case 'Entregado':
        return 'bg-primary/20 text-primary border-primary/30'
      case 'Cancelado':
        return 'bg-destructive/20 text-destructive border-destructive/30'
      default:
        return 'bg-secondary text-secondary-foreground'
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Pedidos Recientes</CardTitle>
        <CardDescription className="text-muted-foreground">
          Últimas órdenes procesadas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((pedido) => (
            <div 
              key={pedido.id_pedido} 
              className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border hover:bg-secondary/70 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-mono">
                  #{pedido.id_pedido}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{pedido.cliente}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(pedido.fecha_pedido)}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className={`${getStatusColor(pedido.estado_pedido)} text-xs`}>
                  {pedido.estado_pedido}
                </Badge>
                <p className="text-sm font-semibold text-foreground min-w-[100px] text-right">
                  {formatCurrency(pedido.total_pagado)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
