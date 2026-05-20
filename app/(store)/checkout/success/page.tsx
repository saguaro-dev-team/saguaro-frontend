'use client'

import Link from 'next/link'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order')
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center py-16 px-4">
      <div className="text-center max-w-md">
        <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
          <CheckCircle className="h-10 w-10 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold mb-2">¡Pago Exitoso!</h1>
        <p className="text-muted-foreground mb-4">
          Tu pago ha sido procesado correctamente y tu pedido está siendo preparado.
        </p>
        
        {orderId && (
          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <p className="text-sm text-muted-foreground">Número de Pedido</p>
            <p className="text-xl font-mono font-bold">SAG-{orderId}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Button asChild variant="outline">
            <Link href="/">Volver al Inicio</Link>
          </Button>
          {isAuthenticated && (
            <Button asChild>
              <Link href="/perfil">Ver Mis Pedidos</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center">Cargando...</div>}>
      <CheckoutSuccessContent />
    </Suspense>
  )
}
