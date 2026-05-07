'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Mail, Phone, MapPin, Send, MessageSquare, Briefcase, Info, ChevronRight, CheckCircle2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LucideIcon } from 'lucide-react'
import { submitContactMessage } from '@/app/actions/contact'

// Re-importing missing icons if needed or just using lucide-react
import { 
  Mail as MailIcon, 
  Phone as PhoneIcon, 
  MapPin as MapPinIcon, 
  Send as SendIcon, 
  Info as InfoIcon, 
  CheckCircle2 as CheckIcon 
} from 'lucide-react'

function ContactForm() {
  const searchParams = useSearchParams()
  const initialReason = searchParams.get('reason') || ''
  
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [reason, setReason] = useState(initialReason)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    formData.append('motivo', reason) // Añadir el valor del select
    
    const result = await submitContactMessage(formData)
    
    setLoading(false)
    if (result.success) {
      setSubmitted(true)
    } else {
      alert(result.error)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center space-y-6 animate-in fade-in zoom-in duration-500">
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <CheckIcon className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">¡Mensaje recibido!</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Gracias por contactar con Saguaro Chile. Hemos recibido tu solicitud y nos pondremos en contacto contigo lo antes posible.
          </p>
          <Button variant="outline" onClick={() => setSubmitted(false)}>Enviar otro mensaje</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16">
          
          {/* Info Side */}
          <div className="space-y-12">
            <div>
              <Badge className="mb-4">Centro de Ayuda</Badge>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic">
                ¿En qué podemos <span className="text-primary">ayudarte?</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                Estamos aquí para escucharte. Ya sea una duda sobre tu pedido, una sugerencia o si quieres formar parte de nuestro equipo, usa el formulario y nos pondremos en marcha.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-8">
              <div className="flex gap-4">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                  <MailIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold">Escríbenos</h4>
                  <p className="text-sm text-muted-foreground">chilesaguaro@outlook.com</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                  <PhoneIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold">Llámanos</h4>
                  <p className="text-sm text-muted-foreground">+56 9 1234 5678</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPinIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold">Ubicación</h4>
                  <p className="text-sm text-muted-foreground">Santiago, Chile</p>
                </div>
              </div>
            </div>

            <Card className="bg-muted/50 border-none rounded-3xl overflow-hidden">
                <CardContent className="p-8">
                    <div className="flex items-center gap-4 mb-4">
                        <InfoIcon className="h-5 w-5 text-primary" />
                        <h4 className="font-bold uppercase tracking-widest text-xs">Información Importante</h4>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Nuestro tiempo de respuesta promedio es de 24 a 48 horas hábiles. Para consultas sobre devoluciones, por favor incluye tu número de pedido en el mensaje.
                    </p>
                </CardContent>
            </Card>
          </div>

          {/* Form Side */}
          <div className="bg-background border rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-primary/5">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold ml-1">Nombre Completo</label>
                    <Input name="nombre" placeholder="Tu nombre" className="rounded-xl" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold ml-1">Correo Electrónico</label>
                    <Input name="email" type="email" placeholder="tu@email.com" className="rounded-xl" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold ml-1">¿Cuál es el motivo de tu contacto?</label>
                  <Select value={reason} onValueChange={(v) => setReason(v)} required>
                    <SelectTrigger className="rounded-xl h-12">
                      <SelectValue placeholder="Selecciona una opción" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="soporte">Soporte técnico / Mi pedido</SelectItem>
                      <SelectItem value="tallas">Dudas sobre tallas</SelectItem>
                      <SelectItem value="trabaja">Trabajar en Saguaro Chile (Vacantes)</SelectItem>
                      <SelectItem value="mayorista">Ventas por mayor / Colaboraciones</SelectItem>
                      <SelectItem value="otro">Otro motivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {reason === 'soporte' && (
                  <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                    <label className="text-sm font-semibold ml-1">Número de Pedido (Opcional)</label>
                    <Input name="numero_pedido" placeholder="#10234" className="rounded-xl h-12 border-primary/30" />
                  </div>
                )}

                {reason === 'trabaja' && (
                  <div className="space-y-4 animate-in slide-in-from-top-2 duration-300 bg-muted/30 p-4 rounded-2xl border">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold ml-1">Adjuntar Currículum (PDF/DOC)</label>
                      <Input name="cv_file" type="file" accept=".pdf,.doc,.docx" className="rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90" />
                    </div>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Ó</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold ml-1">Enlace a tu LinkedIn / Portafolio</label>
                      <Input name="linkedin_url" type="url" placeholder="https://linkedin.com/in/tuperfil" className="rounded-xl h-12" />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-semibold ml-1">Tu Mensaje</label>
                  <Textarea 
                    name="mensaje"
                    placeholder={reason === 'trabaja' ? "Cuéntanos por qué quieres unirte a Saguaro..." : "Escribe tu mensaje aquí..."} 
                    className="min-h-[150px] rounded-2xl resize-none" 
                    required 
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-14 rounded-2xl text-lg font-bold transition-all hover:scale-[1.02] active:scale-[0.98]" 
                disabled={loading}
              >
                {loading ? 'Enviando...' : (
                  <>
                    Enviar Mensaje
                    <SendIcon className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground mt-4 italic">
                Al enviar este formulario, aceptas nuestra política de privacidad.
              </p>
            </form>
          </div>

        </div>
      </div>
    </div>
  )
}

export default function ContactPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
      <ContactForm />
    </Suspense>
  )
}
