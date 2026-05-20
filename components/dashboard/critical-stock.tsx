"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { AlertTriangle, Plus } from "lucide-react"
import type { StockCritico } from "@/lib/types"

interface CriticalStockProps {
  data: StockCritico[]
}

export function CriticalStock({ data }: CriticalStockProps) {
  const [selectedProduct, setSelectedProduct] = useState<StockCritico | null>(null)
  const [stockToAdd, setStockToAdd] = useState("10")
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

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

  const handleAddStockClick = (producto: StockCritico) => {
    setSelectedProduct(producto)
    setStockToAdd("10")
    setDialogOpen(true)
  }

  const handleSaveStock = async () => {
    if (!selectedProduct) return
    const amount = parseInt(stockToAdd)
    if (isNaN(amount) || amount <= 0) return

    setLoading(true)
    try {
      const { addStockToProduct } = await import('@/app/actions/admin')
      await addStockToProduct(selectedProduct.id_producto, amount)
      // Optimistic visual update (or they can click refresh on dashboard)
      selectedProduct.stock += amount
      selectedProduct.diasRestantes = selectedProduct.stock * (1 / selectedProduct.velocidadVenta)
      setDialogOpen(false)
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
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border hover:bg-secondary/70 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {producto.nombre}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-muted-foreground">
                      Stock: <span className="text-foreground font-medium">{Math.round(producto.stock)}</span>
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
                    <p className="text-lg font-bold text-foreground">{Math.round(producto.diasRestantes)}</p>
                    <p className="text-xs text-muted-foreground">días</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleAddStockClick(producto)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Añadir Stock</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              ¿Cuánto stock deseas añadir para <span className="font-semibold text-foreground">{selectedProduct?.nombre}</span>?
            </p>
            <Input 
              type="number" 
              value={stockToAdd} 
              onChange={(e) => setStockToAdd(e.target.value)} 
              min="1"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={loading}>Cancelar</Button>
            <Button onClick={handleSaveStock} disabled={loading}>
              {loading ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
