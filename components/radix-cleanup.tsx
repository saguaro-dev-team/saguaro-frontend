'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

function cleanupRadix() {
  if (typeof document === 'undefined') return
  document.body.style.pointerEvents = ''
  document.body.style.overflow = ''
  document.body.removeAttribute('data-scroll-locked')
  document.body.removeAttribute('inert')
  document.documentElement.removeAttribute('data-scroll-locked')
  document.querySelectorAll(
    '[data-slot="dialog-overlay"], [data-slot="sheet-overlay"], [data-slot="dialog-portal"], [data-slot="sheet-portal"], [data-radix-focus-guard], [class*="DialogOverlay"], [class*="SheetOverlay"], [vaul-overlay]'
  ).forEach((el) => el.remove())
}

export function RadixCleanup() {
  const pathname = usePathname()

  useEffect(() => {
    // Limpiar al montar y cada vez que cambia la ruta
    cleanupRadix()
    const t1 = setTimeout(cleanupRadix, 100)
    const t2 = setTimeout(cleanupRadix, 400)
    const t3 = setTimeout(cleanupRadix, 800)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [pathname])

  // MutationObserver: detecta si Radix bloquea el body cuando no hay modal abierto
  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (document.body.hasAttribute('data-scroll-locked')) {
        setTimeout(() => {
          const hasOpenModal = document.querySelector(
            '[data-radix-dialog-content][data-state="open"], [data-radix-alert-dialog-content][data-state="open"], [data-vaul-drawer][data-state="open"]'
          )
          if (!hasOpenModal) {
            cleanupRadix()
          }
        }, 600)
      }
    })

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['data-scroll-locked'],
    })

    return () => observer.disconnect()
  }, [])

  return null
}
