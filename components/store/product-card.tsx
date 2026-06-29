'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ShoppingBag, Heart } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { Product } from '@/lib/store-types'
import { formatPrice } from '@/lib/store-data'
import { getColorValue } from '@/lib/color-utils'

interface ProductCardProps {
  product: Product
  selectedColors?: string[]
  selectedSizes?: number[]
}

export function ProductCard({ product, selectedColors, selectedSizes }: ProductCardProps) {
  const hasDiscount = product.descuento && product.precioOriginal

  // Local state to keep track of the currently selected color for displaying the image
  const [activeColor, setActiveColor] = useState<string | null>(null)

  // Determine the default color to display:
  // 1. If there's an active color filter that the product supports, use it.
  // 2. Otherwise, use the first color of the product.
  const getFilterMatchedColor = (colorsFilter?: string[]) => {
    if (colorsFilter && colorsFilter.length > 0) {
      const matched = product.colores.find(color => 
        colorsFilter.includes(color.toLowerCase().trim())
      )
      if (matched) return matched
    }
    return product.colores[0] || null
  }

  // Update activeColor when selectedColors filter changes
  useEffect(() => {
    const matched = getFilterMatchedColor(selectedColors)
    setActiveColor(matched)
  }, [selectedColors, product.colores])

  // Get active image to render based on selected color
  const getProductImage = () => {
    if (activeColor && product.imagenesPorColor) {
      const activeColorLower = activeColor.toLowerCase().trim()
      const matchingKey = Object.keys(product.imagenesPorColor).find(
        key => key.toLowerCase().trim() === activeColorLower
      )
      if (matchingKey) {
        const imagesForColor = product.imagenesPorColor[matchingKey]
        if (imagesForColor && imagesForColor.length > 0) {
          return imagesForColor[0]
        }
      }
    }
    return (product.imagenes && product.imagenes[0]) || '/placeholder.jpg'
  }

  const activeImage = getProductImage()

  const isSizeSoldOut = (() => {
    if (!selectedSizes || selectedSizes.length === 0) return false

    const activeColorLower = activeColor?.toLowerCase().trim()
    const matchingKey = activeColorLower && product.tallasPorColor
      ? Object.keys(product.tallasPorColor).find(key => key.toLowerCase().trim() === activeColorLower)
      : null
    const variantTallas = matchingKey && product.tallasPorColor ? product.tallasPorColor[matchingKey] : null

    if (variantTallas) {
      return selectedSizes.every(size => {
        const tObj = variantTallas.find(t => t.talla === size)
        return !tObj || tObj.stock <= 0
      })
    } else {
      return selectedSizes.every(size => {
        const tObj = product.tallas.find(t => t.talla === size)
        return !tObj || tObj.stock <= 0
      })
    }
  })()

  return (
    <Card className="group border-0 shadow-none bg-transparent">
      <Link href={`/producto/${product.id}`}>
        <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
          {activeImage && activeImage !== '/placeholder.jpg' ? (
            <img 
              src={activeImage} 
              alt={product.nombre} 
              className={`h-full w-full object-cover transition-all duration-300 group-hover:scale-105 ${isSizeSoldOut ? 'opacity-50 grayscale-[25%]' : ''}`} 
            />
          ) : (
            <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50 ${isSizeSoldOut ? 'opacity-50' : ''}`}>
              <ShoppingBag className="h-16 w-16 text-muted-foreground/30" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute left-2 top-2 flex flex-col gap-1 z-10">
            {isSizeSoldOut && selectedSizes && (
              <Badge variant="destructive" className="bg-neutral-800 text-white border-none font-bold uppercase tracking-wider text-[9px] py-1 shadow-sm">
                {selectedSizes.length === 1 ? `Talla ${selectedSizes[0]} agotada` : 'Talla agotada'}
              </Badge>
            )}
            {product.nuevo && (
              <Badge className="bg-primary text-primary-foreground">Nuevo</Badge>
            )}
            {hasDiscount && (
              <Badge variant="destructive">-{product.descuento}%</Badge>
            )}
          </div>

          {/* Quick actions overlay */}
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 transition-all group-hover:bg-black/20 group-hover:opacity-100">
            <Button
              size="icon"
              variant="secondary"
              className="h-10 w-10 rounded-full"
              onClick={(e) => {
                e.preventDefault()
                // Add to wishlist functionality
              }}
            >
              <Heart className="h-5 w-5" />
              <span className="sr-only">Agregar a favoritos</span>
            </Button>
          </div>
        </div>
      </Link>

      <CardContent className="px-0 pt-4">
        <Link href={`/producto/${product.id}`}>
          <h3 className="font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {product.nombre}
          </h3>
        </Link>

        <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
          {product.tipo.charAt(0).toUpperCase() + product.tipo.slice(1)}
        </p>

        <div className="mt-2 flex items-center gap-2">
          <span className="font-semibold text-foreground">
            {formatPrice(product.precio)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.precioOriginal!)}
            </span>
          )}
        </div>

        {/* Color options */}
        {product.colores.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {product.colores.slice(0, 6).map((color) => {
              const isActive = activeColor === color
              return (
                <button
                  key={color}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setActiveColor(color)
                  }}
                  className={`h-4.5 w-4.5 rounded-full border transition-all duration-200 ${
                    isActive 
                      ? 'ring-2 ring-primary ring-offset-1 scale-110 border-transparent' 
                      : 'border-border hover:scale-110'
                  }`}
                  style={{
                    background: getColorValue(color)
                  }}
                  title={color}
                />
              )
            })}
            {product.colores.length > 6 && (
              <span className="text-[10px] font-semibold text-muted-foreground ml-1">
                +{product.colores.length - 6}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
