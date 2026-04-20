'use client'

import { useState } from 'react'
import { Search, Eye, MoreHorizontal, Package, Truck, CheckCircle, Clock } from 'lucide-react'
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
  pendiente: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  preparando: { label: 'Preparando', color: 'bg-blue-100 text-blue-800', icon: Package },
  enviado: { label: 'Enviado', color: 'bg-purple-100 text-purple-800', icon: Truck },
  entregado: { label: 'Entregado', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  cancelado: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: Clock },
}

export default function AdminOrdersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredOrders = mockOrders.filter((order) => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.cliente.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.estado === statusFilter
    return matchesSearch && matchesStatus
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getOrderStats = () => {
    return {
      total: mockOrders.length,
      pendiente: mockOrders.filter((o) => o.estado === 'pendiente').length,
      preparando: mockOrders.filter((o) => o.estado === 'preparando').length,
      enviado: mockOrders.filter((o) => o.estado === 'enviado').length,
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
            <SelectItem value="pendiente">Pendiente</SelectItem>
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
              {filteredOrders.map((order) => {
                const status = statusConfig[order.estado]
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
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver detalles
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Marcar como Preparando</DropdownMenuItem>
                          <DropdownMenuItem>Marcar como Enviado</DropdownMenuItem>
                          <DropdownMenuItem>Marcar como Entregado</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            Cancelar pedido
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="mt-4 text-sm text-muted-foreground">
        Mostrando {filteredOrders.length} de {mockOrders.length} pedidos
      </div>
    </div>
  )
}
