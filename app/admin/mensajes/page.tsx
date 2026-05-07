import { getContactMessages, markMessageAsRead } from '@/app/actions/contact'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, ExternalLink, Mail, User, Clock, CheckCircle, Tag, Reply, Filter } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function AdminMessagesPage({ searchParams }: { searchParams: { motivo?: string } }) {
  let mensajes = await getContactMessages()
  
  const currentFilter = searchParams.motivo || 'todos'
  
  if (currentFilter !== 'todos') {
      mensajes = mensajes.filter((m: any) => m.motivo === currentFilter)
  }

  // Mapear motivos a etiquetas más legibles y colores
  const getMotivoLabel = (motivo: string) => {
    switch (motivo) {
      case 'soporte': return { text: 'Soporte / Pedido', color: 'bg-blue-500/10 text-blue-500' }
      case 'tallas': return { text: 'Dudas Tallas', color: 'bg-orange-500/10 text-orange-500' }
      case 'trabaja': return { text: 'Postulación Trabajo', color: 'bg-purple-500/10 text-purple-500' }
      case 'mayorista': return { text: 'Mayorista / Colaboración', color: 'bg-green-500/10 text-green-500' }
      default: return { text: 'Otro Motivo', color: 'bg-zinc-500/10 text-zinc-500' }
    }
  }

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Centro de Mensajes</h1>
            <p className="text-muted-foreground mt-2">Gestiona las consultas de clientes y postulaciones recibidas.</p>
        </div>
        
        {/* Filtros */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 max-w-full">
            <Filter className="h-4 w-4 text-muted-foreground mr-2" />
            {[
                { id: 'todos', label: 'Todos' },
                { id: 'soporte', label: 'Soporte' },
                { id: 'tallas', label: 'Tallas' },
                { id: 'trabaja', label: 'Postulaciones' },
                { id: 'mayorista', label: 'Mayoristas' },
            ].map(f => (
                <Button 
                    key={f.id} 
                    variant={currentFilter === f.id ? 'default' : 'outline'} 
                    size="sm" 
                    asChild
                    className="rounded-full"
                >
                    <Link href={`/admin/mensajes${f.id === 'todos' ? '' : `?motivo=${f.id}`}`}>
                        {f.label}
                    </Link>
                </Button>
            ))}
        </div>
      </div>

      <div className="grid gap-6">
        {mensajes.length === 0 ? (
            <div className="text-center py-20 bg-muted/30 rounded-3xl border border-dashed">
                <Mail className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-medium">Bandeja de entrada vacía</h3>
                <p className="text-muted-foreground">Aún no has recibido ningún mensaje.</p>
            </div>
        ) : (
            mensajes.map((msg: any) => {
                const motivoInfo = getMotivoLabel(msg.motivo)
                return (
                <Card key={msg.id} className={`overflow-hidden transition-all ${msg.leido ? 'bg-muted/30 opacity-70' : 'bg-background shadow-md border-primary/20'}`}>
                    <div className="flex flex-col md:flex-row">
                        {/* Info Column */}
                        <div className="md:w-1/3 bg-muted/20 p-6 border-r flex flex-col gap-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Badge className={`${motivoInfo.color} border-none shadow-none`}>
                                    {motivoInfo.text}
                                </Badge>
                                {!msg.leido && <Badge variant="destructive" className="animate-pulse">Nuevo</Badge>}
                            </div>
                            
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <User className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                                    <div>
                                        <p className="font-semibold text-sm">{msg.nombre}</p>
                                        <a href={`mailto:${msg.email}`} className="text-xs text-primary hover:underline">{msg.email}</a>
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
                        <div className="md:w-2/3 p-6 flex flex-col">
                            <div className="flex-1">
                                <h4 className="font-semibold mb-2">Mensaje:</h4>
                                <p className="text-sm whitespace-pre-wrap text-muted-foreground leading-relaxed bg-muted/10 p-4 rounded-xl border border-muted/50">
                                    {msg.mensaje}
                                </p>
                            </div>

                            {/* Attachments Section */}
                            {(msg.cv_url || msg.linkedin_url) && (
                                <div className="mt-6 pt-6 border-t flex flex-wrap gap-4 items-center">
                                    <span className="text-sm font-semibold text-muted-foreground mr-2">Adjuntos:</span>
                                    
                                    {msg.cv_url && (
                                        <a href={msg.cv_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors">
                                            <FileText className="h-4 w-4" />
                                            Ver Currículum (PDF/DOC)
                                        </a>
                                    )}
                                    
                                    {msg.linkedin_url && (
                                        <a href={msg.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#0A66C2]/10 text-[#0A66C2] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#0A66C2]/20 transition-colors">
                                            <ExternalLink className="h-4 w-4" />
                                            Perfil de LinkedIn
                                        </a>
                                    )}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="mt-6 pt-6 border-t flex justify-end">
                                <Button asChild className="gap-2">
                                    <a href={`mailto:${msg.email}?subject=RE: Consulta a Saguaro Chile - ${motivoInfo.text}&body=Hola ${msg.nombre},%0D%0A%0D%0AEn respuesta a tu mensaje:%0D%0A"${msg.mensaje}"%0D%0A%0D%0A----------------------%0D%0A`}>
                                        <Reply className="h-4 w-4" />
                                        Responder
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>
            )})
        )}
      </div>
    </div>
  )
}
