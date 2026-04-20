import { HeroSection } from '@/components/store/hero-section'
import { CategoriesSection } from '@/components/store/categories-section'
import { FeaturedProducts } from '@/components/store/featured-products'
import { BenefitsSection } from '@/components/store/benefits-section'
import { NewsletterSection } from '@/components/store/newsletter-section'
import { newProducts, discountedProducts } from '@/lib/store-data'
import { ProductCard } from '@/components/store/product-card'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <BenefitsSection />
      <CategoriesSection />
      <FeaturedProducts />

      {/* New Arrivals Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
                Recien Llegados
              </h2>
              <p className="mt-2 text-lg text-muted-foreground">
                Los ultimos modelos de la temporada
              </p>
            </div>
            <Button variant="ghost" asChild className="hidden sm:flex">
              <Link href="/nuevos">
                Ver todos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {newProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Offers Section */}
      {discountedProducts.length > 0 && (
        <section className="py-16 px-4">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="inline-block rounded-full bg-destructive/10 px-3 py-1 text-sm font-medium text-destructive mb-2">
                  Ofertas Limitadas
                </span>
                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
                  Aprovecha los Descuentos
                </h2>
                <p className="mt-2 text-lg text-muted-foreground">
                  Productos seleccionados con precios especiales
                </p>
              </div>
              <Button variant="ghost" asChild className="hidden sm:flex">
                <Link href="/ofertas">
                  Ver todas las ofertas
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
              {discountedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* About Barefoot Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-4">
                Por que Barefoot?
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
                Beneficios del Calzado Barefoot
              </h2>
              <p className="mt-4 text-muted-foreground text-pretty">
                El calzado barefoot esta disenado para permitir que tus pies se muevan
                de forma natural, como si estuvieras descalzo pero con la proteccion
                necesaria.
              </p>

              <ul className="mt-8 space-y-4">
                {[
                  {
                    title: 'Fortalece tus pies',
                    description:
                      'Permite que los musculos del pie trabajen naturalmente, fortaleciendolos con el tiempo.',
                  },
                  {
                    title: 'Mejor equilibrio',
                    description:
                      'La suela fina mejora la propiocepcion y tu conexion con el suelo.',
                  },
                  {
                    title: 'Postura natural',
                    description:
                      'El zero drop favorece una alineacion correcta de todo tu cuerpo.',
                  },
                  {
                    title: 'Comodidad todo el dia',
                    description:
                      'La puntera ancha permite que tus dedos se extiendan naturalmente.',
                  },
                ].map((benefit) => (
                  <li key={benefit.title} className="flex gap-4">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                      ✓
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{benefit.title}</h3>
                      <p className="text-sm text-muted-foreground">{benefit.description}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <Button className="mt-8" asChild>
                <Link href="/nosotros">
                  Conoce mas sobre Saguaro
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="relative aspect-square rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <div className="text-center text-primary-foreground p-8">
                <div className="text-6xl font-bold">5mm</div>
                <div className="mt-2 text-xl">Suela ultrafina</div>
                <div className="mt-6 text-primary-foreground/80">
                  Siente cada paso mientras proteges tus pies
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <NewsletterSection />
    </>
  )
}
