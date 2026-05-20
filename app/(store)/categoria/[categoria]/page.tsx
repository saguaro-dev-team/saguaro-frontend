'use client'

import { use, useState, useMemo, Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Filter, SlidersHorizontal, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ProductCard } from '@/components/store/product-card'
import { getProductsByCategoryStr } from '@/app/actions/products'
import { getColorValue } from '@/lib/color-utils'
import type { Product, ProductCategory, ProductType } from '@/lib/store-types'

const categoryNames: Record<string, string> = {
  hombre: 'Hombre',
  mujer: 'Mujer',
  nino: 'Niños',
}

const categoryDescriptions: Record<string, string> = {
  hombre: 'Descubre nuestra colección de calzado barefoot para hombre. Desde running hasta casual, encuentra el par perfecto.',
  mujer: 'Calzado barefoot diseñado para la mujer moderna. Estilo, comodidad y salud en cada paso.',
  nino: 'Calzado barefoot para niños que favorece el desarrollo natural del pie. Libertad para crecer.',
}

const productTypes: { value: ProductType; label: string }[] = [
  { value: 'running', label: 'Running' },
  { value: 'casual', label: 'Casual' },
  { value: 'casuales', label: 'Casuales' },
  { value: 'deportivas', label: 'Deportivas' },
  { value: 'trekking', label: 'Trekking' },
  { value: 'acuatico', label: 'Acuatico' },
  { value: 'sandalias', label: 'Sandalias' },
  { value: 'botas', label: 'Botas' },
]

const sortOptions = [
  { value: 'featured', label: 'Destacados' },
  { value: 'price-asc', label: 'Precio: Menor a Mayor' },
  { value: 'price-desc', label: 'Precio: Mayor a Menor' },
  { value: 'newest', label: 'Mas Recientes' },
]

interface PageProps {
  params: Promise<{ categoria: string }>
}

function CategoryContent({ categoria }: { categoria: string }) {
  const searchParams = useSearchParams()
  
  const [dbProducts, setDbProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setErrorMsg(null)
    getProductsByCategoryStr(categoria)
      .then(data => {
        if (!data) throw new Error('No data returned')
        setDbProducts(data)
        setLoading(false)
      })
      .catch(err => {
        console.error("Error fetching products:", err)
        setErrorMsg(err.message || 'Unknown error')
        setLoading(false)
      })
  }, [categoria])
  
  const [selectedTypes, setSelectedTypes] = useState<ProductType[]>(() => {
    const tipo = searchParams.get('tipo')
    return tipo ? [tipo as ProductType] : []
  })
  const [sortBy, setSortBy] = useState('featured')
  const [showOnlyNew, setShowOnlyNew] = useState(false)
  const [showOnlyDiscount, setShowOnlyDiscount] = useState(false)
  
  // Nuevos filtros
  const [selectedGeneros, setSelectedGeneros] = useState<string[]>([])
  const [selectedUsos, setSelectedUsos] = useState<string[]>([])
  const [selectedEstilos, setSelectedEstilos] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [selectedSizes, setSelectedSizes] = useState<number[]>([])

  const categoryProducts = useMemo(() => {
    let filtered = [...dbProducts]

    // Filter by type
    if (selectedTypes.length > 0) {
      filtered = filtered.filter((p) => selectedTypes.includes(p.tipo))
    }

    // Filter by new
    if (showOnlyNew) {
      filtered = filtered.filter((p) => p.nuevo)
    }

    // Filter by discount
    if (showOnlyDiscount) {
      filtered = filtered.filter((p) => p.descuento)
    }

    // Filter by Genero
    if (selectedGeneros.length > 0) {
      filtered = filtered.filter((p) => p.genero && selectedGeneros.includes(p.genero.toLowerCase()))
    }

    // Filter by Uso
    if (selectedUsos.length > 0) {
      filtered = filtered.filter((p) => p.uso && selectedUsos.includes(p.uso.toLowerCase()))
    }

    // Filter by Estilo
    if (selectedEstilos.length > 0) {
      filtered = filtered.filter((p) => p.estilo && selectedEstilos.includes(p.estilo.toLowerCase()))
    }

    // Filter by Colors
    if (selectedColors.length > 0) {
      filtered = filtered.filter((p) => p.colores.some(c => selectedColors.includes(c.toLowerCase())))
    }

    // Filter by Sizes
    if (selectedSizes.length > 0) {
      filtered = filtered.filter((p) => p.tallas.some(t => selectedSizes.includes(t.talla) && t.stock > 0))
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.precio - b.precio)
        break
      case 'price-desc':
        filtered.sort((a, b) => b.precio - a.precio)
        break
      case 'newest':
        filtered.sort((a, b) => (b.nuevo ? 1 : 0) - (a.nuevo ? 1 : 0))
        break
      default:
        filtered.sort((a, b) => (b.destacado ? 1 : 0) - (a.destacado ? 1 : 0))
    }

    return filtered
  }, [
    dbProducts,
    categoria,
    selectedTypes,
    sortBy,
    showOnlyNew,
    showOnlyDiscount,
    selectedGeneros,
    selectedUsos,
    selectedEstilos,
    selectedColors,
    selectedSizes,
  ])

  const toggleType = (type: ProductType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  const clearFilters = () => {
    setSelectedTypes([])
    setShowOnlyNew(false)
    setShowOnlyDiscount(false)
    setSelectedGeneros([])
    setSelectedUsos([])
    setSelectedEstilos([])
    setSelectedColors([])
    setSelectedSizes([])
  }

  const toggleFilter = (list: string[], setList: (l: string[]) => void, value: string) => {
    const lowerValue = value.toLowerCase()
    setList(list.includes(lowerValue) ? list.filter(v => v !== lowerValue) : [...list, lowerValue])
  }

  const toggleSize = (size: number) => {
    setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size])
  }

  const uniqueColors = useMemo(() => {
    const colors = new Set<string>()
    dbProducts.forEach(p => p.colores.forEach(c => colors.add(c.toLowerCase())))
    return Array.from(colors).sort()
  }, [dbProducts])

  const sizesHombre = useMemo(() => {
    const sizes = new Set<number>()
    dbProducts.forEach(p => {
      const g = p.genero?.toLowerCase()
      if (g === 'hombre' || g === 'unisex') {
        p.tallas.forEach(t => { if (t.stock > 0) sizes.add(t.talla) })
      }
    })
    return Array.from(sizes).sort((a, b) => a - b)
  }, [dbProducts])

  const sizesMujer = useMemo(() => {
    const sizes = new Set<number>()
    dbProducts.forEach(p => {
      const g = p.genero?.toLowerCase()
      if (g === 'mujer' || g === 'unisex') {
        p.tallas.forEach(t => { if (t.stock > 0) sizes.add(t.talla) })
      }
    })
    return Array.from(sizes).sort((a, b) => a - b)
  }, [dbProducts])

  const uniqueUsos = useMemo(() => {
    const usos = new Set<string>()
    dbProducts.forEach(p => p.uso && usos.add(p.uso.toLowerCase()))
    return Array.from(usos).sort()
  }, [dbProducts])

  const uniqueEstilos = useMemo(() => {
    const estilos = new Set<string>()
    dbProducts.forEach(p => p.estilo && estilos.add(p.estilo.toLowerCase()))
    return Array.from(estilos).sort()
  }, [dbProducts])

  const activeFiltersCount = 
    selectedTypes.length + 
    (showOnlyNew ? 1 : 0) + 
    (showOnlyDiscount ? 1 : 0) + 
    selectedGeneros.length +
    selectedUsos.length +
    selectedEstilos.length +
    selectedColors.length +
    selectedSizes.length

  const hasActiveFilters = activeFiltersCount > 0

  const FilterContent = () => (
    <div className="space-y-8">
      {/* Genero Filter */}
      {categoria === 'todos' && (
        <div className="animate-in fade-in slide-in-from-left-2 duration-300">
          <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Género</h3>
          <div className="flex flex-wrap gap-2">
            {['hombre', 'mujer', 'unisex'].map((g) => (
              <Badge 
                key={g} 
                variant={selectedGeneros.includes(g) ? "default" : "outline"}
                className={`cursor-pointer capitalize px-4 py-1.5 text-xs transition-all duration-200 ${
                  selectedGeneros.includes(g) ? 'scale-105 shadow-sm' : 'hover:bg-muted'
                }`}
                onClick={() => toggleFilter(selectedGeneros, setSelectedGeneros, g)}
              >
                {g}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Usage Filter */}
      {uniqueUsos.length > 0 && (
        <div className="animate-in fade-in slide-in-from-left-2 duration-300 delay-75">
          <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Uso</h3>
          <div className="space-y-3">
            {uniqueUsos.map((u) => (
              <label key={u} className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center">
                  <Checkbox 
                    id={`usage-${u}`}
                    checked={selectedUsos.includes(u)}
                    onCheckedChange={() => toggleFilter(selectedUsos, setSelectedUsos, u)}
                    className="border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                </div>
                <span className="text-sm group-hover:text-primary transition-colors capitalize font-medium">
                  {u}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      <Separator className="bg-border/50" />

      {/* Sizes Filter */}
      <div className="animate-in fade-in slide-in-from-left-2 duration-300 delay-100">
        {categoria !== 'mujer' && sizesHombre.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Tallas Hombre</h3>
            <div className="grid grid-cols-4 gap-2">
              {sizesHombre.map((s) => (
                <button
                  key={s}
                  onClick={() => toggleSize(s)}
                  className={`h-10 w-full flex items-center justify-center text-xs font-bold border rounded-sm transition-all duration-200 ${
                    selectedSizes.includes(s) 
                    ? 'bg-primary text-primary-foreground border-primary shadow-md scale-105' 
                    : 'bg-background hover:border-primary/50 text-foreground/80'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {categoria !== 'hombre' && sizesMujer.length > 0 && (
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Tallas Mujer</h3>
            <div className="grid grid-cols-4 gap-2">
              {sizesMujer.map((s) => (
                <button
                  key={s}
                  onClick={() => toggleSize(s)}
                  className={`h-10 w-full flex items-center justify-center text-xs font-bold border rounded-sm transition-all duration-200 ${
                    selectedSizes.includes(s) 
                    ? 'bg-primary text-primary-foreground border-primary shadow-md scale-105' 
                    : 'bg-background hover:border-primary/50 text-foreground/80'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <Separator className="bg-border/50" />

      {/* Colors Filter */}
      {uniqueColors.length > 0 && (
        <div className="animate-in fade-in slide-in-from-left-2 duration-300 delay-150">
          <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Colores</h3>
          <div className="flex flex-wrap gap-3">
            {uniqueColors.map((c) => (
              <button
                key={c}
                onClick={() => toggleFilter(selectedColors, setSelectedColors, c)}
                title={c}
                className={`h-8 w-8 rounded-full border border-border/50 flex items-center justify-center transition-all duration-300 ${
                  selectedColors.includes(c) ? 'ring-2 ring-primary ring-offset-2 scale-110 shadow-sm' : 'hover:scale-125'
                }`}
                style={{ backgroundColor: getColorValue(c) }}
              >
                {selectedColors.includes(c) && (
                  <div className="h-2.5 w-2.5 rounded-full bg-white mix-blend-difference" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <Separator className="bg-border/50" />

      {/* Style Filter */}
      {uniqueEstilos.length > 0 && (
        <div className="animate-in fade-in slide-in-from-left-2 duration-300 delay-200">
          <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Estilo</h3>
          <div className="flex flex-wrap gap-2">
            {uniqueEstilos.map((e) => (
              <Badge 
                key={e} 
                variant={selectedEstilos.includes(e) ? "secondary" : "outline"}
                className={`cursor-pointer capitalize px-3 py-1 text-[11px] transition-all ${
                  selectedEstilos.includes(e) ? 'bg-secondary text-secondary-foreground' : 'hover:bg-muted'
                }`}
                onClick={() => toggleFilter(selectedEstilos, setSelectedEstilos, e)}
              >
                {e}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <Separator className="bg-border/50" />

      {/* Product Type Filter */}
      <div className="animate-in fade-in slide-in-from-left-2 duration-300 delay-300">
        <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Tipo de Calzado</h3>
        <div className="space-y-3">
          {productTypes.map((type) => {
            const count = dbProducts.filter(
              (p) => p.tipo === type.value
            ).length
            if (count === 0) return null
            return (
              <label
                key={type.value}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <Checkbox
                  checked={selectedTypes.includes(type.value)}
                  onCheckedChange={() => toggleType(type.value)}
                  className="border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <span className="text-sm font-medium group-hover:text-primary transition-colors">{type.label}</span>
                <span className="text-[10px] font-bold text-muted-foreground/60 ml-auto bg-muted px-1.5 py-0.5 rounded">
                  {count}
                </span>
              </label>
            )
          })}
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-muted/30 py-12 px-4">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {categoryNames[categoria] || categoria}
          </h1>
          <p className="mt-2 text-muted-foreground max-w-2xl">
            {categoryDescriptions[categoria] || ''}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-28 max-h-[calc(100vh-140px)] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/40 transition-colors">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Filter className="h-5 w-5 text-primary" />
                  Filtros
                </h2>
                {hasActiveFilters && (
                  <Button 
                    variant="link" 
                    size="sm" 
                    onClick={clearFilters}
                    className="h-auto p-0 text-muted-foreground hover:text-primary"
                  >
                    Limpiar todo
                  </Button>
                )}
              </div>
              <FilterContent />
              <div className="h-10" /> {/* Extra space at bottom of sticky */}
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                {/* Mobile Filters */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden">
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      Filtros
                      {hasActiveFilters && (
                        <Badge variant="secondary" className="ml-2">
                          {activeFiltersCount}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left">
                    <SheetHeader>
                      <SheetTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filtros
                      </SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <FilterContent />
                    </div>
                  </SheetContent>
                </Sheet>

                <span className="text-sm text-muted-foreground">
                  {categoryProducts.length} productos
                </span>
              </div>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Active Filters */}
            {errorMsg && (
              <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-6 border border-destructive/20">
                <p className="font-semibold">Error al cargar productos:</p>
                <p>{errorMsg}</p>
                <p className="text-sm mt-2 opacity-80">Categoría solicitada: {categoria}</p>
              </div>
            )}
            
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="text-sm text-muted-foreground">Filtros activos:</span>
                {selectedGeneros.map((g) => (
                  <Badge
                    key={`g-${g}`}
                    variant="secondary"
                    className="cursor-pointer capitalize"
                    onClick={() => toggleFilter(selectedGeneros, setSelectedGeneros, g)}
                  >
                    {`Género: ${g}`}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
                {selectedUsos.map((u) => (
                  <Badge
                    key={`u-${u}`}
                    variant="secondary"
                    className="cursor-pointer capitalize"
                    onClick={() => toggleFilter(selectedUsos, setSelectedUsos, u)}
                  >
                    {`Uso: ${u}`}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
                {selectedSizes.map((s) => (
                  <Badge
                    key={`s-${s}`}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => toggleSize(s)}
                  >
                    {`Talla: ${s}`}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
                {selectedColors.map((c) => (
                  <Badge
                    key={`c-${c}`}
                    variant="secondary"
                    className="cursor-pointer capitalize"
                    onClick={() => toggleFilter(selectedColors, setSelectedColors, c)}
                  >
                    {`Color: ${c}`}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
                {selectedEstilos.map((e) => (
                  <Badge
                    key={`e-${e}`}
                    variant="secondary"
                    className="cursor-pointer capitalize"
                    onClick={() => toggleFilter(selectedEstilos, setSelectedEstilos, e)}
                  >
                    {`Estilo: ${e}`}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
                {selectedTypes.map((type) => (
                  <Badge
                    key={type}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => toggleType(type)}
                  >
                    {productTypes.find((t) => t.value === type)?.label}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
                {showOnlyNew && (
                  <Badge
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => setShowOnlyNew(false)}
                  >
                    Nuevos
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                )}
                {showOnlyDiscount && (
                  <Badge
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => setShowOnlyDiscount(false)}
                  >
                    Con Descuento
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                )}
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Limpiar todo
                </Button>
              </div>
            )}

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="aspect-square bg-muted/20 animate-pulse rounded-lg" />
                ))}
              </div>
            ) : categoryProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3">
                {categoryProducts.map((product) => (
                  <ProductCard key={product.id} product={product} selectedColors={selectedColors} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-muted-foreground">
                  No se encontraron productos con los filtros seleccionados.
                </p>
                <Button variant="outline" className="mt-4" onClick={clearFilters}>
                  Limpiar Filtros
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CategoryPage({ params }: PageProps) {
  const { categoria } = use(params)
  
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground">Cargando categoría...</div>}>
      <CategoryContent categoria={categoria} />
    </Suspense>
  )
}

