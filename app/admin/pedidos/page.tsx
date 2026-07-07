'use client'

import { useState, useEffect } from 'react'
import { Search, Eye, MoreHorizontal, Package, Truck, CheckCircle, Clock, FileDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getAdminOrders, updateOrderStatus } from '@/app/actions/orders'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'


// Mock orders data
const mockOrders = [
  {
    id: 'SAG-00001234',
    cliente: 'Juan Perez',
    email: 'juan@email.com',
    fecha: '2024-03-18',
    total: 109980,
    items: 2,
    estado: 'entregado',
  },
  {
    id: 'SAG-00001235',
    cliente: 'Maria Garcia',
    email: 'maria@email.com',
    fecha: '2024-03-18',
    total: 54990,
    items: 1,
    estado: 'enviado',
  },
  {
    id: 'SAG-00001236',
    cliente: 'Carlos Rodriguez',
    email: 'carlos@email.com',
    fecha: '2024-03-17',
    total: 89980,
    items: 2,
    estado: 'preparando',
  },
  {
    id: 'SAG-00001237',
    cliente: 'Ana Martinez',
    email: 'ana@email.com',
    fecha: '2024-03-17',
    total: 74990,
    items: 1,
    estado: 'pendiente',
  },
  {
    id: 'SAG-00001238',
    cliente: 'Pedro Sanchez',
    email: 'pedro@email.com',
    fecha: '2024-03-16',
    total: 129970,
    items: 3,
    estado: 'entregado',
  },
  {
    id: 'SAG-00001239',
    cliente: 'Laura Torres',
    email: 'laura@email.com',
    fecha: '2024-03-16',
    total: 44990,
    items: 1,
    estado: 'cancelado',
  },
]

const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  pendiente: { label: 'Carrito Abandonado', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  pagado: { label: 'Pagado', color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle },
  preparando: { label: 'Preparando', color: 'bg-blue-100 text-blue-800', icon: Package },
  enviado: { label: 'Enviado', color: 'bg-purple-100 text-purple-800', icon: Truck },
  entregado: { label: 'Entregado', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  cancelado: { label: 'Carrito Abandonado (Cancelado)', color: 'bg-red-100 text-red-800', icon: Clock },
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const handleViewDetails = (order: any) => {
    setSelectedOrder(order)
    setIsDetailOpen(true)
  }

  const fetchOrders = () => {
    getAdminOrders().then(res => {
      if (res.success && res.orders) {
        setOrders(res.orders)
      }
      setLoading(false)
    })
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleStatusChange = async (orderIdRaw: number, newStatus: string) => {
    const res = await updateOrderStatus(orderIdRaw, newStatus)
    if (res.success) {
      setOrders(current =>
        current.map(o => o.id_raw === orderIdRaw ? { ...o, estado: newStatus } : o)
      )
    }
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.cliente.toLowerCase().includes(searchQuery.toLowerCase())
      
    let matchesStatus = false
    if (statusFilter === 'all') {
      matchesStatus = true
    } else if (statusFilter === 'completados') {
      matchesStatus = ['pagado', 'preparando', 'enviado', 'entregado'].includes(order.estado)
    } else if (statusFilter === 'abandonados') {
      matchesStatus = ['pendiente', 'cancelado'].includes(order.estado)
    } else {
      matchesStatus = order.estado === statusFilter
    }
    
    return matchesSearch && matchesStatus
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const downloadReceiptPDF = (order: any) => {
    const doc = new jsPDF()

    // Add Logo or Header Title
    doc.setFont("helvetica", "bold")
    doc.setFontSize(22)
    doc.setTextColor(0, 0, 0)
    doc.text('BOLETA ELECTRÓNICA', 14, 25)

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(80)
    doc.text(`Nº Pedido: ${order.id}`, 14, 32)
    doc.text(`Fecha Emisión: ${new Date(order.fecha).toLocaleDateString('es-CL')}`, 14, 37)

    // Divider Line
    doc.setDrawColor(220, 220, 220)
    doc.line(14, 42, 196, 42)

    // Seller Info
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text('Emisor:', 14, 50)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.text('Comercial Saguaro Limitada', 14, 56)
    doc.text('R.U.T.: 76.543.210-K', 14, 61)
    doc.text('Av. Las Industrias 1234, Los Ángeles, Chile', 14, 66)

    // Buyer Info
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.text('Cliente:', 110, 50)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.text(order.cliente, 110, 56)
    doc.text(order.email, 110, 61)
    doc.text(`Teléfono: ${order.telefono}`, 110, 66)

    // Shipping Info
    if (order.direccion) {
      doc.text(`Despacho: ${order.direccion.calle} ${order.direccion.numero}`, 110, 71)
      doc.text(`${order.direccion.comuna}, ${order.direccion.region}`, 110, 76)
    }

    // Divider Line
    doc.line(14, 82, 196, 82)

    // Define table columns
    const tableColumn = ["Producto", "Color", "Talla", "SKU", "Cant.", "Precio Unit.", "Subtotal"]

    // Define table rows
    const tableRows = order.articulos.map((art: any) => {
      const subtotal = art.precio * art.cantidad
      return [
        art.nombre,
        art.color,
        art.talla,
        art.sku || 'N/A',
        art.cantidad.toString(),
        formatPrice(art.precio),
        formatPrice(subtotal)
      ]
    })

    // Start autoTable
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 88,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [0, 0, 0] }, // Black header style
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 20 },
        2: { cellWidth: 15, halign: 'center' },
        3: { cellWidth: 28 },
        4: { cellWidth: 15, halign: 'center' },
        5: { cellWidth: 25, halign: 'right' },
        6: { cellWidth: 25, halign: 'right' }
      }
    })

    // Totals Calculation at the end
    const lastY = (doc as any).lastAutoTable.finalY || 120
    
    doc.setFont("helvetica", "normal")
    doc.text("Neto:", 145, lastY + 12)
    doc.text("IVA (19%):", 145, lastY + 17)
    
    doc.setFont("helvetica", "bold")
    doc.text("Total CLP:", 145, lastY + 24)

    // Calculate details
    const netAmount = Math.round(order.total / 1.19)
    const ivAmount = order.total - netAmount

    doc.setFont("helvetica", "normal")
    doc.text(formatPrice(netAmount), 195, lastY + 12, { align: 'right' })
    doc.text(formatPrice(ivAmount), 195, lastY + 17, { align: 'right' })
    
    doc.setFont("helvetica", "bold")
    doc.text(formatPrice(order.total), 195, lastY + 24, { align: 'right' })

    // Save PDF
    doc.save(`boleta-${order.id}.pdf`)
  }

  const getOrderStats = () => {
    const activeOrders = orders.filter((o) => o.estado !== 'cancelado')
    return {
      total: activeOrders.length,
      pendiente: activeOrders.filter((o) => o.estado === 'pendiente').length,
      preparando: activeOrders.filter((o) => o.estado === 'pagado' || o.estado === 'preparando').length,
      enviado: activeOrders.filter((o) => o.estado === 'enviado').length,
    }
  }

  const stats = getOrderStats()

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Gestion de Pedidos
          </h1>
          <p className="text-muted-foreground mt-1">
            Administra y da seguimiento a los pedidos de tu tienda
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pedidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendiente}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-600" />
              En Preparacion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.preparando}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Truck className="h-4 w-4 text-purple-600" />
              En Camino
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.enviado}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por ID o cliente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="completados">Pedidos Completados</SelectItem>
            <SelectItem value="abandonados">Carritos Abandonados</SelectItem>
            <SelectItem value="pendiente">Pendiente</SelectItem>
            <SelectItem value="pagado">Pagado</SelectItem>
            <SelectItem value="preparando">Preparando</SelectItem>
            <SelectItem value="enviado">Enviado</SelectItem>
            <SelectItem value="entregado">Entregado</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-center">Items</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Cargando pedidos...
                  </TableCell>
                </TableRow>
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No se encontraron pedidos.
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => {
                  const status = statusConfig[order.estado] || {
                    label: order.estado ? order.estado.charAt(0).toUpperCase() + order.estado.slice(1) : 'Pendiente',
                    color: 'bg-gray-100 text-gray-800',
                    icon: Clock
                  }
                  const StatusIcon = status.icon

                  return (
                    <TableRow key={order.id}>
                      <TableCell>
                        <p className="font-mono font-medium">{order.id}</p>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.cliente}</p>
                          <p className="text-sm text-muted-foreground">{order.email}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 font-medium text-amber-700 dark:text-amber-500">Tel: {order.telefono}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(order.fecha).toLocaleDateString('es-CL')}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatPrice(order.total)}
                      </TableCell>
                      <TableCell className="text-center">{order.items}</TableCell>
                      <TableCell>
                        <Badge className={`${status.color} gap-1`}>
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Acciones</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(order)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver detalles
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleStatusChange(order.id_raw, 'pendiente')}>Marcar como Carrito Abandonado</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(order.id_raw, 'pagado')}>Marcar como Pagado</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(order.id_raw, 'preparando')}>Marcar como Preparando</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(order.id_raw, 'enviado')}>Marcar como Enviado</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(order.id_raw, 'entregado')}>Marcar como Entregado</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={() => handleStatusChange(order.id_raw, 'cancelado')}>
                              Marcar como Cancelado
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="mt-4 text-sm text-muted-foreground">
        Mostrando {filteredOrders.length} de {orders.length} pedidos
      </div>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center justify-between flex-wrap gap-2 w-full pr-6">
              <span>Detalle de Pedido: <span className="font-mono text-primary">{selectedOrder?.id}</span></span>
              {selectedOrder && (
                <Button
                  onClick={() => downloadReceiptPDF(selectedOrder)}
                  size="sm"
                  className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs gap-1.5 h-8 flex items-center"
                >
                  <FileDown className="h-3.5 w-3.5" />
                  Descargar Boleta PDF
                </Button>
              )}
            </DialogTitle>
            <DialogDescription>
              Realizado el {selectedOrder ? new Date(selectedOrder.fecha).toLocaleDateString('es-CL', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : ''}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6 mt-4">
              {/* Cliente y Contacto */}
              <div className="grid gap-4 sm:grid-cols-2 bg-muted/40 p-4 rounded-lg border">
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-2">Comprador</h3>
                  <p className="font-medium text-base">{selectedOrder.cliente}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{selectedOrder.email}</p>
                  <p className="text-sm font-semibold text-primary mt-2">
                    <a href={`tel:${selectedOrder.telefono}`} className="hover:underline flex items-center gap-1.5">
                      📞 Llamar: {selectedOrder.telefono}
                    </a>
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-2">Despacho</h3>
                  {selectedOrder.direccion ? (
                    <div className="text-sm space-y-1">
                      <p className="font-medium">{selectedOrder.direccion.calle} {selectedOrder.direccion.numero}</p>
                      {selectedOrder.direccion.departamento && (
                        <p>Dpto/Block: {selectedOrder.direccion.departamento}</p>
                      )}
                      {selectedOrder.direccion.detalles && (
                        <p className="text-xs text-muted-foreground italic">Nota: {selectedOrder.direccion.detalles}</p>
                      )}
                      <p className="text-xs font-semibold text-muted-foreground uppercase">{selectedOrder.direccion.comuna}, {selectedOrder.direccion.region}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No se especificó dirección o retiro en tienda.</p>
                  )}
                </div>
              </div>

              {/* Detalle de Productos */}
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">Productos</h3>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead className="text-center">Variante</TableHead>
                        <TableHead className="text-center">Cant.</TableHead>
                        <TableHead className="text-right">Precio</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.articulos?.map((art: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            <span className="block font-semibold">{art.nombre}</span>
                            <span className="text-[10px] font-mono text-muted-foreground bg-muted border px-1.5 py-0.5 rounded w-max mt-1 block font-bold">
                              SKU: {art.sku}
                            </span>
                          </TableCell>
                          <TableCell className="text-center text-xs text-muted-foreground">
                            Color: {art.color} <br /> Talla: {art.talla}
                          </TableCell>
                          <TableCell className="text-center">{art.cantidad}</TableCell>
                          <TableCell className="text-right">{formatPrice(art.precio)}</TableCell>
                          <TableCell className="text-right font-medium">{formatPrice(art.precio * art.cantidad)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Total y Resumen */}
              <div className="flex flex-col items-end gap-2 border-t pt-4">
                <div className="flex justify-between w-64 text-sm text-muted-foreground">
                  <span>Subtotal productos:</span>
                  <span>{formatPrice(selectedOrder.articulos?.reduce((acc: number, cur: any) => acc + (cur.precio * cur.cantidad), 0) || 0)}</span>
                </div>
                <div className="flex justify-between w-64 text-sm text-muted-foreground">
                  <span>Envío:</span>
                  <span>
                    {selectedOrder.total >= 50000 && (selectedOrder.total - (selectedOrder.articulos?.reduce((acc: number, cur: any) => acc + (cur.precio * cur.cantidad), 0) || 0)) <= 0
                      ? 'Gratis'
                      : formatPrice(Math.max(0, selectedOrder.total - (selectedOrder.articulos?.reduce((acc: number, cur: any) => acc + (cur.precio * cur.cantidad), 0) || 0)))}
                  </span>
                </div>
                <div className="flex justify-between w-64 font-bold text-base border-t pt-2 mt-1">
                  <span>Total Pedido:</span>
                  <span className="text-primary">{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>

              {/* Estado de Pedido */}
              <div className="flex items-center justify-between border-t pt-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold">Estado actual</p>
                  <div className="mt-1">
                    <Badge className={`${statusConfig[selectedOrder.estado]?.color || 'bg-gray-100 text-gray-800'} text-sm gap-1`}>
                      {statusConfig[selectedOrder.estado]?.label || selectedOrder.estado}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase font-semibold text-right">Cambiar Estado</p>
                  <Select
                    value={selectedOrder.estado}
                    onValueChange={(val) => {
                      handleStatusChange(selectedOrder.id_raw, val)
                      setSelectedOrder((prev: any) => ({ ...prev, estado: val }))
                    }}
                  >
                    <SelectTrigger className="w-[180px] h-9">
                      <SelectValue placeholder="Cambiar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendiente">Carrito Abandonado</SelectItem>
                      <SelectItem value="pagado">Pagado</SelectItem>
                      <SelectItem value="preparando">Preparando</SelectItem>
                      <SelectItem value="enviado">Enviado</SelectItem>
                      <SelectItem value="entregado">Entregado</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

