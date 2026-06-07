'use client'

import { useState, useEffect } from 'react'
import { 
  Users, 
  Search, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  ShoppingBag, 
  ChevronRight, 
  ArrowLeft,
  Shield,
  Clock,
  MapPin,
  ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getUsuarios, getUsuarioDetalles, updateUserRole } from '@/app/actions/admin'

import { formatPrice } from '@/lib/store-data'

export default function AdminClientesPage() {
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [loadingDetails, setLoadingDetails] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    const res = await getUsuarios()
    if (res.success) {
      setUsuarios(res.usuarios)
    }
    setLoading(false)
  }

  const handleVerDetalles = async (id: number) => {
    setLoadingDetails(true)
    setDetailsOpen(true)
    const res = await getUsuarioDetalles(id)
    if (res.success) {
      setSelectedUser(res.usuario)
    }
    setLoadingDetails(false)
  }

  const filteredUsers = usuarios.filter(u => 
    `${u.nombres} ${u.primer_apellido} ${u.segundo_apellido}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.direccion_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.rut.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Usuarios
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">
            Gestiona la base de datos de usuarios registrados en Saguaro.
          </p>
        </div>
        <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary px-4 py-2 rounded-xl border border-primary/20 flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span className="font-bold">{usuarios.length} Registrados</span>
            </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nuevos este mes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 desde el mes pasado</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usuarios.filter(u => u.estado).length}</div>
            <p className="text-xs text-muted-foreground">98% del total</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Totales</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
                {usuarios.reduce((acc, u) => acc + (u._count?.pedidos || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">Promedio 1.5 por cliente</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Table */}
      <Card className="border-none shadow-xl overflow-hidden">
        <CardHeader className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <CardTitle>Listado de Usuarios</CardTitle>
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input 
                        placeholder="Buscar por nombre, email o RUT..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-white dark:bg-zinc-950 border-zinc-200"
                    />
                </div>
            </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-zinc-50/50 dark:bg-zinc-900/50">
              <TableRow>
                <TableHead className="font-bold">Usuario</TableHead>
                <TableHead className="font-bold">RUT</TableHead>
                <TableHead className="font-bold">Rol</TableHead>
                <TableHead className="font-bold">Registro</TableHead>
                <TableHead className="font-bold text-center">Pedidos</TableHead>
                <TableHead className="font-bold">Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={7} className="h-16 animate-pulse bg-zinc-50/50 dark:bg-zinc-900/10" />
                  </TableRow>
                ))
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-zinc-500">
                    No se encontraron usuarios.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((u) => (
                  <TableRow key={u.id_usuario} className="group hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 font-bold border border-zinc-200">
                          {u.nombres[0]}{u.primer_apellido[0]}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-zinc-900 dark:text-white group-hover:text-primary transition-colors">
                            {u.nombres} {u.primer_apellido}
                          </span>
                          <span className="text-xs text-zinc-500">{u.direccion_email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{u.rut}</TableCell>
                    <TableCell>
                      <Badge variant={u.rol?.nombre_rol === 'admin' ? 'default' : 'secondary'} className="capitalize">
                        {u.rol?.nombre_rol || 'Usuario'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-zinc-500">
                      {new Date(u.fecha_registro).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-center font-bold">
                        {u._count?.pedidos || 0}
                    </TableCell>
                    <TableCell>
                      {u.estado ? (
                        <div className="flex items-center gap-1.5 text-green-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse" />
                          <span className="text-xs font-medium">Activo</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-zinc-400">
                          <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                          <span className="text-xs font-medium">Inactivo</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleVerDetalles(u.id_usuario)}
                        className="rounded-lg hover:bg-primary/10 hover:text-primary"
                      >
                        Ver Detalles
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* User Details Sheet */}
      <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
        <SheetContent className="sm:max-w-2xl overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>Detalles del Usuario</SheetTitle>
            <SheetDescription>Información completa del perfil y actividad.</SheetDescription>
          </SheetHeader>

          {loadingDetails ? (
            <div className="flex items-center justify-center h-64">
                <Clock className="w-10 h-10 animate-spin text-primary" />
            </div>
          ) : selectedUser ? (
            <div className="space-y-8">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold border border-primary/20">
                        {selectedUser.nombres[0]}{selectedUser.primer_apellido[0]}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">
                            {selectedUser.nombres} {selectedUser.primer_apellido} {selectedUser.segundo_apellido}
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{selectedUser.rol?.nombre_rol || 'Usuario'}</Badge>
                            <span className="text-sm text-zinc-500">RUT: {selectedUser.rut}</span>
                        </div>
                    </div>
                </div>

                    <div className="flex gap-2">
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={async () => {
                                const newRole = selectedUser.rol?.nombre_rol === 'admin' ? 'cliente' : 'admin'
                                if(confirm(`¿Cambiar rol a ${newRole}?`)) {
                                    const res = await updateUserRole(selectedUser.id_usuario, newRole)
                                    if(res.success) {
                                        setDetailsOpen(false)
                                        loadUsers()
                                    }
                                }
                            }}
                        >
                            Cambiar a {selectedUser.rol?.nombre_rol === 'admin' ? 'Usuario' : 'Admin'}
                        </Button>
                    </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-zinc-50 dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Información de Contacto</p>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm">
                                <div className="w-8 h-8 rounded-full bg-white dark:bg-zinc-950 flex items-center justify-center shadow-sm border">
                                    <Mail className="w-4 h-4 text-primary" />
                                </div>
                                <span className="font-medium">{selectedUser.direccion_email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <div className="w-8 h-8 rounded-full bg-white dark:bg-zinc-950 flex items-center justify-center shadow-sm border">
                                    <Phone className="w-4 h-4 text-primary" />
                                </div>
                                <span className="font-medium">+56 {selectedUser.telefono}</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Perfil de Usuario</p>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm">
                                <div className="w-8 h-8 rounded-full bg-white dark:bg-zinc-950 flex items-center justify-center shadow-sm border">
                                    <User className="w-4 h-4 text-primary" />
                                </div>
                                <span className="font-medium capitalize">{selectedUser.genero}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <div className="w-8 h-8 rounded-full bg-white dark:bg-zinc-950 flex items-center justify-center shadow-sm border">
                                    <Calendar className="w-4 h-4 text-primary" />
                                </div>
                                <span className="font-medium">{new Date(selectedUser.fecha_nacimiento).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-primary" />
                        Direcciones Registradas
                    </h3>
                    <div className="grid gap-4">
                        {selectedUser.direcciones?.length > 0 ? (
                            selectedUser.direcciones.map((dir: any) => (
                                <div key={`${dir.id_usuario}-${dir.id_comuna}-${dir.id_direccion}`} className="p-4 rounded-2xl border bg-white dark:bg-zinc-950 shadow-sm flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center shrink-0">
                                        <MapPin className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="font-bold text-zinc-900 dark:text-white">{dir.calle} {dir.numero}</p>
                                            {dir.es_principal && <Badge variant="secondary" className="text-[9px] h-4">Principal</Badge>}
                                        </div>
                                        {dir.detalles && <p className="text-xs text-zinc-500 mb-1">{dir.detalles}</p>}
                                        <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                                            {dir.comuna?.nombre}, {dir.comuna?.region?.nombre}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-6 bg-zinc-50 dark:bg-zinc-900 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                                <p className="text-zinc-400 text-sm">No hay direcciones registradas.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-primary" />
                        Historial de Compras
                    </h3>
                    <div className="space-y-4">
                        {selectedUser.pedidos?.length > 0 ? (
                            selectedUser.pedidos.map((pedido: any) => (
                                <div key={pedido.id_pedido} className="border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                                    <div className="bg-zinc-50/50 dark:bg-zinc-900/50 p-4 flex items-center justify-between border-b">
                                        <div>
                                            <p className="text-sm font-bold">Pedido #{pedido.id_pedido}</p>
                                            <p className="text-xs text-zinc-500">{new Date(pedido.fecha_pedido).toLocaleDateString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-extrabold text-primary">{formatPrice(pedido.total)}</p>
                                            <Badge variant="secondary" className="text-[10px] uppercase">{pedido.estado}</Badge>
                                        </div>
                                    </div>
                                    <div className="p-4 space-y-2">
                                        {pedido.articulos.map((art: any) => (
                                            <div key={art.id_producto} className="flex items-center justify-between text-sm">
                                                <span className="text-zinc-600 dark:text-zinc-400">
                                                    {art.cantidad}x {art.producto.modelo.nombre_modelo}
                                                </span>
                                                <span className="font-medium">{formatPrice(art.precio)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                                <p className="text-zinc-400 text-sm italic">Este usuario aún no ha realizado compras.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  )
}
