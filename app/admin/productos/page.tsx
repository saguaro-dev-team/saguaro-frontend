'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, MoreHorizontal, Package, Check, X, Tag, DollarSign, Box } from 'lucide-react'
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatPrice } from '@/lib/store-data'
import { getColorValue } from '@/lib/color-utils'
import { getAllProducts } from '@/app/actions/products'
import { createProduct, updateProductFull } from '@/app/actions/admin'
import { getColores } from '@/app/actions/location'
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
  const [allColors, setAllColors] = useState<any[]>([])

  // Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Form Fields
  const [formData, setFormData] = useState({
    nombre: '',
    id_categoria: '1', // 1: Hombre, 2: Mujer, 3: Niños (según tu DB)
    descripcion: '',
    precio_normal: '',
    precio_oferta: '',
    stock: '0',
    talla: '',
    color: '',
    tipo: 'casual',
    genero: 'unisex',
    uso: 'walking',
    estilo: '',
    is_novedad: false,
    is_recomendado: false,
    caracteristicas: ''
  })

  const loadProducts = () => {
    setLoading(true)
    getAllProducts().then(data => {
      setDbProducts(data)
      setLoading(false)
    })
  }

  useEffect(() => {
    loadProducts()
    getColores().then(res => {
      if (res.success && res.colores) {
        setAllColors(res.colores)
      }
    })
  }, [])

  const filteredProducts = dbProducts.filter((product) => {
    const matchesSearch = product.nombre.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || product.categoria === categoryFilter
    return matchesSearch && matchesCategory
  })

  const handleAddClick = () => {
    setIsEditing(false)
    setSelectedProductId(null)
    setFormData({
      nombre: '',
      id_categoria: '1',
      descripcion: '',
      precio_normal: '',
      precio_oferta: '',
      stock: '0',
      talla: '36, 37, 38, 39, 40, 41, 42, 43, 44, 45',
      color: 'Negro, Blanco, Gris',
      tipo: 'casual',
      genero: 'unisex',
      uso: 'walking',
      estilo: 'Minimalista',
      is_novedad: true,
      is_recomendado: false,
      caracteristicas: 'Suela Flexible 5mm\nZero Drop\nPuntera Ancha'
    })
    setModalOpen(true)
  }

  const handleEditClick = (product: Product) => {
    setIsEditing(true)
    setSelectedProductId(product.id)
    
    // Mapear categoría de string a ID (esto depende de cómo estén en tu DB, usualmente Hombre=1, Mujer=2, Niños=3)
    let catId = '1'
    if (product.categoria === 'mujer') catId = '2'
    if (product.categoria === 'nino') catId = '3'

    setFormData({
      nombre: product.nombre,
      id_categoria: catId,
      descripcion: product.descripcion || '',
      precio_normal: String(product.precioOriginal || product.precio),
      precio_oferta: product.precioOriginal ? String(product.precio) : '',
      stock: String(product.tallas.reduce((acc, t) => acc + t.stock, 0)),
      talla: product.tallas.map(t => t.talla).join(', '),
      color: product.colores.join(', '),
      tipo: product.tipo || 'casual',
      genero: product.genero || 'unisex',
      uso: product.uso || 'walking',
      estilo: product.estilo || '',
      is_novedad: product.nuevo || false,
      is_recomendado: product.destacado || false,
      caracteristicas: product.caracteristicas.join('\n')
    })
    setModalOpen(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    const caracteristicasArray = formData.caracteristicas.split('\n').map(c => c.trim()).filter(c => c.length > 0)
    
    const dataToSend = {
      ...formData,
      caracteristicas: caracteristicasArray,
      id_categoria: parseInt(formData.id_categoria)
    }

    let res
    if (isEditing && selectedProductId) {
      res = await updateProductFull(selectedProductId, dataToSend)
    } else {
      res = await createProduct(dataToSend)
    }

    if (res.success) {
      setModalOpen(false)
      loadProducts()
    } else {
      alert("Error al guardar: " + res.error)
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
            Administra el catálogo completo de tu tienda
          </p>
        </div>
        <Button onClick={handleAddClick}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Producto
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Productos</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{loading ? '...' : dbProducts.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Hombre</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{loading ? '...' : dbProducts.filter(p => p.categoria === 'hombre').length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Mujer</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{loading ? '...' : dbProducts.filter(p => p.categoria === 'mujer').length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Niños</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{loading ? '...' : dbProducts.filter(p => p.categoria === 'nino').length}</div></CardContent>
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
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Precio</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">Cargando...</TableCell></TableRow>
              ) : filteredProducts.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No hay productos</TableCell></TableRow>
              ) : (
                filteredProducts.map((product) => (
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
                    <TableCell className="capitalize">{categoryNames[product.categoria]}</TableCell>
                    <TableCell><Badge variant="secondary" className="capitalize">{product.tipo}</Badge></TableCell>
                    <TableCell className="text-right font-medium">{formatPrice(product.precio)}</TableCell>
                    <TableCell className="text-right">{product.tallas.reduce((acc, t) => acc + t.stock, 0)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditClick(product)}>
                            <Edit className="h-4 w-4 mr-2" /> Editar Detalles
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive"><Trash2 className="h-4 w-4 mr-2" /> Eliminar</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-6 bg-muted/30 border-b">
            <DialogTitle className="text-2xl font-bold">
              {isEditing ? 'Editar Detalles del Producto' : 'Agregar Nuevo Producto'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
            {/* Sección: Información Principal */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b pb-2">Información Principal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nombre del Producto</label>
                  <Input 
                    value={formData.nombre} 
                    onChange={e => setFormData({...formData, nombre: e.target.value})} 
                    placeholder="Ej: Saguaro Smart I"
                    className="focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Categoría Principal</label>
                  <Select value={formData.id_categoria} onValueChange={val => setFormData({...formData, id_categoria: val})}>
                    <SelectTrigger className="focus:ring-primary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Hombre</SelectItem>
                      <SelectItem value="2">Mujer</SelectItem>
                      <SelectItem value="3">Niños</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Descripción del Producto</label>
                <Textarea 
                  value={formData.descripcion} 
                  onChange={e => setFormData({...formData, descripcion: e.target.value})} 
                  placeholder="Escribe una descripción atractiva para tus clientes..." 
                  className="min-h-[100px] focus-visible:ring-primary resize-none"
                />
              </div>
            </div>

            {/* Sección: Precios y Stock */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b pb-2">Precios y Disponibilidad</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2 text-primary">
                    <DollarSign className="h-4 w-4" /> Precio Normal
                  </label>
                  <Input 
                    type="number" 
                    value={formData.precio_normal} 
                    onChange={e => setFormData({...formData, precio_normal: e.target.value})}
                    className="font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2 text-orange-600">
                    <Tag className="h-4 w-4" /> Precio Oferta
                  </label>
                  <Input 
                    type="number" 
                    value={formData.precio_oferta} 
                    onChange={e => setFormData({...formData, precio_oferta: e.target.value})}
                    placeholder="Opcional"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2 text-blue-600">
                    <Box className="h-4 w-4" /> Stock Total
                  </label>
                  <Input 
                    type="number" 
                    value={formData.stock} 
                    onChange={e => setFormData({...formData, stock: e.target.value})} 
                  />
                </div>
              </div>
            </div>

              {/* Sección: Variantes y Filtros */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b pb-2">Variantes y Filtros</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Tallas disponibles</label>
                    <Input 
                      value={formData.talla} 
                      onChange={e => setFormData({...formData, talla: e.target.value})} 
                      placeholder="Ej: 36, 37, 38, 39..." 
                    />
                    <div className="flex flex-wrap gap-1 mt-2">
                      {['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'].map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => {
                            const current = formData.talla.split(',').map(s => s.trim()).filter(Boolean)
                            const next = current.includes(t) ? current.filter(s => s !== t) : [...current, t]
                            setFormData({...formData, talla: next.sort().join(', ')})
                          }}
                          className={`text-[10px] px-2 py-1 rounded border transition-colors ${
                            formData.talla.includes(t) ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted hover:border-primary/50'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Colores</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm" className="h-7 text-xs">
                            <Plus className="h-3 w-3 mr-1" /> Seleccionar
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-4" align="end">
                          <h4 className="font-medium leading-none mb-4">Catálogo de Colores</h4>
                          <ScrollArea className="h-64 pr-4">
                            <div className="grid grid-cols-4 gap-2">
                              {allColors.length > 0 ? (
                                allColors.map(c => (
                                  <button
                                    key={c.id_color}
                                    type="button"
                                    onClick={() => {
                                      const current = formData.color.split(',').map(s => s.trim()).filter(Boolean)
                                      const next = current.includes(c.nombre) ? current.filter(s => s !== c.nombre) : [...current, c.nombre]
                                      setFormData({...formData, color: next.join(', ')})
                                    }}
                                    className={`group relative flex flex-col items-center gap-1 p-1 rounded-md transition-all ${
                                      formData.color.includes(c.nombre) ? 'bg-primary/10 ring-1 ring-primary/30' : 'hover:bg-muted'
                                    }`}
                                  >
                                    <div 
                                      className="h-8 w-8 rounded-full border shadow-sm"
                                      style={{ backgroundColor: c.codigo_hex }}
                                    />
                                    <span className="text-[9px] text-center leading-tight line-clamp-1 w-full">{c.nombre}</span>
                                    {formData.color.includes(c.nombre) && (
                                      <div className="absolute top-0 right-0 h-3 w-3 bg-primary rounded-full flex items-center justify-center">
                                        <Check className="h-2 w-2 text-primary-foreground" />
                                      </div>
                                    )}
                                  </button>
                                ))
                              ) : (
                                <p className="col-span-4 text-xs text-center text-muted-foreground">Cargando catálogo...</p>
                              )}
                            </div>
                          </ScrollArea>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <Input 
                      value={formData.color} 
                      onChange={e => setFormData({...formData, color: e.target.value})} 
                      placeholder="Ej: Negro, Azul, Gris..." 
                    />
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {formData.color.split(',').map(s => s.trim()).filter(Boolean).map(c => (
                        <Badge key={c} variant="secondary" className="text-[10px] py-0 px-2 flex items-center gap-1">
                          {c}
                          <X className="h-2 w-2 cursor-pointer hover:text-destructive" onClick={() => {
                            const next = formData.color.split(',').map(s => s.trim()).filter(s => s.toLowerCase() !== c.toLowerCase())
                            setFormData({...formData, color: next.join(', ')})
                          }} />
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipo (Categoría Tienda)</label>
                  <Select value={formData.tipo} onValueChange={val => setFormData({...formData, tipo: val})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="running">Running</SelectItem>
                      <SelectItem value="trekking">Trekking</SelectItem>
                      <SelectItem value="acuatico">Acuático</SelectItem>
                      <SelectItem value="sandalias">Sandalias</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Género (Filtro Público)</label>
                  <Select value={formData.genero} onValueChange={val => setFormData({...formData, genero: val})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hombre">Hombre</SelectItem>
                      <SelectItem value="mujer">Mujer</SelectItem>
                      <SelectItem value="unisex">Unisex</SelectItem>
                      <SelectItem value="nino">Niño</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Uso Recomendado</label>
                  <Select value={formData.uso} onValueChange={val => setFormData({...formData, uso: val})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="competition">Competition</SelectItem>
                      <SelectItem value="everyday running">Everyday Running</SelectItem>
                      <SelectItem value="running">Running</SelectItem>
                      <SelectItem value="sandals">Sandals</SelectItem>
                      <SelectItem value="walking">Walking</SelectItem>
                      <SelectItem value="trekking">Trekking</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Estilo</label>
                  <Input 
                    value={formData.estilo} 
                    onChange={e => setFormData({...formData, estilo: e.target.value})} 
                    placeholder="Ej: Minimalista, Urbano..." 
                  />
                  <div className="flex flex-wrap gap-1 mt-2">
                    {['Minimalista', 'Urbano', 'Barefoot', 'Deportivo', 'Vintage', 'Clásico', 'Moderno', 'Casual', 'Trekking', 'Acuático'].map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setFormData({...formData, estilo: s})}
                        className={`text-[10px] px-2 py-1 rounded border transition-colors ${
                          formData.estilo === s ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted hover:border-primary/50'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-6 pb-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="novedad" 
                      checked={formData.is_novedad} 
                      onCheckedChange={val => setFormData({...formData, is_novedad: !!val})}
                      className="h-5 w-5 data-[state=checked]:bg-primary"
                    />
                    <label htmlFor="novedad" className="text-sm font-bold leading-none cursor-pointer">Nueva Colección</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="recomendado" 
                      checked={formData.is_recomendado} 
                      onCheckedChange={val => setFormData({...formData, is_recomendado: !!val})}
                      className="h-5 w-5 data-[state=checked]:bg-primary"
                    />
                    <label htmlFor="recomendado" className="text-sm font-bold leading-none cursor-pointer">Recomendado</label>
                  </div>
                </div>
              </div>
            </div>

            {/* Sección: Características */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b pb-2">Características Técnicas</h3>
              <div className="space-y-2">
                <Textarea 
                  value={formData.caracteristicas} 
                  onChange={e => setFormData({...formData, caracteristicas: e.target.value})} 
                  placeholder="Ej:&#10;Suela Flexible 5mm&#10;Zero Drop&#10;Puntera Ancha" 
                  className="min-h-[150px] focus-visible:ring-primary w-full p-3"
                />
                <p className="text-xs text-muted-foreground">
                  Ingresa una característica por línea. Se mostrarán como una lista punteada en la página del producto.
                </p>
              </div>
            </div>
            
            <div className="h-10" /> {/* Espacio extra al final del scroll */}
          </div>

          <DialogFooter className="p-6 bg-muted/30 border-t flex items-center justify-between gap-4">
            <Button variant="ghost" onClick={() => setModalOpen(false)} disabled={isSaving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="min-w-[150px] shadow-lg">
              {isSaving ? (
                <>
                  <Package className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar Producto'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
