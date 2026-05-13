import { Gavel, FileText, ShieldCheck, CreditCard, Truck, RefreshCw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-muted/30 border-b py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-4 bg-primary text-primary-foreground px-4 py-1 uppercase tracking-widest font-bold border-none">
            Aspectos Legales
          </Badge>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic text-foreground mb-6">
            Términos y Condiciones
          </h1>
          <p className="text-lg text-muted-foreground font-medium max-w-2xl mx-auto">
            Bienvenido a Saguaro Chile. Al utilizar nuestro sitio web, aceptas cumplir con los siguientes términos que rigen nuestra relación comercial.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto space-y-12">
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <FileText className="h-6 w-6" />
              <h2 className="text-2xl font-bold tracking-tight text-foreground">1. Generalidades</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Este sitio web es operado por Saguaro Chile. En todo el sitio, los términos “nosotros”, “nos” y “nuestro” se refieren a Saguaro Chile. Ofrecemos este sitio web, incluyendo toda la información, herramientas y servicios disponibles para ti, el usuario, condicionado a la aceptación de todos los términos, condiciones, políticas y avisos aquí establecidos.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <FileText className="h-6 w-6" />
              <h2 className="text-2xl font-bold tracking-tight text-foreground">2. Requisitos de Usuario</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Para realizar compras en nuestro sitio web, el usuario debe ser mayor de 12 años. Saguaro Chile se reserva el derecho de venta y de cancelar pedidos si se detecta que el usuario no cumple con esta edad mínima o si la información proporcionada es inconsistente. Asimismo, el sistema limita el registro a personas de hasta 110 años.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <CreditCard className="h-6 w-6" />
              <h2 className="text-2xl font-bold tracking-tight text-foreground">3. Precios y Pagos</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Todos los precios indicados en el sitio están en pesos chilenos (CLP) e incluyen el IVA. Nos reservamos el derecho de modificar los precios en cualquier momento sin previo aviso. Los pagos se procesan de forma segura a través de Webpay (Transbank) y Mercado Pago. Tu pedido será procesado una vez que la transacción sea validada por la entidad bancaria.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <Truck className="h-6 w-6" />
              <h2 className="text-2xl font-bold tracking-tight text-foreground">4. Envíos y Logística</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Realizamos envíos a todo Chile a través de empresas de transporte externas (Chilexpress, Starken, Blue Express). Los tiempos de entrega son referenciales y pueden variar según la ubicación y condiciones externas. El riesgo de pérdida o daño de los productos se transfiere al cliente al momento de la entrega en la dirección indicada.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <RefreshCw className="h-6 w-6" />
              <h2 className="text-2xl font-bold tracking-tight text-foreground">5. Cambios y Devoluciones</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Nuestra política de cambios y devoluciones se rige por la Ley de Protección de los Derechos de los Consumidores (Ley N° 19.496). Tienes un plazo de 30 días para cambios por satisfacción y 6 meses de garantía legal por fallas de fábrica. El calzado debe devolverse en perfecto estado y en su empaque original.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <ShieldCheck className="h-6 w-6" />
              <h2 className="text-2xl font-bold tracking-tight text-foreground">6. Propiedad Intelectual</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Todo el contenido incluido en este sitio, como texto, gráficos, logotipos, imágenes y software, es propiedad de Saguaro Chile o sus proveedores de contenido y está protegido por las leyes de propiedad intelectual chilenas e internacionales. Queda prohibida la reproducción total o parcial de cualquier contenido sin autorización previa.
            </p>
          </div>

          <div className="space-y-4 border-t pt-12">
            <div className="flex items-center gap-3 text-primary">
              <Gavel className="h-6 w-6" />
              <h2 className="text-2xl font-bold tracking-tight text-foreground">7. Legislación Aplicable</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Estos términos de servicio y cualquier acuerdo por separado por el cual te proporcionemos servicios se regirán e interpretarán de acuerdo con las leyes vigentes en la República de Chile. Cualquier controversia será sometida a la jurisdicción de los tribunales competentes de Santiago de Chile.
            </p>
          </div>

          <div className="bg-muted p-8 rounded-3xl text-center space-y-4">
            <p className="text-sm text-muted-foreground font-medium">Última actualización: 10 de Mayo de 2026</p>
            <p className="text-sm text-muted-foreground">Si tienes alguna duda sobre estos términos, por favor contáctanos a través de nuestro formulario de soporte.</p>
          </div>

        </div>
      </section>
    </div>
  )
}
