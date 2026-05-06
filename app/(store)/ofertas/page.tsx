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
      <section className="relative py-24 md:py-32 overflow-hidden bg-zinc-900 text-white">
        {/* Imagen de fondo con overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/ofertas-bg.png" 
            alt="Ofertas Barefoot" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
        </div>

        <div className="container relative z-10 mx-auto px-4">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 border border-red-600/30 text-red-400 text-sm font-semibold mb-6 animate-pulse">
              <Percent className="w-4 h-4" />
              <span>Venta Exclusiva de Temporada</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-extrabold tracking-tighter mb-6 leading-[0.9]">
              <span className="block text-white">OFERTAS</span>
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-400">
                IRRESISTIBLES
              </span>
            </h1>
            <p className="text-xl text-zinc-300 mb-8 leading-relaxed max-w-xl font-medium">
              Siente la libertad en cada paso. Equípate con lo mejor del calzado barefoot a precios que no volverán. 
            </p>
            <div className="flex flex-wrap gap-8 text-sm font-bold uppercase tracking-widest text-zinc-400">
              <div className="flex items-center gap-2 border-l-2 border-red-600 pl-3">
                <Clock className="w-5 h-5 text-red-500" />
                <span>Tiempo limitado</span>
              </div>
              <div className="flex items-center gap-2 border-l-2 border-red-600 pl-3">
                <Tag className="w-5 h-5 text-red-500" />
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
