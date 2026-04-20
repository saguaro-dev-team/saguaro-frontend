'use client'

import { use, useState, useMemo } from 'react'
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
import { useEffect } from 'react'
import { getProductsByCategoryStr } from '@/app/actions/products'
import type { Product, ProductCategory, ProductType } from '@/lib/store-types'

const categoryNames: Record<string, string> = {
  hombre: 'Hombre',
  mujer: 'Mujer',
  nino: 'Ninos',
}

const categoryDescriptions: Record<string, string> = {
  hombre: 'Descubre nuestra coleccion de calzado barefoot para hombre. Desde running hasta casual, encuentra el par perfecto.',
  mujer: 'Calzado barefoot disenado para la mujer moderna. Estilo, comodidad y salud en cada paso.',
  nino: 'Calzado barefoot para ninos que favorece el desarrollo natural del pie. Libertad para crecer.',
}

const productTypes: { value: ProductType; label: string }[] = [
  { value: 'running', label: 'Running' },
  { value: 'casual', label: 'Casual' },
  { value: 'trekking', label: 'Trekking' },
  { value: 'acuatico', label: 'Acuatico' },
  { value: 'sandalias', label: 'Sandalias' },
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

export default function CategoryPage({ params }: PageProps) {
  const { categoria } = use(params)
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
  }, [dbProducts, categoria, selectedTypes, sortBy, showOnlyNew, showOnlyDiscount])

  const toggleType = (type: ProductType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  const clearFilters = () => {
    setSelectedTypes([])
    setShowOnlyNew(false)
    setShowOnlyDiscount(false)
  }

  const hasActiveFilters = selectedTypes.length > 0 || showOnlyNew || showOnlyDiscount

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Product Type Filter */}
      <div>
        <h3 className="font-semibold mb-3">Tipo de Producto</h3>
        <div className="space-y-2">
          {productTypes.map((type) => {
            const count = dbProducts.filter(
              (p) => p.tipo === type.value
            ).length
            if (count === 0) return null
            return (
              <label
                key={type.value}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Checkbox
                  checked={selectedTypes.includes(type.value)}
                  onCheckedChange={() => toggleType(type.value)}
                />
                <span className="text-sm">{type.label}</span>
                <span className="text-xs text-muted-foreground ml-auto">({count})</span>
              </label>
            )
          })}
        </div>
      </div>

      <Separator />

      {/* Special Filters */}
      <div>
        <h3 className="font-semibold mb-3">Filtros Especiales</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={showOnlyNew}
              onCheckedChange={(checked) => setShowOnlyNew(checked as boolean)}
            />
            <span className="text-sm">Solo Nuevos</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={showOnlyDiscount}
              onCheckedChange={(checked) => setShowOnlyDiscount(checked as boolean)}
            />
            <span className="text-sm">Con Descuento</span>
          </label>
        </div>
      </div>

      {hasActiveFilters && (
        <>
          <Separator />
          <Button variant="outline" className="w-full" onClick={clearFilters}>
            Limpiar Filtros
          </Button>
        </>
      )}
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
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros
              </h2>
              <FilterContent />
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
                          {selectedTypes.length + (showOnlyNew ? 1 : 0) + (showOnlyDiscount ? 1 : 0)}
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
                  <ProductCard key={product.id} product={product} />
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
