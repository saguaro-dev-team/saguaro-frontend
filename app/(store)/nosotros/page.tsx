import Image from 'next/image'
import { Heart, Globe, Shield, Users, Zap, Leaf, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function NosotrosPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <Image 
          src="https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&q=80&w=2000"
          alt="Saguaro Outdoor"
          fill
          className="object-cover brightness-[0.4]"
          priority
        />
        <div className="relative z-10 text-center px-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <Badge className="mb-6 bg-primary/80 backdrop-blur-sm text-primary-foreground border-none px-4 py-1.5 text-sm uppercase tracking-widest">
            Nuestra Historia
          </Badge>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic drop-shadow-lg">
            Saguaro Chile
          </h1>
          <p className="mt-6 text-xl md:text-2xl text-white/90 max-w-2xl mx-auto font-medium drop-shadow-md">
            Descalzarse y disfrutar de una vida sin límites.
          </p>
        </div>
      </section>

      {/* Section 1: La Inspiración del Saguaro */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1 relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
            <Image 
              src="/images/nosotros-cactus.png"
              alt="Cactus Saguaro en el desierto"
              fill
              className="object-cover hover:scale-105 transition-transform duration-700"
            />
          </div>
          <div className="order-1 lg:order-2 space-y-6">
            <Badge variant="outline" className="text-primary border-primary">Nuestra Inspiración</Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              La Resiliencia del Desierto
            </h2>
            <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
              <p>
                El cactus SAGUARO, que crece en el desierto, no teme a los obstáculos ambientales y utiliza la mínima cantidad de agua para lograr un impacto ilimitado. 
              </p>
              <p>
                Somos un grupo de profesionales del calzado barefoot apasionados por la vida al aire libre. La resiliencia del Saguaro nos inspiró mientras explorábamos el desierto, y se convirtió en la creencia central de nuestra marca. Nuestro objetivo es que todos puedan descalzarse y disfrutar de una vida sin límites.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Diseño Centrado en Todos */}
      <section className="py-24 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <Badge variant="outline" className="text-primary border-primary">Desarrollo Iterativo</Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Diseñado para CADA etapa de la vida
            </h2>
            <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
              <p>
                Desde los primeros pasos de un niño hasta las caminatas diarias de un adulto, y desde las aventuras de los entusiastas del outdoor hasta la rehabilitación de deportistas en recuperación, diseñamos nuestros productos pensando en todos.
              </p>
              <p>
                Escuchamos activamente los comentarios de nuestros usuarios y modificamos iterativamente nuestros diseños junto a expertos biomecánicos para asegurar la máxima comodidad. Pulimos cada detalle repetidamente hasta lograr la satisfacción real de TODOS nuestros clientes.
              </p>
            </div>
            <ul className="space-y-3 pt-4">
              {[
                'Desarrollo infantil saludable',
                'Comodidad para el día a día',
                'Rendimiento en el deporte',
                'Apoyo en rehabilitación'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-foreground font-medium">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
            <Image 
              src="/images/nosotros-nino.png"
              alt="Niño caminando con calzado respetuoso"
              fill
              className="object-cover hover:scale-105 transition-transform duration-700"
            />

          </div>
        </div>
      </section>

      {/* Section 3: Feedback que nos motiva */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1 relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
            <Image 
              src="/images/nosotros-shoe.png"
              alt="Zapatilla Barefoot de cerca"
              fill
              className="object-cover hover:scale-105 transition-transform duration-700"
            />
          </div>
          <div className="order-1 lg:order-2 space-y-6">
            <Badge variant="outline" className="text-primary border-primary">Experiencia Saguaro</Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Comentarios que nos Impulsan
            </h2>
            <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
              <p>
                Nuestros usuarios nos cuentan constantemente que no sienten el peso en las plantas de sus pies, y simplemente no quieren quitarse el calzado al final del día.
              </p>
              <p>
                Muchos padres están encantados de ver a sus hijos desarrollar un andar sano y natural. También recibimos valiosos reportes de atletas en recuperación que experimentan resultados increíbles al reconectar la musculatura de sus pies. 
              </p>
              <p className="font-semibold text-foreground border-l-4 border-primary pl-4 italic">
                Esta retroalimentación constante es el motor que nos motiva a llevar la experiencia del movimiento natural a cada rincón.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Expansión Global */}
      <section className="py-24 px-4 bg-primary text-primary-foreground overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Sin Fronteras, Sin Límites
            </h2>
            <div className="space-y-4 text-lg text-primary-foreground/90 leading-relaxed">
              <p>
                Nos centramos en el modelo de ventas en línea para romper barreras geográficas y zonas horarias, ofreciendo calzado de alta calidad a un precio accesible a todo el público.
              </p>
              <p>
                Nuestras ventas comenzaron en Europa y hoy nos hemos expandido por todo el mundo: Estados Unidos, Canadá, Reino Unido, Australia, Nueva Zelanda y toda Asia. 
              </p>
              <p className="font-bold">
                ¡Ahora presentes en Chile para revolucionar la forma en que caminas!
              </p>
            </div>
          </div>
          <div className="relative aspect-video rounded-3xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 p-8 flex items-center justify-center shadow-[0_0_50px_-12px_rgba(255,255,255,0.2)]">
            {/* Animated Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-white/10 animate-pulse" />
            
            {/* World Map Concept with better contrast */}
            <Globe className="w-full h-full text-white/20 animate-[spin_60s_linear_infinite]" strokeWidth={0.5} />
            
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-wrap justify-center gap-3 px-8">
                    {[
                      { text: '🇪🇺 Europa', delay: '0s' },
                      { text: '🇺🇸 EE.UU', delay: '0.1s' },
                      { text: '🇨🇦 Canadá', delay: '0.2s' },
                      { text: '🇬🇧 Reino Unido', delay: '0.3s' },
                      { text: '🇦🇺 Australia', delay: '0.4s' },
                      { text: '🇯🇵 Japón', delay: '0.5s' },
                      { text: '🇨🇱 CHILE', delay: '0.6s', highlight: true }
                    ].map((region, i) => (
                        <span 
                          key={i} 
                          className={`
                            px-4 py-2 rounded-full font-bold text-sm shadow-2xl transition-all hover:scale-110 
                            ${region.highlight 
                              ? 'bg-white text-primary ring-4 ring-primary/20 scale-110 z-10' 
                              : 'bg-zinc-900/80 text-white border border-white/10'}
                          `}
                          style={{ animationDelay: region.delay }}
                        >
                            {region.text}
                        </span>
                    ))}
                </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  )
}

