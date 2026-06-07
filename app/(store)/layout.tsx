'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { CartProvider } from '@/lib/cart-context'
import { Header } from '@/components/store/header'
import { Footer } from '@/components/store/footer'

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  useEffect(() => {
    // Limpieza global de bugs de Radix UI (pantalla oscurecida o congelada al navegar)
    if (typeof window !== 'undefined') {
      const cleanup = () => {
        document.body.style.pointerEvents = 'auto'
        document.body.style.overflow = 'auto'
        
        // Ocultar cualquier overlay atascado de Radix en lugar de removerlo físicamente
        const stuckOverlays = document.querySelectorAll(
          '[data-slot="dialog-overlay"], [data-slot="sheet-overlay"], [data-slot="dialog-portal"], [data-slot="sheet-portal"], [data-radix-focus-guard], [class*="DialogOverlay"], [class*="SheetOverlay"]'
        )
        stuckOverlays.forEach(el => {
          if (el instanceof HTMLElement) {
            el.style.display = 'none'
          }
        })
      }
      
      cleanup()
      const timer = setTimeout(cleanup, 300)
      return () => clearTimeout(timer)
    }
  }, [pathname])

  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </CartProvider>
  )
}
