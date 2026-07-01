'use client'

import { useState, useEffect } from 'react'
import { 
  Search, Eye, CheckCircle, XCircle, Clock, 
  RotateCcw, ShieldCheck, Building2, User2, FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog'
import { getAdminReturnRequests, updateReturnRequestStatus } from '@/app/actions/returns'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/hooks/use-toast'

const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  pendiente: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock },
  aprobada: { label: 'Aprobada (Despachando)', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400', icon: RotateCcw },
  rechazada: { label: 'Rechazada', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
  completada: { label: 'Reembolsada / Completada', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle }
}

export default function AdminDevolucionesPage() {
  const [returns, setReturns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedReturn, setSelectedReturn] = useState<any | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [isRejectOpen, setIsRejectOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  const fetchReturns = () => {
    getAdminReturnRequests().then(res => {
      if (res.success && res.devoluciones) {
        setReturns(res.devoluciones)
      }
      setLoading(false)
    })
  }

  useEffect(() => {
    fetchReturns()
  }, [])

  const handleAction = async (id: number, actionStatus: string, reason?: string) => {
    setIsProcessing(true)
    const res = await updateReturnRequestStatus(id, actionStatus, reason, user)
    setIsProcessing(false)
    
    if (res.success) {
      toast({
        title: "Éxito",
        description: `La solicitud de devolución fue actualizada a ${actionStatus}.`,
      })
      setIsDetailOpen(false)
      setIsRejectOpen(false)
      fetchReturns()
    } else {
      toast({
        title: "Error",
        description: res.error || "Ocurrió un error al procesar la solicitud.",
        variant: "destructive"
      })
    }
  }

  const filteredReturns = returns.filter((r) => {
    const orderStr = `SAG-${String(r.id_pedido).padStart(8, '0')}`
    const clientName = r.pedido.usuario ? `${r.pedido.usuario.nombres} ${r.pedido.usuario.primer_apellido}` : 'Invitado'
    
    const matchesSearch = 
      orderStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.producto.codigo_sku.toLowerCase().includes(searchQuery.toLowerCase())
      
    const matchesStatus = statusFilter === 'all' || r.estado_devolucion === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cambios y Devoluciones</h1>
          <p className="text-muted-foreground">
            Gestiona las solicitudes de retorno, reembolsos e ingreso de stock de tus clientes.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solicitudes Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {returns.filter(r => r.estado_devolucion === 'pendiente').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Esperando revisión</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Devoluciones Aprobadas</CardTitle>
            <RotateCcw className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {returns.filter(r => r.estado_devolucion === 'aprobada').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">En proceso de despacho/retorno</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reembolsadas / Completadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {returns.filter(r => r.estado_devolucion === 'completada').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Reingresadas a inventario</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Solicitudes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{returns.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Histórico completo</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por Nº pedido, cliente o SKU..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('all')}
                size="sm"
              >
                Todos
              </Button>
              <Button
                variant={statusFilter === 'pendiente' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('pendiente')}
                size="sm"
                className="bg-yellow-50 text-yellow-800 border-yellow-200 hover:bg-yellow-100 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-900/30"
              >
                Pendientes
              </Button>
              <Button
                variant={statusFilter === 'aprobada' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('aprobada')}
                size="sm"
                className="bg-indigo-50 text-indigo-800 border-indigo-200 hover:bg-indigo-100 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/30"
              >
                Aprobadas
              </Button>
              <Button
                variant={statusFilter === 'completada' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('completada')}
                size="sm"
                className="bg-green-50 text-green-800 border-green-200 hover:bg-green-100 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30"
              >
                Completadas
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Fecha Solicitud</TableHead>
                <TableHead>Calzado a Devolver</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-[100px] text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Cargando solicitudes...
                  </TableCell>
                </TableRow>
              ) : filteredReturns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No se encontraron solicitudes de devolución.
                  </TableCell>
                </TableRow>
              ) : (
                filteredReturns.map((r) => {
                  const status = statusConfig[r.estado_devolucion] || {
                    label: r.estado_devolucion,
                    color: 'bg-gray-100 text-gray-800',
                    icon: Clock
                  }
                  const StatusIcon = status.icon
                  const clientName = r.pedido.usuario ? `${r.pedido.usuario.nombres} ${r.pedido.usuario.primer_apellido}` : 'Invitado'

                  return (
                    <TableRow key={r.id_devolucion}>
                      <TableCell className="font-mono font-medium">
                        SAG-{String(r.id_pedido).padStart(8, '0')}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{clientName}</p>
                          <p className="text-xs text-muted-foreground">{r.pedido.usuario?.direccion_email || 'No disponible'}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(r.fecha_solicitud).toLocaleDateString('es-CL', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </TableCell>
                      <TableCell>
                        <p className="font-semibold text-sm">{r.producto.modelo.nombre_modelo}</p>
                        <p className="text-xs text-muted-foreground">Color: {r.producto.color}, Talla: {r.producto.talla}</p>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{r.producto.codigo_sku}</TableCell>
                      <TableCell>
                        <Badge className={`${status.color} gap-1 font-medium text-xs`}>
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedReturn(r)
                            setIsDetailOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle de Solicitud de Devolución</DialogTitle>
            <DialogDescription>
              Información de reembolso, motivo e inventario asociado.
            </DialogDescription>
          </DialogHeader>

          {selectedReturn && (
            <div className="space-y-6 pt-2">
              {/* Product and Order info */}
              <div className="grid gap-4 sm:grid-cols-2 bg-muted/30 p-4 rounded-xl border">
                <div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Pedido Original</h4>
                  <p className="font-mono text-base font-bold text-primary">SAG-{String(selectedReturn.id_pedido).padStart(8, '0')}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Fecha Pedido: {new Date(selectedReturn.pedido.fecha_pedido).toLocaleDateString('es-CL')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Total Pedido: {formatPrice(selectedReturn.pedido.total)}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Producto Solicitado</h4>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded border bg-background overflow-hidden flex items-center justify-center shrink-0">
                      <img 
                        src={selectedReturn.producto.modelo.imagen_url} 
                        alt={selectedReturn.producto.modelo.nombre_modelo} 
                        className="object-cover h-full w-full"
                      />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{selectedReturn.producto.modelo.nombre_modelo}</p>
                      <p className="text-xs text-muted-foreground">Talla: {selectedReturn.producto.talla} | Color: {selectedReturn.producto.color}</p>
                      <p className="text-xs font-mono text-muted-foreground mt-0.5">SKU: {selectedReturn.producto.codigo_sku}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Client Info */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Datos del Cliente</h4>
                <div className="grid gap-4 sm:grid-cols-2 p-3 bg-muted/10 rounded-lg border border-dashed text-sm">
                  <div className="flex items-center gap-2">
                    <User2 className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {selectedReturn.pedido.usuario?.nombres} {selectedReturn.pedido.usuario?.primer_apellido}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedReturn.pedido.usuario?.direccion_email}</span>
                  </div>
                </div>
              </div>

              {/* Reasons & Bank info */}
              <div className="space-y-4 border-t pt-4">
                <div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Motivo & Comentarios de Devolución</h4>
                  <div className="bg-background border rounded-lg p-3 text-sm italic leading-relaxed text-muted-foreground">
                    "{selectedReturn.motivo}"
                  </div>
                </div>
              </div>

              {/* State Flow Controls */}
              <div className="flex justify-between items-center border-t pt-4">
                <div>
                  <p className="text-xs text-muted-foreground">Estado Solicitud</p>
                  <p className="font-bold text-sm capitalize">{selectedReturn.estado_devolucion}</p>
                </div>
                
                <div className="flex gap-2">
                  {selectedReturn.estado_devolucion === 'pendiente' && (
                    <>
                      <Button 
                        variant="outline" 
                        className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                        disabled={isProcessing}
                        onClick={() => setIsRejectOpen(true)}
                      >
                        <XCircle className="h-4 w-4 mr-1.5" />
                        Rechazar
                      </Button>
                      <Button 
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        disabled={isProcessing}
                        onClick={() => handleAction(selectedReturn.id_devolucion, 'aprobada')}
                      >
                        <RotateCcw className="h-4 w-4 mr-1.5" />
                        Aprobar Devolución
                      </Button>
                    </>
                  )}

                  {selectedReturn.estado_devolucion === 'aprobada' && (
                    <Button 
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                      disabled={isProcessing}
                      onClick={() => handleAction(selectedReturn.id_devolucion, 'completada')}
                    >
                      <ShieldCheck className="h-4 w-4 mr-1.5" />
                      Recibido y Reembolsar (Repone Stock)
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Rechazar Solicitud de Devolución</DialogTitle>
            <DialogDescription>
              Especifica el motivo del rechazo. Esto se enviará por mensaje al cliente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Input 
              placeholder="Ej: El producto supera el tiempo máximo legal de devolución (10 días)..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setIsRejectOpen(false)}>
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                className="flex-1" 
                disabled={isProcessing || !rejectReason.trim()}
                onClick={() => handleAction(selectedReturn.id_devolucion, 'rechazada', rejectReason)}
              >
                Confirmar Rechazo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
