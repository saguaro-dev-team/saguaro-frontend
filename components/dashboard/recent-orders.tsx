"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Eye } from "lucide-react"
import { useState } from "react"
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
    switch (status.toLowerCase()) {
      case 'pagado':
        return 'bg-chart-2/20 text-chart-2 border-chart-2/30'
      case 'en preparación':
      case 'en preparacion':
      case 'preparando':
        return 'bg-warning/20 text-warning border-warning/30'
      case 'enviado':
        return 'bg-chart-5/20 text-chart-5 border-chart-5/30'
      case 'entregado':
        return 'bg-primary/20 text-primary border-primary/30'
      case 'cancelado':
        return 'bg-destructive/20 text-destructive border-destructive/30'
      default:
        return 'bg-secondary text-secondary-foreground'
    }
  }

  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleViewDetails = async (id_pedido: number) => {
    setLoading(true)
    setDetailsOpen(true)
    try {
      // Import dynamic to avoid top-level issues if needed, or we just call the action
      const { getOrderDetails } = await import('@/app/actions/dashboard')
      const details = await getOrderDetails(id_pedido)
      setSelectedOrder(details)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
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
                  <Badge variant="outline" className={`${getStatusColor(pedido.estado_pedido)} text-xs capitalize`}>
                    {pedido.estado_pedido}
                  </Badge>
                  <p className="text-sm font-semibold text-foreground min-w-[100px] text-right">
                    {formatCurrency(pedido.total_pagado)}
                  </p>
                  <Button variant="ghost" size="icon" onClick={() => handleViewDetails(pedido.id_pedido)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalles del Pedido</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {loading ? (
              <p className="text-center text-muted-foreground text-sm">Cargando detalles...</p>
            ) : selectedOrder ? (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="font-semibold">ID Pedido:</span>
                  <span className="font-mono">#{selectedOrder.id_pedido}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-semibold">Cliente:</span>
                  <span>{selectedOrder.usuario?.nombres} {selectedOrder.usuario?.primer_apellido}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-semibold">Total Pagado:</span>
                  <span className="font-bold text-primary">{formatCurrency(selectedOrder.total)}</span>
                </div>
                <div>
                  <span className="font-semibold block mb-2">Artículos:</span>
                  <ul className="space-y-2">
                    {selectedOrder.articulos?.map((art: any, idx: number) => (
                      <li key={idx} className="flex justify-between items-center text-xs bg-muted p-2 rounded">
                        <span>{art.cantidad}x {art.producto?.modelo?.nombre_modelo} ({art.producto?.color?.nombre_color}, Talla {art.producto?.talla?.nombre_talla})</span>
                        <span className="font-semibold">{formatCurrency(art.precio * art.cantidad)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-center text-destructive text-sm">No se pudo cargar el pedido.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
