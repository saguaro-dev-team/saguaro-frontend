import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductCard } from './product-card'
import { featuredProducts } from '@/lib/store-data'

interface FeaturedProductsProps {
  title?: string
  subtitle?: string
  showViewAll?: boolean
  viewAllHref?: string
}

export function FeaturedProducts({
  title = 'Productos Destacados',
  subtitle = 'Los favoritos de nuestros clientes',
  showViewAll = true,
  viewAllHref = '/categoria/hombre',
}: FeaturedProductsProps) {
  return (
    <section className="py-16 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
              {title}
            </h2>
            <p className="mt-2 text-lg text-muted-foreground">{subtitle}</p>
          </div>
          {showViewAll && (
            <Button variant="ghost" asChild className="hidden sm:flex">
              <Link href={viewAllHref}>
                Ver todos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {featuredProducts.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {showViewAll && (
          <div className="mt-8 text-center sm:hidden">
            <Button asChild>
              <Link href={viewAllHref}>
                Ver todos los productos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
