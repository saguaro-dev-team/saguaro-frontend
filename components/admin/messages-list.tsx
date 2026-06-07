'use client'

import { useState, useTransition } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { 
  FileText, 
  ExternalLink, 
  Mail, 
  User, 
  Clock, 
  Tag, 
  Reply, 
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { replyToMessage } from '@/app/actions/contact'

interface Message {
  id: string
  fecha: string
  nombre: string
  email: string
  motivo: string
  mensaje: string
  numero_pedido: string | null
  linkedin_url: string | null
  cv_url: string | null
  leido: boolean
  respondido: boolean
  respuesta?: string
  fecha_respuesta?: string
}

interface MessagesListProps {
  initialMessages: Message[]
}

export function MessagesList({ initialMessages }: MessagesListProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [selectedMsg, setSelectedMsg] = useState<Message | null>(null)
  const [replyText, setReplyText] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  // Mapear motivos a etiquetas y colores
  const getMotivoLabel = (motivo: string) => {
    switch (motivo) {
      case 'soporte': return { text: 'Soporte / Pedido', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' }
      case 'tallas': return { text: 'Dudas Tallas', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' }
      case 'trabaja': return { text: 'Postulación Trabajo', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' }
      case 'mayorista': return { text: 'Mayorista / Colaboración', color: 'bg-green-500/10 text-green-500 border-green-500/20' }
      default: return { text: 'Otro Motivo', color: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20' }
    }
  }

  const handleReplyClick = (msg: Message) => {
    setSelectedMsg(msg)
    // Prefill template message
    setReplyText(`Hola ${msg.nombre},\n\nGracias por ponerte en contacto con nosotros.\n\n[Escribe tu respuesta aquí]\n\nSaludos cordiales,\nEquipo Saguaro Chile`)
    setDialogOpen(true)
  }

  const handleSendReply = () => {
    if (!selectedMsg || !replyText.trim()) return

    startTransition(async () => {
      try {
        const res = await replyToMessage(selectedMsg.id, replyText)
        if (res.success) {
          // Update local state
          setMessages(prev => prev.map(m => {
            if (m.id !== selectedMsg.id) return m
            return {
              ...m,
              leido: true,
              respondido: true,
              respuesta: replyText,
              fecha_respuesta: new Date().toISOString()
            }
          }))

          toast({
            title: "Respuesta enviada",
            description: `La respuesta ha sido enviada al correo ${selectedMsg.email}.`,
          })
          setDialogOpen(false)
        } else {
          toast({
            title: "Error",
            description: res.error || "No se pudo enviar la respuesta.",
            variant: "destructive"
          })
        }
      } catch (e: any) {
        toast({
          title: "Error",
          description: e.message || "Ocurrió un error inesperado.",
          variant: "destructive"
        })
      }
    })
  }

  return (
    <div className="grid gap-6">
      {messages.map((msg) => {
        const motivoInfo = getMotivoLabel(msg.motivo)
        return (
          <Card 
            key={msg.id} 
            className={`overflow-hidden transition-all duration-300 border ${
              msg.respondido 
                ? 'bg-zinc-50/50 dark:bg-zinc-900/30 opacity-80 border-border' 
                : 'bg-background shadow-md border-primary/20 hover:shadow-lg'
            }`}
          >
            <div className="flex flex-col md:flex-row">
              {/* Info Column */}
              <div className="md:w-1/3 bg-muted/20 p-6 border-r flex flex-col gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className={`${motivoInfo.color} font-medium`}>
                    {motivoInfo.text}
                  </Badge>
                  {!msg.leido && (
                    <Badge variant="destructive" className="animate-pulse">Nuevo</Badge>
                  )}
                  {msg.respondido && (
                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                      Respondido
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <User className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{msg.nombre}</p>
                      <a href={`mailto:${msg.email}`} className="text-xs text-primary hover:underline block truncate">
                        {msg.email}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <Clock className="h-4 w-4 shrink-0" />
                    {new Date(msg.fecha).toLocaleString('es-CL')}
                  </div>
                  
                  {msg.numero_pedido && (
                    <div className="flex items-center gap-3 text-xs">
                      <Tag className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="font-medium">Pedido: {msg.numero_pedido}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Content Column */}
              <div className="md:w-2/3 p-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Mensaje del cliente:</h4>
                    <p className="text-sm whitespace-pre-wrap text-muted-foreground leading-relaxed bg-muted/10 p-4 rounded-xl border border-muted/50">
                      {msg.mensaje}
                    </p>
                  </div>

                  {/* Reply Log (if already replied) */}
                  {msg.respondido && msg.respuesta && (
                    <div className="mt-4 p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-500/20 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle className="h-4 w-4" />
                        <span>Respuesta enviada {msg.fecha_respuesta && `el ${new Date(msg.fecha_respuesta).toLocaleString('es-CL')}`}:</span>
                      </div>
                      <p className="text-xs whitespace-pre-wrap text-muted-foreground italic leading-relaxed">
                        {msg.respuesta}
                      </p>
                    </div>
                  )}

                  {/* Attachments Section */}
                  {(msg.cv_url || msg.linkedin_url) && (
                    <div className="pt-4 border-t flex flex-wrap gap-4 items-center">
                      <span className="text-sm font-semibold text-muted-foreground mr-2">Adjuntos:</span>
                      
                      {msg.cv_url && (
                        <a 
                          href={msg.cv_url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors"
                        >
                          <FileText className="h-4 w-4" />
                          Ver Currículum (PDF/DOC)
                        </a>
                      )}
                      
                      {msg.linkedin_url && (
                        <a 
                          href={msg.linkedin_url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex items-center gap-2 bg-[#0A66C2]/10 text-[#0A66C2] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#0A66C2]/20 transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Perfil de LinkedIn
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-6 pt-4 border-t flex justify-end gap-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    asChild 
                    className="gap-2"
                  >
                    <a href={`mailto:${msg.email}?subject=RE: Consulta a Saguaro Chile - ${motivoInfo.text}&body=Hola ${msg.nombre},%0D%0A%0D%0AEn respuesta a tu mensaje:%0D%0A"${msg.mensaje}"%0D%0A%0D%0A----------------------%0D%0A`}>
                      Abrir en Correo
                    </a>
                  </Button>
                  
                  <Button 
                    size="sm" 
                    className="gap-2"
                    onClick={() => handleReplyClick(msg)}
                  >
                    <Reply className="h-4 w-4" />
                    {msg.respondido ? "Responder de nuevo" : "Responder"}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )
      })}

      {/* Reply Dialog Modal */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Reply className="h-5 w-5 text-primary" />
              Responder a {selectedMsg?.nombre}
            </DialogTitle>
            <DialogDescription>
              Escribe una respuesta para enviarla al correo <span className="font-semibold text-foreground">{selectedMsg?.email}</span>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-muted/30 border border-muted p-3 rounded-lg text-xs space-y-1">
              <p className="font-semibold">Consulta original:</p>
              <p className="text-muted-foreground line-clamp-3 italic">"{selectedMsg?.mensaje}"</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Respuesta:</label>
              <Textarea
                rows={6}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Escribe tu mensaje aquí..."
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isPending}>
              Cancelar
            </Button>
            <Button onClick={handleSendReply} disabled={isPending || !replyText.trim()}>
              {isPending ? "Enviando..." : "Enviar Respuesta"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
