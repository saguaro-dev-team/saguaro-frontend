import { getDiscountedProducts } from '@/app/actions/products'
import { ProductCard } from '@/components/store/product-card'
import { Tag, Percent, Clock } from 'lucide-react'

export const metadata = {
  title: 'Ofertas y Promociones | Saguaro Barefoot',
  description: 'Aprovecha los mejores descuentos en calzado barefoot. Ofertas por tiempo limitado en modelos seleccionados.',
}

export default async function OfertasPage() {
  const discountedProducts = await getDiscountedProducts()

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section para Ofertas */}
      <section className="relative py-20 overflow-hidden bg-zinc-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(220,38,38,0.15),transparent)] pointer-events-none" />
        <div className="container relative mx-auto px-4">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/10 border border-red-600/20 text-red-500 text-sm font-medium mb-6 animate-fade-in">
              <Percent className="w-4 h-4" />
              <span>Venta de Temporada</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
              Ofertas <br />Irresistibles
            </h1>
            <p className="text-xl text-zinc-400 mb-8 leading-relaxed max-w-2xl">
              Equípate con lo mejor del calzado barefoot a precios reducidos. 
              Calidad premium diseñada para la salud de tus pies, ahora más accesible.
            </p>
            <div className="flex flex-wrap gap-6 text-sm text-zinc-500">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-500" />
                <span>Tiempo limitado</span>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-red-500" />
                <span>Hasta 40% OFF</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grid de Productos */}
      <section className="py-16 bg-zinc-50 dark:bg-zinc-900/50 flex-1">
        <div className="container mx-auto px-4">
          {discountedProducts.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">
                  Productos en Promoción
                </h2>
                <span className="text-sm text-zinc-500">
                  Mostrando {discountedProducts.length} productos
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                {discountedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-6">
                <Tag className="w-8 h-8 text-zinc-400" />
              </div>
              <h3 className="text-xl font-medium text-zinc-900 dark:text-white mb-2">
                No hay ofertas activas en este momento
              </h3>
              <p className="text-zinc-500 max-w-md mx-auto">
                Estamos preparando nuevas promociones para ti. ¡Vuelve pronto o suscríbete a nuestro boletín para enterarte primero!
              </p>
            </div>
          )}
        </div>
      </section>
      
      {/* Banner de Urgencia */}
      <section className="py-12 border-t border-zinc-200 dark:border-zinc-800">
        <div className="container mx-auto px-4">
            <div className="bg-red-600 rounded-3xl p-8 md:p-12 overflow-hidden relative">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="text-center md:text-left">
                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                            ¿No quieres perderte ninguna oferta?
                        </h3>
                        <p className="text-red-100 opacity-90 text-lg">
                            Regístrate y recibe notificaciones exclusivas antes que nadie.
                        </p>
                    </div>
                    <button className="bg-white text-red-600 px-8 py-4 rounded-xl font-bold hover:bg-zinc-100 transition-colors shadow-lg shadow-red-900/20">
                        Suscribirme ahora
                    </button>
                </div>
                {/* Decoración abstracta */}
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-red-500 rounded-full blur-3xl opacity-50" />
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-96 h-96 bg-red-400 rounded-full blur-3xl opacity-30" />
            </div>
        </div>
      </section>
    </div>
  )
}
