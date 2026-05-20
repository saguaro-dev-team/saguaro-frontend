'use client'

import Link from 'next/link'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { XCircle, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

function CheckoutFailureContent() {
  const searchParams = useSearchParams()
  const reason = searchParams.get('reason')

  let message = 'Hubo un problema al procesar tu pago con Webpay.'
  if (reason === 'aborted') message = 'El pago fue cancelado por el usuario.'
  if (reason === 'rejected') message = 'El pago fue rechazado por el banco o la tarjeta.'
  if (reason === 'invalid_token') message = 'Token de pago inválido.'
  if (reason === 'timeout') message = 'El tiempo de pago expiró.'

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center py-16 px-4">
      <div className="text-center max-w-md">
        <div className="mx-auto w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mb-6">
          <XCircle className="h-10 w-10 text-rose-600" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Pago Fallido o Cancelado</h1>
        <p className="text-muted-foreground mb-6">
          {message}
        </p>
        <p className="text-sm text-muted-foreground mb-8">
          No te preocupes, no se han realizado cargos a tu tarjeta. Puedes intentar nuevamente.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link href="/checkout">
              <RefreshCcw className="w-4 h-4 mr-2" />
              Intentar Nuevamente
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Volver a la Tienda</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutFailurePage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center">Cargando...</div>}>
      <CheckoutFailureContent />
    </Suspense>
  )
}
