'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { subscribeToNewsletter } from '@/app/actions/contact'

export function OffersNewsletter() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setLoading(true)
    try {
      const res = await subscribeToNewsletter(email)
      if (res.success) {
        setSubmitted(true)
        toast({
          title: "¡Suscripción exitosa!",
          description: res.alreadySubscribed 
            ? "Ya estabas registrado en nuestro boletín."
            : "Te has registrado correctamente al boletín de ofertas.",
        })
      } else {
        toast({
          title: "Error al suscribirse",
          description: res.error || "Ocurrió un error inesperado.",
          variant: "destructive"
        })
      }
    } catch (err) {
      console.error(err)
      toast({
        title: "Error de red",
        description: "No se pudo conectar con el servidor.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-12 border-t border-zinc-200 dark:border-zinc-800">
      <div className="container mx-auto px-4">
        <div className="bg-red-600 rounded-3xl p-8 md:p-12 overflow-hidden relative">
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                ¿No quieres perderte ninguna oferta?
              </h3>
              <p className="text-red-100 opacity-90 text-lg">
                Regístrate y recibe notificaciones exclusivas antes que nadie.
              </p>
            </div>

            {submitted ? (
              <div className="bg-white/10 border border-white/20 text-white rounded-xl p-6 text-center lg:text-left max-w-md w-full">
                <p className="font-bold text-lg">🎉 ¡Gracias por suscribirte!</p>
                <p className="text-sm text-red-100 mt-1">Pronto recibirás nuestras ofertas exclusivas directo en tu correo.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                <Input
                  required
                  type="email"
                  placeholder="Tu correo electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="bg-white text-black placeholder:text-zinc-500 rounded-xl px-4 py-6 border-0 focus-visible:ring-2 focus-visible:ring-white h-auto"
                />
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-white text-red-600 hover:bg-zinc-100 rounded-xl px-8 py-6 font-bold shadow-lg shadow-red-900/20 h-auto"
                >
                  {loading ? 'Suscribiendo...' : 'Suscribirme ahora'}
                </Button>
              </form>
            )}
          </div>
          
          {/* Decoración abstracta */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-red-500 rounded-full blur-3xl opacity-50" />
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-96 h-96 bg-red-400 rounded-full blur-3xl opacity-30" />
        </div>
      </div>
    </section>
  )
}
