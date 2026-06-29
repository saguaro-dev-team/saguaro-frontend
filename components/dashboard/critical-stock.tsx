"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { AlertTriangle, Plus, CheckCircle2, TrendingDown, Clock } from "lucide-react"
import type { StockCritico } from "@/lib/types"

interface CriticalStockProps {
  data: StockCritico[]
}

export function CriticalStock({ data }: CriticalStockProps) {
  const [selectedProduct, setSelectedProduct] = useState<StockCritico | null>(null)
  const [stockToAdd, setStockToAdd] = useState("10")
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [localData, setLocalData] = useState<StockCritico[]>(data)
  const [searchTerm, setSearchTerm] = useState("")

  // Sync localData when prop changes
  if (data !== localData && !dialogOpen) {
    setLocalData(data)
  }

  const getUrgencyColor = (dias: number) => {
    if (dias <= 3) return "bg-destructive/20 text-destructive border-destructive/30"
    if (dias <= 7) return "bg-warning/20 text-warning border-warning/30"
    return "bg-primary/20 text-primary border-primary/30"
  }

  const getUrgencyLabel = (dias: number) => {
    if (dias <= 3) return "Urgente"
    if (dias <= 7) return "Alerta"
    return "Monitor"
  }

  const getAgotamientoFecha = (diasRestantes: number) => {
    const fecha = new Date()
    fecha.setDate(fecha.getDate() + Math.round(diasRestantes))
    return fecha.toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })
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
      // Optimistic update
      setLocalData(prev => prev.map(p => {
        if (p.id_producto !== selectedProduct.id_producto) return p
        const newStock = p.stock + amount
        const newDias = newStock / p.velocidadVenta
        return { ...p, stock: newStock, diasRestantes: newDias }
      }).filter(p => p.stock < 10)) // remove from list if no longer critical
      setDialogOpen(false)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const filteredData = localData.filter(producto => 
    producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (producto.codigo_sku && producto.codigo_sku.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <>
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <CardTitle className="text-foreground">Stock Crítico</CardTitle>
          </div>
          <CardDescription className="text-muted-foreground">
            Solo productos activos · Predicción de agotamiento basada en ventas de los últimos 30 días
          </CardDescription>
        </CardHeader>
        <CardContent>
          {localData.length === 0 ? (
            // Estado vacío — todo el inventario está bien
            <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
              <CheckCircle2 className="h-10 w-10 text-primary/60" />
              <p className="text-sm font-medium text-foreground">Sin productos críticos</p>
              <p className="text-xs text-muted-foreground">
                Todos los productos activos tienen stock suficiente
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <Input
                placeholder="Buscar por SKU o nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-background border-border"
              />
              
              {filteredData.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No se encontraron productos coincidentes
                </div>
              ) : (
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  {filteredData.map((producto) => (
                    <div
                      key={producto.id_producto}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border hover:bg-secondary/70 transition-colors"
                    >
                      <div className="flex-1 min-w-0 mr-2">
                        <p className="text-sm font-medium text-foreground truncate">
                          {producto.nombre}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] font-mono font-bold tracking-wider text-muted-foreground bg-muted border border-border px-1.5 py-0.5 rounded">
                            SKU: {producto.codigo_sku}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            Stock: <span className="text-foreground font-medium">{Math.round(producto.stock)}</span>
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <TrendingDown className="h-3 w-3" />
                            {producto.velocidadVenta.toFixed(1)}/día
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Se agota ~{getAgotamientoFecha(producto.diasRestantes)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-auto shrink-0">
                        <div className="text-center min-w-[50px]">
                          <Badge
                            variant="outline"
                            className={`${getUrgencyColor(producto.diasRestantes)} text-[10px] px-1.5 py-0`}
                          >
                            {getUrgencyLabel(producto.diasRestantes)}
                          </Badge>
                          <p className="text-base font-bold text-foreground leading-none mt-1">{Math.round(producto.diasRestantes)}</p>
                          <p className="text-[10px] text-muted-foreground">días</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1 text-xs"
                          onClick={() => handleAddStockClick(producto)}
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Añadir
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Añadir Stock</DialogTitle>
            <DialogDescription>
              Producto: <span className="font-semibold text-foreground">{selectedProduct?.nombre}</span>
              {selectedProduct?.codigo_sku && (
                <span className="block mt-1 font-mono text-xs text-muted-foreground">SKU: {selectedProduct.codigo_sku}</span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="rounded-lg bg-muted/50 border border-border p-3 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Stock actual</span>
                <span className="font-medium">{selectedProduct ? Math.round(selectedProduct.stock) : 0} unidades</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Velocidad de venta</span>
                <span className="font-medium">{selectedProduct?.velocidadVenta.toFixed(1)} unid/día</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Días restantes (actual)</span>
                <span className={`font-medium ${selectedProduct && selectedProduct.diasRestantes <= 3 ? 'text-destructive' : 'text-warning'}`}>
                  {selectedProduct ? Math.round(selectedProduct.diasRestantes) : 0} días
                </span>
              </div>
              {selectedProduct && (
                <div className="flex justify-between border-t border-border pt-1 mt-1">
                  <span className="text-muted-foreground">Días tras añadir {stockToAdd || 0}</span>
                  <span className="font-medium text-primary">
                    {Math.round((selectedProduct.stock + (parseInt(stockToAdd) || 0)) / selectedProduct.velocidadVenta)} días
                  </span>
                </div>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Cantidad a añadir
              </label>
              <Input
                type="number"
                value={stockToAdd}
                onChange={(e) => setStockToAdd(e.target.value)}
                min="1"
                placeholder="Ej: 10"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={loading}>Cancelar</Button>
            <Button onClick={handleSaveStock} disabled={loading || !stockToAdd || parseInt(stockToAdd) <= 0}>
              {loading ? "Guardando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
