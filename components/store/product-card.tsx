'use client'

import Link from 'next/link'
import { ShoppingBag, Heart } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { Product } from '@/lib/store-types'
import { formatPrice } from '@/lib/store-data'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const hasDiscount = product.descuento && product.precioOriginal

  return (
    <Card className="group overflow-hidden border-0 shadow-none bg-transparent">
      <Link href={`/producto/${product.id}`}>
        <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
          {product.imagenes && product.imagenes[0] && product.imagenes[0] !== '/placeholder.jpg' ? (
            <img src={product.imagenes[0]} alt={product.nombre} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
              <ShoppingBag className="h-16 w-16 text-muted-foreground/30" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute left-2 top-2 flex flex-col gap-1">
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
        {product.colores.length > 1 && (
          <div className="mt-2 flex gap-1">
            {product.colores.slice(0, 4).map((color) => (
              <div
                key={color}
                className="h-4 w-4 rounded-full border border-border"
                style={{
                  backgroundColor:
                    color === 'Negro'
                      ? '#000'
                      : color === 'Blanco'
                      ? '#fff'
                      : color === 'Gris'
                      ? '#6b7280'
                      : color === 'Azul'
                      ? '#3b82f6'
                      : color === 'Verde'
                      ? '#22c55e'
                      : color === 'Rojo'
                      ? '#ef4444'
                      : color === 'Rosa'
                      ? '#ec4899'
                      : color === 'Marron' || color === 'Cafe'
                      ? '#78350f'
                      : color === 'Coral'
                      ? '#f97316'
                      : color === 'Nude'
                      ? '#d4a574'
                      : color === 'Morado'
                      ? '#8b5cf6'
                      : color === 'Turquesa'
                      ? '#14b8a6'
                      : color === 'Verde Militar'
                      ? '#4d7c0f'
                      : '#9ca3af',
                }}
                title={color}
              />
            ))}
            {product.colores.length > 4 && (
              <span className="text-xs text-muted-foreground">
                +{product.colores.length - 4}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
