import { getContactMessages } from '@/app/actions/contact'
import { Mail, Filter } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MessagesList } from '@/components/admin/messages-list'

export default async function AdminMessagesPage({ searchParams }: { searchParams: { motivo?: string } }) {
  let mensajes = await getContactMessages()
  
  // Filtrar mensajes de inyección / pruebas de seguridad
  mensajes = mensajes.filter((m: any) => m.email !== 'hacker@xss.com' && m.nombre !== 'Atacante XSS')
  
  const currentFilter = searchParams.motivo || 'todos'
  
  if (currentFilter !== 'todos') {
      mensajes = mensajes.filter((m: any) => m.motivo === currentFilter)
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

      <div>
        {mensajes.length === 0 ? (
            <div className="text-center py-20 bg-muted/30 rounded-3xl border border-dashed">
                <Mail className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-medium">Bandeja de entrada vacía</h3>
                <p className="text-muted-foreground">Aún no has recibido ningún mensaje.</p>
            </div>
        ) : (
            <MessagesList initialMessages={mensajes} />
        )}
      </div>
    </div>
  )
}
