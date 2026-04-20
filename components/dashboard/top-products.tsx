"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { ProductoVendido } from "@/lib/types"

interface TopProductsProps {
  data: ProductoVendido[]
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0
  }).format(value)
}

export function TopProducts({ data }: TopProductsProps) {
  const maxCantidad = Math.max(...data.map(p => p.cantidad))

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Productos Más Vendidos</CardTitle>
        <CardDescription className="text-muted-foreground">
          Top 5 productos con mayor rotación
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((producto, index) => (
            <div key={producto.nombre} className="flex items-center gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground truncate">
                    {producto.nombre}
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    {producto.categoria}
                  </Badge>
                </div>
                <div className="mt-1 h-2 w-full rounded-full bg-secondary overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${(producto.cantidad / maxCantidad) * 100}%` }}
                  />
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">{producto.cantidad} uds</p>
                <p className="text-xs text-muted-foreground">{formatCurrency(producto.ingresos)}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
