import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const categories = [
  {
    name: 'Hombre',
    description: 'Calzado barefoot para el hombre moderno',
    href: '/categoria/hombre',
    gradient: 'from-slate-800 to-slate-600',
  },
  {
    name: 'Mujer',
    description: 'Estilo y comodidad natural',
    href: '/categoria/mujer',
    gradient: 'from-rose-600 to-rose-400',
  },
  {
    name: 'Ninos',
    description: 'Para pies en desarrollo',
    href: '/categoria/nino',
    gradient: 'from-sky-600 to-sky-400',
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

        <div className="grid gap-6 md:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="group relative overflow-hidden rounded-2xl"
            >
              <div
                className={`aspect-[4/5] bg-gradient-to-br ${category.gradient} flex flex-col items-center justify-center p-8 text-white transition-transform group-hover:scale-105`}
              >
                <h3 className="text-2xl font-bold">{category.name}</h3>
                <p className="mt-2 text-white/80 text-center">{category.description}</p>
                <div className="mt-6 flex items-center gap-2 font-medium">
                  Ver productos
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
