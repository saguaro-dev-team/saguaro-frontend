import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { HelpCircle, Truck, CreditCard, RefreshCw, Ruler, MessageCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const faqCategories = [
  {
    title: 'Productos y Tallas',
    icon: Ruler,
    questions: [
      {
        q: '¿Qué es el calzado barefoot?',
        a: 'El calzado barefoot (o minimalista) está diseñado para interferir lo menos posible con el movimiento natural del pie. Se caracteriza por tener una puntera ancha, suela fina y flexible, y "zero drop" (sin elevación en el talón).'
      },
      {
        q: '¿Cómo elijo mi talla correcta?',
        a: 'Recomendamos medir tu pie en centímetros y consultar nuestra Guía de Tallas. Por lo general, en calzado barefoot se sugiere dejar entre 0.8 y 1.2 cm de espacio extra frente a los dedos.'
      },
      {
        q: '¿Son adecuados para hacer deporte?',
        a: '¡Sí! Tenemos modelos específicos para running, trail y fitness. Sin embargo, si es tu primera vez usando barefoot, te recomendamos un periodo de transición gradual para fortalecer la musculatura de tus pies.'
      }
    ]
  },
  {
    title: 'Envíos y Pedidos',
    icon: Truck,
    questions: [
      {
        q: '¿Cuánto tarda en llegar mi pedido?',
        a: 'En la Región Metropolitana tarda de 2 a 4 días hábiles. Para el resto de Chile, entre 3 y 7 días hábiles. Zonas extremas pueden demorar hasta 12 días.'
      },
      {
        q: '¿Cómo puedo hacer seguimiento a mi compra?',
        a: 'Una vez que el courier retire tu paquete, te enviaremos un correo electrónico con el número de seguimiento y el link del transportista.'
      },
      {
        q: '¿Hacen envíos a todo Chile?',
        a: 'Sí, llegamos a todo el territorio nacional a través de nuestros partners logísticos (Chilexpress, Starken y Blue Express).'
      }
    ]
  },
  {
    title: 'Pagos y Promociones',
    icon: CreditCard,
    questions: [
      {
        q: '¿Qué métodos de pago aceptan?',
        a: 'Aceptamos tarjetas de débito y crédito a través de Webpay, transferencias electrónicas bancarias y Mercado Pago.'
      },
      {
        q: '¿Es seguro comprar en el sitio?',
        a: 'Absolutamente. Contamos con certificados SSL y procesamos los pagos a través de plataformas líderes que garantizan la seguridad de tus datos bancarios.'
      },
      {
        q: '¿Cómo aplico un código de descuento?',
        a: 'Puedes ingresar tu cupón en el resumen del carrito o durante el proceso de checkout antes de finalizar el pago.'
      }
    ]
  },
  {
    title: 'Devoluciones y Garantía',
    icon: RefreshCw,
    questions: [
      {
        q: '¿Puedo cambiar mis zapatos si no me quedan?',
        a: 'Sí, tienes 30 días para realizar cambios de talla o modelo, siempre que el producto esté sin uso y en su empaque original.'
      },
      {
        q: '¿Cuál es el proceso de devolución?',
        a: 'Debes contactarnos vía WhatsApp o correo. Te indicaremos los pasos para el envío de vuelta a nuestra bodega. El primer cambio de talla por fallas de calce es gratuito.'
      },
      {
        q: '¿Tienen garantía legal?',
        a: 'Sí, todos nuestros productos cuentan con la garantía legal de 6 meses por fallas de fabricación, conforme a la normativa vigente del SERNAC.'
      }
    ]
  }
]

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Header */}
      <div className="bg-muted/30 border-b">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <Badge variant="outline" className="mb-4 border-primary text-primary px-3 py-1 uppercase tracking-tighter font-bold">
            Centro de Ayuda
          </Badge>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground mb-4 italic uppercase">
            Preguntas Frecuentes
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Encuentra respuestas rápidas sobre nuestros productos, procesos de envío y políticas de la tienda.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-12 space-y-12">
        {faqCategories.map((category, idx) => (
          <section key={idx} className="space-y-6">
            <div className="flex items-center gap-3 border-b pb-2">
              <category.icon className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold tracking-tight">{category.title}</h2>
            </div>
            
            <Accordion type="single" collapsible className="w-full">
              {category.questions.map((item, qIdx) => (
                <AccordionItem key={qIdx} value={`item-${idx}-${qIdx}`} className="border-none mb-2 px-4 rounded-xl hover:bg-muted/50 transition-colors">
                  <AccordionTrigger className="text-left font-semibold py-4 hover:no-underline text-foreground">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-4">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        ))}

        {/* Contact CTA */}
        <div className="mt-20 p-8 bg-primary rounded-[2rem] text-primary-foreground text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
            <div className="relative z-10 space-y-6">
                <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                    <MessageCircle className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold tracking-tight">¿Aún tienes dudas?</h3>
                <p className="text-primary-foreground/80 max-w-md mx-auto">
                    Nuestro equipo de expertos está listo para asesorarte en tu transición al mundo barefoot.
                </p>
                <div className="flex flex-wrap justify-center gap-4 pt-2">
                    <a 
                        href="https://wa.me/56912345678" 
                        target="_blank" 
                        className="bg-white text-primary font-bold px-8 py-3 rounded-full hover:bg-opacity-90 transition-all shadow-lg"
                    >
                        WhatsApp Soporte
                    </a>
                    <a 
                        href="/contacto" 
                        className="bg-primary-foreground/10 border border-white/20 text-white font-bold px-8 py-3 rounded-full hover:bg-white/10 transition-all"
                    >
                        Formulario de Contacto
                    </a>
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}
