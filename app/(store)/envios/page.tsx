import { Truck, Clock, ShieldCheck, MapPin, Search, Package, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export default function EnviosPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-primary py-20 px-4 text-primary-foreground relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -ml-24 -mb-24 blur-3xl" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <Badge className="mb-6 bg-white/20 hover:bg-white/30 text-white border-none px-4 py-1 text-sm uppercase tracking-widest">
            Logística Saguaro
          </Badge>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic mb-6">
            Información de Envío
          </h1>
          <p className="text-xl text-white/90 font-medium">
            Llevamos la experiencia del calzado ergonómico a la puerta de tu casa en todo Chile.
          </p>
        </div>
      </section>

      {/* Benefits Bar */}
      <section className="py-12 border-b">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-center gap-4 p-6 bg-muted/30 rounded-2xl">
            <div className="bg-primary/10 p-3 rounded-xl">
              <Truck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Envío Gratis</h3>
              <p className="text-sm text-muted-foreground">En compras sobre $50.000</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-6 bg-muted/30 rounded-2xl">
            <div className="bg-primary/10 p-3 rounded-xl">
              <Search className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Seguimiento Online</h3>
              <p className="text-sm text-muted-foreground">Monitorea tu pedido en tiempo real</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-6 bg-muted/30 rounded-2xl">
            <div className="bg-primary/10 p-3 rounded-xl">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Despacho Asegurado</h3>
              <p className="text-sm text-muted-foreground">Tu compra protegida al 100%</p>
            </div>
          </div>
        </div>
      </section>

      {/* Details Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16">
            
            {/* Tiempos y Costos */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                  <Clock className="h-8 w-8 text-primary" />
                  Tiempos de Entrega
                </h2>
                <p className="text-muted-foreground text-lg">
                  Trabajamos con las mejores empresas de logística externa para garantizar que tus Saguaro lleguen lo más rápido posible.
                </p>
              </div>

              <div className="grid gap-4">
                <div className="p-6 border rounded-2xl hover:border-primary/50 transition-colors bg-card shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-xl">Región Metropolitana</h4>
                    <Badge variant="secondary">2 - 4 días hábiles</Badge>
                  </div>
                  <p className="text-muted-foreground text-sm">Despacho estándar a todas las comunas de la RM.</p>
                </div>

                <div className="p-6 border rounded-2xl hover:border-primary/50 transition-colors bg-card shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-xl">Otras Regiones</h4>
                    <Badge variant="secondary">3 - 7 días hábiles</Badge>
                  </div>
                  <p className="text-muted-foreground text-sm">Envíos a todo Chile continental de Arica a Punta Arenas.</p>
                </div>

                <div className="p-6 border rounded-2xl hover:border-primary/50 transition-colors bg-card shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-xl">Zonas Extremas</h4>
                    <Badge variant="secondary">7 - 12 días hábiles</Badge>
                  </div>
                  <p className="text-muted-foreground text-sm">Aysén, Magallanes y zonas de difícil acceso.</p>
                </div>
              </div>
            </div>

            {/* Proceso de Envío */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                  <Package className="h-8 w-8 text-primary" />
                  Nuestro Proceso
                </h2>
                <p className="text-muted-foreground text-lg">
                  ¿Qué pasa después de que haces tu pedido?
                </p>
              </div>

              <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary before:via-muted before:to-transparent">
                
                <div className="relative flex items-center gap-6 group">
                  <div className="absolute left-0 w-10 h-10 flex items-center justify-center rounded-full bg-primary text-primary-foreground group-hover:scale-110 transition-transform shadow-lg">
                    <span className="font-bold text-sm">1</span>
                  </div>
                  <div className="ml-12">
                    <h4 className="font-bold text-lg">Procesamiento</h4>
                    <p className="text-muted-foreground text-sm">Validamos tu pago y preparamos tus productos en nuestra bodega (12-24 hrs).</p>
                  </div>
                </div>

                <div className="relative flex items-center gap-6 group">
                  <div className="absolute left-0 w-10 h-10 flex items-center justify-center rounded-full bg-primary text-primary-foreground group-hover:scale-110 transition-transform shadow-lg">
                    <span className="font-bold text-sm">2</span>
                  </div>
                  <div className="ml-12">
                    <h4 className="font-bold text-lg">Entrega al Courier</h4>
                    <p className="text-muted-foreground text-sm">Entregamos tu pedido a nuestro partner logístico (Chilexpress, Starken o Blue Express).</p>
                  </div>
                </div>

                <div className="relative flex items-center gap-6 group">
                  <div className="absolute left-0 w-10 h-10 flex items-center justify-center rounded-full bg-primary text-primary-foreground group-hover:scale-110 transition-transform shadow-lg">
                    <span className="font-bold text-sm">3</span>
                  </div>
                  <div className="ml-12">
                    <h4 className="font-bold text-lg">Notificación de Seguimiento</h4>
                    <p className="text-muted-foreground text-sm">Recibirás un correo con el número de tracking para que sepas exactamente dónde está tu paquete.</p>
                  </div>
                </div>

                <div className="relative flex items-center gap-6 group">
                  <div className="absolute left-0 w-10 h-10 flex items-center justify-center rounded-full bg-primary text-primary-foreground group-hover:scale-110 transition-transform shadow-lg">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div className="ml-12">
                    <h4 className="font-bold text-lg">¡Llegada a tu Hogar!</h4>
                    <p className="text-muted-foreground text-sm">Recibes tu calzado ergonómico Saguaro y comienzas a cuidar la salud de tus pies.</p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FAQ Shipping */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Preguntas Frecuentes de Envío</h2>
            <p className="text-muted-foreground">Todo lo que necesitas saber sobre el despacho de tus productos.</p>
          </div>

          <div className="space-y-6">
            <div className="bg-background p-6 rounded-2xl shadow-sm border">
              <h4 className="font-bold text-lg mb-2">¿Puedo cambiar la dirección de envío?</h4>
              <p className="text-muted-foreground text-sm">Puedes hacerlo siempre y cuando el pedido no haya sido entregado al courier. Escríbenos lo antes posible a nuestro WhatsApp de soporte.</p>
            </div>
            
            <div className="bg-background p-6 rounded-2xl shadow-sm border">
              <h4 className="font-bold text-lg mb-2">¿Qué pasa si no hay nadie en mi casa?</h4>
              <p className="text-muted-foreground text-sm">Nuestros partners logísticos realizan hasta 2 intentos de entrega. Si ambos fallan, el pedido regresará a nuestra bodega y deberás costear un nuevo envío.</p>
            </div>

            <div className="bg-background p-6 rounded-2xl shadow-sm border">
              <h4 className="font-bold text-lg mb-2">¿Hacen envíos a oficinas de courier?</h4>
              <p className="text-muted-foreground text-sm">Sí, puedes solicitar el envío a una sucursal de Chilexpress o Starken. Solo indícalo claramente en los detalles de la dirección al pagar.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-12 border-t">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-8">Nuestros Partners Logísticos</p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-500">
             {/* Note: In a real app we'd use logos. Here we use text placeholders representing the big couriers in Chile */}
             <span className="text-2xl font-black italic tracking-tighter">CHILEXPRESS</span>
             <span className="text-2xl font-black italic tracking-tighter">STARKEN</span>
             <span className="text-2xl font-black italic tracking-tighter">BLUE EXPRESS</span>
          </div>
        </div>
      </section>
    </div>
  )
}
