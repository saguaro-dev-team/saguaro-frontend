'use client'

import { useState, useEffect } from 'react'
import { 
  Search, Trash2, Star, Clock, AlertTriangle, 
  MessageSquare, User2, Package, Filter
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { getAdminReviews, deleteReview } from '@/app/actions/ratings'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog'

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [ratingFilter, setRatingFilter] = useState('all')
  const [selectedReview, setSelectedReview] = useState<any | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()

  const fetchReviews = () => {
    setLoading(true)
    getAdminReviews().then(res => {
      if (res.success && res.reviews) {
        setReviews(res.reviews)
      }
      setLoading(false)
    })
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  const handleDelete = async () => {
    if (!selectedReview) return
    setIsProcessing(true)
    const res = await deleteReview(selectedReview.id_valoracion)
    setIsProcessing(false)
    
    if (res.success) {
      toast({
        title: "Reseña eliminada",
        description: "La calificación y el comentario han sido retirados exitosamente de la tienda.",
      })
      setIsDeleteOpen(false)
      setSelectedReview(null)
      fetchReviews()
    } else {
      toast({
        title: "Error",
        description: res.error || "Ocurrió un error al intentar eliminar la valoración.",
        variant: "destructive"
      })
    }
  }

  const filteredReviews = reviews.filter((r) => {
    const clientName = r.usuario ? r.usuario.nombre : 'Invitado'
    const clientEmail = r.usuario ? r.usuario.email : ''
    const productName = r.producto ? r.producto.modelo : ''
    const productSku = r.producto ? r.producto.sku : ''
    const comment = r.comentario || ''
    
    const matchesSearch = 
      clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clientEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      productSku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comment.toLowerCase().includes(searchQuery.toLowerCase())
      
    const matchesRating = ratingFilter === 'all' || String(r.puntuacion) === ratingFilter
    
    return matchesSearch && matchesRating
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Valoraciones de Clientes</h1>
          <p className="text-muted-foreground">
            Modera y gestiona las opiniones que tus clientes dejan en las fichas de productos.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Calificaciones</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reviews.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Registradas históricamente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio Global</CardTitle>
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reviews.length > 0 
                ? (reviews.reduce((acc, curr) => acc + curr.puntuacion, 0) / reviews.length).toFixed(2) 
                : '0.00'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Estrellas en la tienda</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calificaciones Críticas (1-2★)</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">
              {reviews.filter(r => r.puntuacion <= 2).length}
            </div>
            <p className="text-xs text-rose-600/80 mt-1">Requieren atención / soporte</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calificaciones Excelentes (5★)</CardTitle>
            <Star className="h-4 w-4 text-emerald-500 fill-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {reviews.filter(r => r.puntuacion === 5).length}
            </div>
            <p className="text-xs text-emerald-600/80 mt-1">Reseñas de máxima satisfacción</p>
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
                placeholder="Buscar por cliente, email, producto, SKU o comentario..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 shrink-0">
                <Filter className="h-3 w-3" /> Filtrar por:
              </span>
              <Button
                variant={ratingFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setRatingFilter('all')}
                size="sm"
                className="h-8 text-xs"
              >
                Todos
              </Button>
              {[5, 4, 3, 2, 1].map((stars) => (
                <Button
                  key={stars}
                  variant={ratingFilter === String(stars) ? 'default' : 'outline'}
                  onClick={() => setRatingFilter(String(stars))}
                  size="sm"
                  className="h-8 text-xs gap-1"
                >
                  {stars} <Star className="h-3 w-3 fill-current text-yellow-400" />
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews Table */}
      <Card>
        <CardHeader>
          <CardTitle>Listado de Comentarios</CardTitle>
          <CardDescription>
            Mostrando {filteredReviews.length} valoraciones registradas en el sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-muted-foreground animate-pulse">
              Cargando valoraciones de clientes...
            </div>
          ) : filteredReviews.length > 0 ? (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead>Calificación</TableHead>
                    <TableHead className="max-w-xs">Comentario</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReviews.map((rev) => (
                    <TableRow key={rev.id_valoracion} className="hover:bg-muted/10">
                      <TableCell className="text-xs text-muted-foreground font-medium">
                        {new Date(rev.fecha_creacion).toLocaleDateString('es-CL')}<br />
                        <span className="text-[10px] text-muted-foreground/60">{new Date(rev.fecha_creacion).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm text-foreground flex items-center gap-1">
                            <User2 className="h-3 w-3 text-muted-foreground" />
                            {rev.usuario?.nombre || 'Invitado'}
                          </span>
                          <span className="text-xs text-muted-foreground font-mono">{rev.usuario?.email || ''}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {rev.producto ? (
                          <div className="flex flex-col">
                            <span className="font-medium text-sm text-foreground flex items-center gap-1">
                              <Package className="h-3 w-3 text-muted-foreground" />
                              {rev.producto.modelo}
                            </span>
                            <span className="text-xs text-muted-foreground font-mono">
                              SKU: {rev.producto.sku} (Talla: {rev.producto.talla}, {rev.producto.color})
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Producto no disponible</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star} 
                              className={`h-3.5 w-3.5 ${
                                star <= rev.puntuacion 
                                  ? 'text-yellow-500 fill-yellow-500' 
                                  : 'text-muted-foreground/20 fill-transparent'
                              }`}
                            />
                          ))}
                          <span className="text-xs font-semibold text-muted-foreground ml-1">({rev.puntuacion})</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs text-sm">
                        {rev.comentario ? (
                          <p className="italic text-muted-foreground break-words font-medium">
                            "{rev.comentario}"
                          </p>
                        ) : (
                          <span className="text-xs text-muted-foreground/60 italic">Calificó sin dejar comentario</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                          onClick={() => {
                            setSelectedReview(rev)
                            setIsDeleteOpen(true)
                          }}
                          title="Eliminar Reseña"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground font-medium">No se encontraron valoraciones</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Los clientes verán su historial vacío hasta que califiquen sus zapatillas.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Review Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="h-5 w-5" />
              ¿Eliminar Calificación?
            </DialogTitle>
            <DialogDescription>
              Esta acción es permanente e irreversible. La opinión e historial de estrellas serán removidos de la base de datos Supabase de forma inmediata.
            </DialogDescription>
          </DialogHeader>

          {selectedReview && (
            <div className="bg-muted/40 p-4 rounded-xl border space-y-2.5 text-sm my-2">
              <p><strong>Cliente:</strong> {selectedReview.usuario?.nombre}</p>
              <p><strong>Producto:</strong> {selectedReview.producto?.modelo} (SKU: {selectedReview.producto?.sku})</p>
              <p className="flex items-center gap-1">
                <strong>Estrellas:</strong> 
                <span className="inline-flex items-center text-yellow-500">
                  {selectedReview.puntuacion} ★
                </span>
              </p>
              {selectedReview.comentario && (
                <p><strong>Comentario:</strong> <span className="italic text-muted-foreground">"{selectedReview.comentario}"</span></p>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              variant="outline"
              disabled={isProcessing}
              onClick={() => setIsDeleteOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={isProcessing}
              onClick={handleDelete}
            >
              {isProcessing ? 'Eliminando...' : 'Eliminar Reseña'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
