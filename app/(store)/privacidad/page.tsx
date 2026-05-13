import { ShieldCheck, Lock, EyeOff, UserCheck, Database, Mail } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-muted/30 border-b py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-4 bg-primary text-primary-foreground px-4 py-1 uppercase tracking-widest font-bold border-none">
            Tu Privacidad es Primero
          </Badge>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic text-foreground mb-6">
            Política de Privacidad
          </h1>
          <p className="text-lg text-muted-foreground font-medium max-w-2xl mx-auto">
            En Saguaro Chile nos tomamos muy en serio la seguridad de tu información personal. Aquí te explicamos cómo la protegemos.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto space-y-16">
          
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-primary">
                <Database className="h-6 w-6" />
                <h2 className="text-2xl font-bold tracking-tight">Datos Recopilados</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Para brindarte un servicio ergonómico excepcional, recopilamos información básica como:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Nombre y apellidos</li>
                <li>RUT (para facturación y envíos)</li>
                <li>Dirección de despacho</li>
                <li>Correo electrónico y teléfono</li>
                <li>Historial de compras</li>
              </ul>
            </div>
            <div className="bg-muted/50 p-8 rounded-[2rem] border space-y-4">
              <Lock className="h-10 w-10 text-primary" />
              <h3 className="text-xl font-bold">Seguridad de Nivel Bancario</h3>
              <p className="text-sm text-muted-foreground">
                Toda la comunicación en nuestro sitio web está cifrada bajo el protocolo SSL (Secure Sockets Layer). Nunca almacenamos los datos de tus tarjetas de crédito; estos son procesados directamente por Transbank o Mercado Pago.
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-6">
            <div className="flex items-center gap-3 text-primary">
              <UserCheck className="h-6 w-6" />
              <h2 className="text-2xl font-bold tracking-tight">Finalidad de la Información</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Los datos proporcionados serán utilizados exclusivamente para los siguientes fines:
            </p>
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="p-4 border rounded-xl bg-card">
                <h4 className="font-bold mb-2">Logística</h4>
                <p className="text-xs text-muted-foreground">Gestionar el despacho y entrega de tus productos a través de couriers.</p>
              </div>
              <div className="p-4 border rounded-xl bg-card">
                <h4 className="font-bold mb-2">Soporte</h4>
                <p className="text-xs text-muted-foreground">Brindarte asistencia personalizada en cambios, devoluciones o dudas técnicas.</p>
              </div>
              <div className="p-4 border rounded-xl bg-card">
                <h4 className="font-bold mb-2">Mejora</h4>
                <p className="text-xs text-muted-foreground">Analizar de forma anónima las tendencias de uso para mejorar nuestra oferta ergonómica.</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3 text-primary">
              <EyeOff className="h-6 w-6" />
              <h2 className="text-2xl font-bold tracking-tight">Terceros y Enlaces</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Saguaro Chile **no vende ni arrienda** tus datos a terceros. Solo compartiremos información estrictamente necesaria con nuestros socios logísticos (ej: Chilexpress) y pasarelas de pago para completar tu transacción.
            </p>
          </div>

          <div className="space-y-6 border-t pt-12">
            <div className="flex items-center gap-3 text-primary">
              <ShieldCheck className="h-6 w-6" />
              <h2 className="text-2xl font-bold tracking-tight">Tus Derechos (Ley 19.628)</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              En cumplimiento con la Ley de Protección a la Vida Privada de Chile, puedes ejercer en cualquier momento tus derechos de acceso, rectificación, cancelación y oposición enviándonos un correo electrónico. Garantizamos la eliminación total de tus datos de nuestras bases de marketing si así lo solicitas.
            </p>
          </div>

          <div className="bg-primary/5 p-10 rounded-[3rem] border border-primary/20 text-center space-y-6">
            <Mail className="h-10 w-10 text-primary mx-auto" />
            <h3 className="text-2xl font-bold tracking-tight">¿Consultas sobre tus datos?</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Si tienes preguntas sobre nuestra política de privacidad o quieres solicitar la eliminación de tu información, escríbenos a:
            </p>
            <p className="text-xl font-bold text-primary">chilesaguaro@outlook.com</p>
            <p className="text-xs text-muted-foreground pt-4">Última actualización: 10 de Mayo de 2026</p>
          </div>

        </div>
      </section>
    </div>
  )
}
