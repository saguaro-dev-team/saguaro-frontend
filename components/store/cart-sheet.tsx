'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/lib/cart-context'
import { formatPrice } from '@/lib/store-data'

export function CartSheet() {
  const { items, total, isOpen, closeCart, updateQuantity, removeItem } = useCart()

  return (
    <Sheet open={isOpen} onOpenChange={closeCart}>
      <SheetContent className="flex w-full flex-col sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Carrito de Compras
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <ShoppingBag className="h-16 w-16 text-muted-foreground" />
            <p className="text-muted-foreground">Tu carrito esta vacio</p>
            <Button onClick={closeCart} asChild>
              <Link href="/categoria/hombre">Explorar Productos</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4">
              <div className="flex flex-col gap-4">
                {items.map((item) => (
                  <div
                    key={`${item.producto.id}-${item.talla}-${item.color}`}
                    className="flex gap-4 rounded-lg border p-3"
                  >
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                      {(() => {
                        const { producto, color } = item
                        let activeImage = '/placeholder.jpg'
                        if (color && producto.imagenesPorColor) {
                          const activeColorLower = color.toLowerCase().trim()
                          const matchingKey = Object.keys(producto.imagenesPorColor).find(
                            key => key.toLowerCase().trim() === activeColorLower
                          )
                          if (matchingKey) {
                            const imagesForColor = producto.imagenesPorColor[matchingKey]
                            if (imagesForColor && imagesForColor.length > 0) {
                              activeImage = imagesForColor[0]
                            }
                          }
                        }
                        if (activeImage === '/placeholder.jpg' && producto.imagenes && producto.imagenes.length > 0) {
                          activeImage = producto.imagenes[0]
                        }

                        return activeImage && activeImage !== '/placeholder.jpg' ? (
                          <img
                            src={activeImage}
                            alt={producto.nombre}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                            <ShoppingBag className="h-8 w-8" />
                          </div>
                        )
                      })()}
                    </div>

                    <div className="flex flex-1 flex-col">
                      <div className="flex justify-between">
                        <h4 className="text-sm font-medium line-clamp-1">
                          {item.producto.nombre}
                        </h4>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => removeItem(item.producto.id, item.talla, item.color)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Eliminar</span>
                        </Button>
                      </div>

                      <p className="text-xs text-muted-foreground">
                        Talla: {item.talla} | Color: {item.color}
                      </p>

                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() =>
                              updateQuantity(
                                item.producto.id,
                                item.talla,
                                item.color,
                                item.cantidad - 1
                              )
                            }
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm">{item.cantidad}</span>
                          {(() => {
                            const sizeObj = (item.producto.tallasPorColor && item.color && item.producto.tallasPorColor[item.color])
                              ? item.producto.tallasPorColor[item.color].find(t => t.talla === item.talla)
                              : item.producto.tallas.find(t => t.talla === item.talla)
                            const maxStock = sizeObj ? sizeObj.stock : 0
                            const isMax = item.cantidad >= maxStock
                            return (
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                disabled={isMax}
                                onClick={() =>
                                  updateQuantity(
                                    item.producto.id,
                                    item.talla,
                                    item.color,
                                    item.cantidad + 1
                                  )
                                }
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            )
                          })()}
                        </div>

                        <p className="font-medium">
                          {formatPrice(item.producto.precio * item.cantidad)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Envio</span>
                  <span>{total >= 50000 ? 'Gratis' : formatPrice(4990)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>{formatPrice(total >= 50000 ? total : total + 4990)}</span>
                </div>
              </div>

              <SheetFooter className="mt-4 flex-col gap-2 sm:flex-col">
                <Button className="w-full" size="lg" asChild>
                  <Link href="/checkout" onClick={closeCart}>
                    Proceder al Pago
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" onClick={closeCart}>
                  Continuar Comprando
                </Button>
              </SheetFooter>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
