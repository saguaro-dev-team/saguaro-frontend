import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden min-h-[90vh] flex items-center justify-center bg-background">
      {/* Dynamic Background Image / Gradient */}
      <div className="absolute inset-0 z-0">
         <Image 
            src="/images/hero-bg.png"
            alt="Nature Background"
            fill
            className="object-cover opacity-60 transition-transform duration-1000"
            priority
         />
         {/* Logo Watermark */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] scale-150 pointer-events-none">
            <Image 
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/saguaro_logo-tE5gHhhbTqxTolGTB4D1n3QrzCEVf4.jpg"
                alt="Saguaro Watermark"
                width={800}
                height={800}
                className="grayscale"
            />
         </div>
         <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
         <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 lg:py-32 w-full">
        <div className="max-w-3xl animate-in slide-in-from-bottom-8 fade-in duration-1000 fill-mode-both">
          <span className="inline-block rounded-full bg-primary/20 border border-primary/50 px-4 py-1.5 text-sm font-medium text-primary mb-6 shadow-[0_0_15px_rgba(27,123,78,0.4)] backdrop-blur-md">
            ✨ Nueva Colección 2026
          </span>
          <h1 className="text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl md:text-7xl lg:text-8xl text-balance drop-shadow-lg">
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400 pb-2">Camina Natural</span>
            <span className="block text-foreground mt-2">Vive Libre</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground sm:max-w-xl md:text-xl text-pretty">
            Descubre nuestro calzado ergonómico diseñado para reconectar con el movimiento
            natural de tus pies y mejorar tu salud postural. Bienestar en cada paso.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 py-6 text-lg font-semibold shadow-[0_0_30px_-5px_rgba(27,123,78,0.6)] transition-all hover:scale-105"
              asChild
            >
              <Link href="/categoria/hombre">
                Explorar Colección
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full px-8 py-6 text-lg font-semibold border-white/20 hover:bg-white/5 backdrop-blur-sm transition-all hover:scale-105"
              asChild
            >
              <Link href="/nosotros">Conoce Saguaro</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Decorative floating elements */}
      <div className="absolute top-1/4 right-[10%] w-64 h-64 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-[10%] w-72 h-72 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
    </section>
  )
}
