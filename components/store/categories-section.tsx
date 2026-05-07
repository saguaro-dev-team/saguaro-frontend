import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const categories = [
  {
    name: 'Hombre',
    description: 'Rendimiento y estilo natural',
    href: '/categoria/hombre',
    image: '/images/cat-hombre.png',
  },
  {
    name: 'Mujer',
    description: 'Elegancia en cada paso',
    href: '/categoria/mujer',
    image: '/images/cat-mujer.png',
  },
  {
    name: 'Niños',
    description: 'Libertad para crecer',
    href: '/categoria/nino',
    image: '/images/cat-nino.png',
  },
]



export function CategoriesSection() {
  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            Compra por Categoria
          </h2>
          <p className="mt-3 text-lg text-muted-foreground text-pretty">
            Encuentra el calzado perfecto para cada miembro de la familia
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="group relative overflow-hidden rounded-3xl aspect-[4/5] shadow-lg hover:shadow-2xl transition-all duration-500"
            >
              {/* Background Image */}
              <img 
                src={category.image} 
                alt={category.name}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-500 group-hover:opacity-90" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-end p-8 text-white">
                <div className="transform transition-transform duration-500 group-hover:-translate-y-4 text-center">
                    <h3 className="text-3xl font-black tracking-tight uppercase italic">{category.name}</h3>
                    <p className="mt-2 text-white/70 text-sm font-medium line-clamp-2 max-w-[200px] mx-auto">
                        {category.description}
                    </p>
                    <div className="mt-6 flex items-center justify-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 py-2 px-6 rounded-full text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                        Explorar
                        <ArrowRight className="h-4 w-4" />
                    </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  )
}
