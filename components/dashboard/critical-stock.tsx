"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle } from "lucide-react"
import type { StockCritico } from "@/lib/types"

interface CriticalStockProps {
  data: StockCritico[]
}

export function CriticalStock({ data }: CriticalStockProps) {
  const getUrgencyColor = (dias: number) => {
    if (dias <= 3) return "bg-destructive/20 text-destructive border-destructive/30"
    if (dias <= 5) return "bg-warning/20 text-warning border-warning/30"
    return "bg-primary/20 text-primary border-primary/30"
  }

  const getUrgencyLabel = (dias: number) => {
    if (dias <= 3) return "Urgente"
    if (dias <= 5) return "Alerta"
    return "Monitor"
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          <CardTitle className="text-foreground">Stock Crítico</CardTitle>
        </div>
        <CardDescription className="text-muted-foreground">
          Productos con inventario bajo según velocidad de venta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((producto) => (
            <div 
              key={producto.id_producto} 
              className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {producto.nombre}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-muted-foreground">
                    Stock: <span className="text-foreground font-medium">{producto.stock}</span>
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Venta/día: <span className="text-foreground font-medium">{producto.velocidadVenta.toFixed(1)}</span>
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline" 
                  className={`${getUrgencyColor(producto.diasRestantes)} text-xs`}
                >
                  {getUrgencyLabel(producto.diasRestantes)}
                </Badge>
                <div className="text-right">
                  <p className="text-lg font-bold text-foreground">{producto.diasRestantes}</p>
                  <p className="text-xs text-muted-foreground">días</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
