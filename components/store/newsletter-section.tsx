'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { subscribeToNewsletter } from '@/app/actions/contact'

export function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setLoading(true)
    try {
      const res = await subscribeToNewsletter(email)
      if (res.success) {
        setSubmitted(true)
      }
    } catch (err) {
      console.error("Error subscribing:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="bg-primary py-16 px-4">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-2xl font-bold tracking-tight text-primary-foreground sm:text-3xl text-balance">
          Únete a la comunidad Saguaro
        </h2>
        <p className="mt-3 text-primary-foreground/80 text-pretty">
          Recibe ofertas exclusivas, novedades y consejos sobre calzado barefoot
          directamente en tu correo.
        </p>

        {submitted ? (
          <div className="mt-8 rounded-lg bg-primary-foreground/20 p-4">
            <p className="text-primary-foreground font-medium">
              ¡Gracias por suscribirte! Pronto recibirás noticias nuestras.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Input
              type="email"
              placeholder="Tu correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="bg-primary-foreground text-foreground placeholder:text-muted-foreground sm:w-80"
            />
            <Button
              type="submit"
              disabled={loading}
              className="bg-foreground text-background hover:bg-foreground/90"
            >
              {loading ? 'Suscribiendo...' : 'Suscribirse'}
            </Button>
          </form>
        )}

        <p className="mt-4 text-xs text-primary-foreground/60">
          Al suscribirte, aceptas recibir correos de Saguaro Chile. Puedes darte de
          baja en cualquier momento.
        </p>
      </div>
    </section>
  )
}
