'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { CartItem, Product } from './store-types'

interface CartContextType {
  items: CartItem[]
  itemCount: number
  total: number
  addItem: (producto: Product, talla: number, color: string, cantidad?: number) => void
  removeItem: (productoId: string, talla: number, color: string) => void
  updateQuantity: (productoId: string, talla: number, color: string, cantidad: number) => void
  clearCart: () => void
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from local storage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('saguaro_cart')
      if (saved) {
        setItems(JSON.parse(saved))
      }
    } catch (e) {
      console.error('Error loading cart from storage', e)
    }
    setIsLoaded(true)
  }, [])

  // Save to local storage whenever items change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('saguaro_cart', JSON.stringify(items))
    }
  }, [items, isLoaded])

  const itemCount = items.reduce((acc, item) => acc + item.cantidad, 0)
  const total = items.reduce((acc, item) => acc + item.producto.precio * item.cantidad, 0)

  const addItem = useCallback((producto: Product, talla: number, color: string, cantidad = 1) => {
    setItems(current => {
      const existingIndex = current.findIndex(
        item => item.producto.id === producto.id && item.talla === talla && item.color === color
      )

      if (existingIndex >= 0) {
        const updated = [...current]
        updated[existingIndex] = {
          ...updated[existingIndex],
          cantidad: updated[existingIndex].cantidad + cantidad,
        }
        return updated
      }

      return [...current, { producto, talla, color, cantidad }]
    })
    setIsOpen(true)
  }, [])

  const removeItem = useCallback((productoId: string, talla: number, color: string) => {
    setItems(current =>
      current.filter(
        item => !(item.producto.id === productoId && item.talla === talla && item.color === color)
      )
    )
  }, [])

  const updateQuantity = useCallback((productoId: string, talla: number, color: string, cantidad: number) => {
    if (cantidad <= 0) {
      removeItem(productoId, talla, color)
      return
    }

    setItems(current =>
      current.map(item =>
        item.producto.id === productoId && item.talla === talla && item.color === color
          ? { ...item, cantidad }
          : item
      )
    )
  }, [removeItem])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        total,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isOpen,
        openCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
