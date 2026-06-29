import Link from 'next/link'
import { Calendar, User, ArrowRight, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getAllPosts } from '@/app/actions/blog'

export default async function BlogPage() {
  const posts = await getAllPosts()

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 border-primary text-primary">Nuestro Blog</Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            Comunidad Barefoot
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Consejos, guías y novedades sobre el movimiento natural del pie y la cultura Saguaro.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20 border rounded-2xl bg-muted/20">
            <h3 className="text-xl font-medium mb-2">Aún no hay publicaciones</h3>
            <p className="text-muted-foreground">Estamos preparando contenido increíble para ti.</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post: any) => (
              <Card key={post.id_post} className="group overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
                <Link href={`/blog/${post.slug}`}>
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <img 
                      src={post.imagen_url || '/blog-placeholder.jpg'} 
                      alt={post.titulo}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-white/90 text-black backdrop-blur-sm border-none">Salud</Badge>
                    </div>
                  </div>
                </Link>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(post.fecha_publicacion).toLocaleDateString('es-CL')}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      5 min lectura
                    </div>
                  </div>
                  <Link href={`/blog/${post.slug}`}>
                    <h2 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                      {post.titulo}
                    </h2>
                  </Link>
                  <p className="text-muted-foreground text-sm line-clamp-3 mb-6">
                    {post.resumen}
                  </p>
                  <Button variant="link" asChild className="p-0 h-auto text-primary font-bold">
                    <Link href={`/blog/${post.slug}`}>
                      Leer más
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
