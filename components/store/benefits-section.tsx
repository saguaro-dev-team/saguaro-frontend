import { Truck, RefreshCw, Shield, Headphones } from 'lucide-react'

const benefits = [
  {
    icon: Truck,
    title: 'Envio Gratis',
    description: 'En compras sobre $50.000',
  },
  {
    icon: RefreshCw,
    title: 'Cambios Gratis',
    description: '30 dias para cambiar tu producto',
  },
  {
    icon: Shield,
    title: 'Pago Seguro',
    description: 'Transacciones 100% protegidas',
  },
  {
    icon: Headphones,
    title: 'Atencion 24/7',
    description: 'Soporte por WhatsApp',
  },
]

export function BenefitsSection() {
  return (
    <section className="border-y border-border bg-muted/30 py-12 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => (
            <div key={benefit.title} className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <benefit.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
