'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, MoreHorizontal, Package, Check, X } from 'lucide-react'
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
import { formatPrice } from '@/lib/store-data'
import { getAllProducts } from '@/app/actions/products'
import { updateProductType } from '@/app/actions/admin'
import type { Product } from '@/lib/store-types'

const categoryNames: Record<string, string> = {
  hombre: 'Hombre',
  mujer: 'Mujer',
  nino: 'Niños',
}

export default function AdminProductsPage() {
  const [dbProducts, setDbProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTipo, setEditTipo] = useState<string>('casual')
  const [isSaving, setIsSaving] = useState(false)

  const loadProducts = () => {
    setLoading(true)
    getAllProducts().then(data => {
      setDbProducts(data)
      setLoading(false)
    })
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const filteredProducts = dbProducts.filter((product) => {
    const matchesSearch = product.nombre.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || product.categoria === categoryFilter
    return matchesSearch && matchesCategory
  })

  const getTotalStock = (tallas: { talla: number; stock: number }[]) => {
    return tallas.reduce((acc, t) => acc + t.stock, 0)
  }

  const handleEditClick = (product: Product) => {
    setEditingId(product.id)
    setEditTipo(product.tipo)
  }

  const handleSaveType = async (id: string) => {
    setIsSaving(true)
    const res = await updateProductType(id, editTipo)
    if (res.success) {
      setEditingId(null)
      loadProducts() // refrescar desde la BD
    } else {
      alert("Error guardando cambios: " + res.error)
    }
    setIsSaving(false)
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Gestión de Productos
          </h1>
          <p className="text-muted-foreground mt-1">
            Administra el catálogo de productos de tu tienda
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Producto
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Productos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : dbProducts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Hombre
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : dbProducts.filter((p) => p.categoria === 'hombre').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Mujer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : dbProducts.filter((p) => p.categoria === 'mujer').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Niños
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : dbProducts.filter((p) => p.categoria === 'nino').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar productos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            <SelectItem value="hombre">Hombre</SelectItem>
            <SelectItem value="mujer">Mujer</SelectItem>
            <SelectItem value="nino">Niños</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Tipo (Etiqueta)</TableHead>
                <TableHead className="text-right">Precio</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">Cargando productos reales...</TableCell>
                </TableRow>
              ) : filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No hay productos encontrados</TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => {
                  const totalStock = getTotalStock(product.tallas)
                  const isLowStock = totalStock < 20
                  const isEditing = editingId === product.id

                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 overflow-hidden rounded-lg bg-muted flex items-center justify-center">
                            {product.imagenes[0] && product.imagenes[0] !== '/placeholder.jpg' ? (
                              <img src={product.imagenes[0]} alt={product.nombre} className="h-full w-full object-cover" />
                            ) : (
                              <Package className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{product.nombre}</p>
                            <p className="text-xs text-muted-foreground">ID: {product.id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{categoryNames[product.categoria]}</TableCell>
                      
                      <TableCell>
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <Select value={editTipo} onValueChange={setEditTipo}>
                              <SelectTrigger className="w-[130px] h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="casual">Casual</SelectItem>
                                <SelectItem value="running">Running</SelectItem>
                                <SelectItem value="trekking">Trekking</SelectItem>
                                <SelectItem value="acuatico">Acuático</SelectItem>
                                <SelectItem value="sandalias">Sandalias</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={() => handleSaveType(product.id)} disabled={isSaving}>
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => setEditingId(null)} disabled={isSaving}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Badge variant="secondary" className="capitalize">{product.tipo}</Badge>
                        )}
                      </TableCell>

                      <TableCell className="text-right">
                        <div>
                          <p className="font-medium">{formatPrice(product.precio)}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end gap-1">
                          <span>{totalStock}</span>
                          {isLowStock && (
                            <Badge variant="outline" className="text-[10px] h-4 px-1 text-orange-600 border-orange-300">
                              Stock bajo
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {!isEditing && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditClick(product)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar Tipo
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
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
        Mostrando {filteredProducts.length} de {dbProducts.length} productos
      </div>
    </div>
  )
}
