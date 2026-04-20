'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the email to your backend
    setSubmitted(true)
  }

  return (
    <section className="bg-primary py-16 px-4">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-2xl font-bold tracking-tight text-primary-foreground sm:text-3xl text-balance">
          Unete a la comunidad Saguaro
        </h2>
        <p className="mt-3 text-primary-foreground/80 text-pretty">
          Recibe ofertas exclusivas, novedades y consejos sobre calzado barefoot
          directamente en tu correo.
        </p>

        {submitted ? (
          <div className="mt-8 rounded-lg bg-primary-foreground/20 p-4">
            <p className="text-primary-foreground font-medium">
              Gracias por suscribirte! Pronto recibiras noticias nuestras.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Input
              type="email"
              placeholder="Tu correo electronico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-primary-foreground text-foreground placeholder:text-muted-foreground sm:w-80"
            />
            <Button
              type="submit"
              className="bg-foreground text-background hover:bg-foreground/90"
            >
              Suscribirse
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
