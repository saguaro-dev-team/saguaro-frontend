import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Calendar, User, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { getPostBySlug } from '@/app/actions/blog'
import { ShareButtons } from '@/components/store/share-buttons'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  return (
    <article className="min-h-screen pb-20">
      {/* Hero Header */}
      <div className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden">
        <img 
          src={post.imagen_url || '/blog-placeholder.jpg'} 
          className="w-full h-full object-cover"
          alt={post.titulo}
        />
        <div className="absolute inset-0 bg-black/40 flex items-end">
          <div className="mx-auto max-w-4xl w-full px-4 pb-12">
            <Link href="/blog" className="inline-flex items-center text-white/80 hover:text-white mb-6 text-sm transition-colors">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Volver al blog
            </Link>
            <Badge className="mb-4 bg-primary text-primary-foreground border-none px-4 py-1">Bienestar</Badge>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
              {post.titulo}
            </h1>
            <div className="flex items-center gap-6 text-white/90 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {post.autor}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date(post.fecha_publicacion).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 mt-12">
        <div className="flex flex-col md:flex-row gap-12">
          {/* Main Body */}
          <div className="flex-1">
            <div className="prose prose-lg prose-primary max-w-none dark:prose-invert">
              {post.contenido.includes('<p>') || post.contenido.includes('</p>') || post.contenido.includes('<br') ? (
                <div 
                  className="text-muted-foreground leading-relaxed text-lg"
                  dangerouslySetInnerHTML={{ __html: post.contenido }}
                />
              ) : (
                post.contenido.split('\n').map((para: string, i: number) => (
                  para.trim() ? <p key={i} className="mb-6 text-muted-foreground leading-relaxed text-lg">{para}</p> : <br key={i} />
                ))
              )}
            </div>

            <Separator className="my-12" />

            <ShareButtons slug={post.slug} titulo={post.titulo} />
          </div>

          {/* Sidebar */}
          <div className="w-full md:w-64 shrink-0">
            <div className="sticky top-24 space-y-8">
              <div className="p-6 rounded-2xl bg-muted/50 border border-border">
                <h3 className="font-bold mb-4">Sobre Saguaro</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Somos apasionados por el movimiento natural y la salud integral del pie.
                </p>
                <Button asChild className="w-full">
                  <Link href="/categoria/todos">Ver Catálogo</Link>
                </Button>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Etiquetas</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Barefoot</Badge>
                  <Badge variant="secondary">Salud</Badge>
                  <Badge variant="secondary">Running</Badge>
                  <Badge variant="secondary">Consejos</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
