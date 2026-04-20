'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ShoppingBag, Heart, Minus, Plus, ChevronRight, Truck, RefreshCw, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { useEffect } from 'react'
import { getProductById, getProductsByCategoryStr } from '@/app/actions/products'
import { formatPrice } from '@/lib/store-data'
import { useCart } from '@/lib/cart-context'
import { ProductCard } from '@/components/store/product-card'
import type { Product } from '@/lib/store-types'

interface PageProps {
  params: Promise<{ id: string }>
}

const categoryNames: Record<string, string> = {
  hombre: 'Hombre',
  mujer: 'Mujer',
  nino: 'Ninos',
}

export default function ProductPage({ params }: PageProps) {
  const { id } = use(params)
  const { addItem } = useCart()

  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedTalla, setSelectedTalla] = useState<number | null>(null)
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    setLoading(true)
    getProductById(id).then(data => {
      if (data) {
        setProduct(data)
        setSelectedColor(data.colores[0] || '')
        getProductsByCategoryStr(data.categoria).then(catData => {
          setRelatedProducts(catData.filter(p => p.id !== data.id).slice(0, 4))
        })
      }
      setLoading(false)
    })
  }, [id])

  if (loading) {
    return <div className="min-h-screen py-16 text-center">Cargando producto...</div>
  }

  if (!product) {
    notFound()
  }

  const hasDiscount = product.descuento && product.precioOriginal

  const handleAddToCart = () => {
    if (!selectedTalla) return
    addItem(product, selectedTalla, selectedColor, quantity)
  }

  const getColorStyle = (color: string) => {
    const colorMap: Record<string, string> = {
      Negro: '#000',
      Blanco: '#fff',
      Gris: '#6b7280',
      Azul: '#3b82f6',
      Verde: '#22c55e',
      Rojo: '#ef4444',
      Rosa: '#ec4899',
      Marron: '#78350f',
      Cafe: '#78350f',
      Coral: '#f97316',
      Nude: '#d4a574',
      Morado: '#8b5cf6',
      Turquesa: '#14b8a6',
      'Verde Militar': '#4d7c0f',
    }
    return colorMap[color] || '#9ca3af'
  }

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-7xl px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-primary">
            Inicio
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href={`/categoria/${product.categoria}`} className="hover:text-primary">
            {categoryNames[product.categoria]}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{product.nombre}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Product Image */}
          <div className="relative aspect-square rounded-2xl bg-muted overflow-hidden">
            {product.imagenes && product.imagenes[0] && product.imagenes[0] !== '/placeholder.jpg' ? (
              <img src={product.imagenes[0]} alt={product.nombre} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                <ShoppingBag className="h-32 w-32 text-muted-foreground/20" />
              </div>
            )}

            {/* Badges */}
            <div className="absolute left-4 top-4 flex flex-col gap-2">
              {product.nuevo && (
                <Badge className="bg-primary text-primary-foreground">Nuevo</Badge>
              )}
              {hasDiscount && (
                <Badge variant="destructive">-{product.descuento}%</Badge>
              )}
            </div>

            {/* Wishlist button */}
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-4 top-4 rounded-full"
            >
              <Heart className="h-5 w-5" />
              <span className="sr-only">Agregar a favoritos</span>
            </Button>
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div>
              <p className="text-sm text-muted-foreground capitalize">
                {product.tipo} | {categoryNames[product.categoria]}
              </p>
              <h1 className="mt-2 text-3xl font-bold text-foreground">{product.nombre}</h1>

              <div className="mt-4 flex items-center gap-3">
                <span className="text-3xl font-bold text-foreground">
                  {formatPrice(product.precio)}
                </span>
                {hasDiscount && (
                  <span className="text-xl text-muted-foreground line-through">
                    {formatPrice(product.precioOriginal!)}
                  </span>
                )}
              </div>

              <p className="mt-4 text-muted-foreground">{product.descripcion}</p>
            </div>

            <Separator className="my-6" />

            {/* Color Selection */}
            <div>
              <h3 className="text-sm font-medium mb-3">
                Color: <span className="text-muted-foreground">{selectedColor}</span>
              </h3>
              <div className="flex gap-2">
                {product.colores.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`h-10 w-10 rounded-full border-2 transition-all ${
                      selectedColor === color
                        ? 'border-primary ring-2 ring-primary ring-offset-2'
                        : 'border-border hover:border-muted-foreground'
                    }`}
                    style={{ backgroundColor: getColorStyle(color) }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            <Separator className="my-6" />

            {/* Size Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium">
                  Talla: <span className="text-muted-foreground">{selectedTalla || 'Selecciona'}</span>
                </h3>
                <Link href="/guia-tallas" className="text-sm text-primary hover:underline">
                  Guia de tallas
                </Link>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.tallas.map((size) => (
                  <button
                    key={size.talla}
                    onClick={() => setSelectedTalla(size.talla)}
                    disabled={size.stock === 0}
                    className={`flex h-12 w-12 items-center justify-center rounded-lg border text-sm font-medium transition-all ${
                      selectedTalla === size.talla
                        ? 'border-primary bg-primary text-primary-foreground'
                        : size.stock === 0
                        ? 'border-border bg-muted text-muted-foreground cursor-not-allowed'
                        : 'border-border hover:border-primary'
                    }`}
                  >
                    {size.talla}
                  </button>
                ))}
              </div>
              {selectedTalla && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Stock disponible:{' '}
                  {product.tallas.find((s) => s.talla === selectedTalla)?.stock} unidades
                </p>
              )}
            </div>

            <Separator className="my-6" />

            {/* Quantity and Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center border rounded-lg">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <Button
                size="lg"
                className="flex-1"
                onClick={handleAddToCart}
                disabled={!selectedTalla}
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                {selectedTalla ? 'Agregar al Carrito' : 'Selecciona una talla'}
              </Button>
            </div>

            {/* Benefits */}
            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center text-center p-3 rounded-lg bg-muted/50">
                <Truck className="h-6 w-6 text-primary mb-2" />
                <span className="text-xs text-muted-foreground">Envio gratis sobre $50.000</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 rounded-lg bg-muted/50">
                <RefreshCw className="h-6 w-6 text-primary mb-2" />
                <span className="text-xs text-muted-foreground">30 dias para cambios</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 rounded-lg bg-muted/50">
                <Shield className="h-6 w-6 text-primary mb-2" />
                <span className="text-xs text-muted-foreground">Garantia de calidad</span>
              </div>
            </div>

            {/* Product Details Accordion */}
            <Accordion type="single" collapsible className="mt-8">
              <AccordionItem value="characteristics">
                <AccordionTrigger>Caracteristicas</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {product.caracteristicas.map((char) => (
                      <li key={char}>{char}</li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="shipping">
                <AccordionTrigger>Envio y Entrega</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 text-muted-foreground">
                    <p>Envio gratis en compras sobre $50.000</p>
                    <p>Despacho a todo Chile</p>
                    <p>Tiempo de entrega: 3-5 dias habiles (Santiago), 5-10 dias habiles (regiones)</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="returns">
                <AccordionTrigger>Cambios y Devoluciones</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 text-muted-foreground">
                    <p>30 dias para realizar cambios o devoluciones</p>
                    <p>Productos deben estar sin uso y con etiquetas originales</p>
                    <p>Cambios de talla sin costo adicional</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Tambien te puede interesar
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
