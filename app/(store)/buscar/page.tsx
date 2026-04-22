import { searchProducts } from '@/app/actions/products'
import { ProductCard } from '@/components/store/product-card'

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams
  const query = q || ''
  
  const products = await searchProducts(query)

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Resultados de búsqueda
          </h1>
          <p className="mt-2 text-muted-foreground">
            {query ? (
              <>
                Mostrando resultados para: <span className="font-semibold text-foreground">"{query}"</span>
              </>
            ) : (
              'Ingresa un término de búsqueda para encontrar productos.'
            )}
          </p>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          query && (
            <div className="text-center py-20 bg-muted/30 rounded-2xl">
              <p className="text-muted-foreground">
                No encontramos productos que coincidan con "{query}".
              </p>
              <p className="text-sm mt-2 text-muted-foreground/80">
                Intenta con otros términos como "running", "casual" o "zero drop".
              </p>
            </div>
          )
        )}
      </div>
    </div>
  )
}
