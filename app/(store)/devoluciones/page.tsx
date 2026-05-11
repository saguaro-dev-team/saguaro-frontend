import { RefreshCw, ShieldCheck, HelpCircle, ArrowRight, Package, CreditCard, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function DevolucionesPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-muted/30 border-b py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-4 bg-primary text-primary-foreground px-4 py-1 uppercase tracking-widest font-bold border-none">
            Garantía de Satisfacción
          </Badge>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic text-foreground mb-6">
            Cambios y Devoluciones
          </h1>
          <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
            Queremos que tus pies se sientan increíbles. Si no estás 100% satisfecho con tu calzado ergonómico, estamos aquí para ayudarte.
          </p>
        </div>
      </section>

      {/* Main Policies */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8">
          
          <div className="p-8 bg-card border rounded-[2rem] shadow-sm space-y-4 hover:shadow-md transition-shadow">
            <div className="bg-primary/10 w-14 h-14 rounded-2xl flex items-center justify-center">
              <RefreshCw className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight">Cambios de Talla</h3>
            <p className="text-muted-foreground leading-relaxed">
              Sabemos que encontrar el calce ergonómico perfecto es clave. Tienes **30 días** desde la recepción para solicitar un cambio de talla sin costo de gestión.
            </p>
          </div>

          <div className="p-8 bg-card border rounded-[2rem] shadow-sm space-y-4 hover:shadow-md transition-shadow">
            <div className="bg-primary/10 w-14 h-14 rounded-2xl flex items-center justify-center">
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight">Garantía Legal</h3>
            <p className="text-muted-foreground leading-relaxed">
              Todos nuestros productos cuentan con la garantía legal de **6 meses** ante fallas de fabricación, conforme a la normativa del SERNAC.
            </p>
          </div>

          <div className="p-8 bg-card border rounded-[2rem] shadow-sm space-y-4 hover:shadow-md transition-shadow">
            <div className="bg-primary/10 w-14 h-14 rounded-2xl flex items-center justify-center">
              <CreditCard className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight">Devolución de Dinero</h3>
            <p className="text-muted-foreground leading-relaxed">
              Si prefieres el reembolso, tienes **10 días** desde la recepción del producto para solicitarlo, siempre que el calzado esté impecable.
            </p>
          </div>

        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20 px-4 bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Cómo realizar tu trámite</h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">Sigue estos sencillos pasos para gestionar tu cambio o devolución de forma rápida.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Verifica el estado',
                desc: 'Asegúrate de que el calzado no tenga uso y esté en su caja original con etiquetas.'
              },
              {
                step: '02',
                title: 'Contáctanos',
                desc: 'Escríbenos a chilesaguaro@outlook.com o a nuestro WhatsApp de soporte con tu número de pedido.'
              },
              {
                step: '03',
                title: 'Envío de vuelta',
                desc: 'Te enviaremos una etiqueta de Chilexpress o Starken para que dejes el paquete en una sucursal.'
              },
              {
                step: '04',
                title: 'Resolución',
                desc: 'Una vez recibido en bodega y validado el estado, procedemos con el cambio o reembolso (3-5 días).'
              }
            ].map((item, i) => (
              <div key={i} className="relative group">
                <div className="text-6xl font-black text-primary/10 absolute -top-10 -left-4 group-hover:text-primary/20 transition-colors">{item.step}</div>
                <div className="space-y-3 relative z-10">
                  <h4 className="text-xl font-bold">{item.title}</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Conditions Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">Condiciones importantes</h2>
            <Separator className="bg-primary/20 h-1 w-20" />
          </div>

          <div className="grid gap-6">
            <div className="flex gap-4">
              <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-lg">Estado del Producto</h4>
                <p className="text-muted-foreground">Para ser aceptado, el calzado debe estar limpio, sin marcas de uso en la suela y en su caja original. Recuerda probarlos sobre una superficie limpia (alfombra) para no dañarlos.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-lg">Costos de Envío</h4>
                <p className="text-muted-foreground">En cambios por talla o fallas de fábrica, Saguaro asume el costo del primer envío de retorno. En devoluciones por arrepentimiento, el costo de envío hacia nuestra bodega corre por cuenta del cliente.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-lg">Plazos de Reembolso</h4>
                <p className="text-muted-foreground">Las devoluciones de dinero se realizan a través de la misma plataforma de pago utilizada (Webpay/Mercado Pago) o vía transferencia bancaria en un plazo máximo de 10 días hábiles tras la recepción en bodega.</p>
              </div>
            </div>
          </div>

          <div className="bg-primary/5 p-8 rounded-3xl border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-2">
              <h4 className="text-2xl font-bold tracking-tight text-primary">¿Deseas iniciar un cambio ahora?</h4>
              <p className="text-muted-foreground">Nuestro equipo de soporte te guiará en todo el proceso.</p>
            </div>
            <Button size="lg" className="rounded-full px-8 h-14 text-lg font-bold shadow-xl hover:scale-105 transition-all" asChild>
              <Link href="/contacto">Ir a Soporte</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
