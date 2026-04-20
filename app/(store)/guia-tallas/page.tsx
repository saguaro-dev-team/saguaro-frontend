import { Ruler, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function GuiaTallasPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:py-24 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl mb-4">
          Guia de <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">Tallas</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Encuentra la talla perfecta para ti. El calzado barefoot debe tener un espacio extra (0.5 a 1.2 cm) para que tus dedos se muevan libremente.
        </p>
      </div>

      <div className="bg-card border border-border/50 rounded-2xl shadow-[0_0_30px_-5px_rgba(27,123,78,0.1)] overflow-hidden mb-12 backdrop-blur-sm">
        <div className="p-6 sm:p-8 bg-muted/30 border-b border-border/50 flex items-center gap-3">
          <Ruler className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Adultos (Unisex)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 text-muted-foreground text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold border-b border-border/50">Talla EUR</th>
                <th className="p-4 font-semibold border-b border-border/50">Largo del pie (cm)</th>
                <th className="p-4 font-semibold border-b border-border/50 text-primary">Largo Plantilla (cm)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {[
                { eur: "36", pie: "22.0 - 22.5", plantilla: "23.5" },
                { eur: "37", pie: "22.6 - 23.0", plantilla: "24.0" },
                { eur: "38", pie: "23.1 - 23.8", plantilla: "24.8" },
                { eur: "39", pie: "23.9 - 24.5", plantilla: "25.5" },
                { eur: "40", pie: "24.6 - 25.0", plantilla: "26.0" },
                { eur: "41", pie: "25.1 - 25.8", plantilla: "26.8" },
                { eur: "42", pie: "25.9 - 26.5", plantilla: "27.5" },
                { eur: "43", pie: "26.6 - 27.0", plantilla: "28.0" },
                { eur: "44", pie: "27.1 - 27.8", plantilla: "28.8" },
              ].map((row) => (
                <tr key={row.eur} className="hover:bg-muted/20 transition-colors">
                  <td className="p-4 font-semibold text-foreground text-lg">{row.eur}</td>
                  <td className="p-4 text-muted-foreground">{row.pie} cm</td>
                  <td className="p-4 text-primary font-bold">{row.plantilla} cm</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 sm:p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Ruler className="h-24 w-24 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            ¿Como medirse?
          </h3>
          <ol className="list-decimal list-inside space-y-3 text-muted-foreground relative z-10">
            <li>Coloca una hoja de papel en el suelo, contra una pared.</li>
            <li>Párate sobre la hoja con el talón pegado a la pared.</li>
            <li>Marca hasta donde llega tu dedo más largo.</li>
            <li>Mide la distancia desde el borde hasta la marca.</li>
          </ol>
        </div>

        <div className="bg-card border border-border/50 rounded-2xl p-6 sm:p-8 flex flex-col justify-center items-center text-center shadow-lg">
          <h3 className="text-xl font-bold mb-3">¿Aún tienes dudas?</h3>
          <p className="text-muted-foreground mb-6">
            Si estás entre dos tallas, te recomendamos elegir la más grande. El calzado barefoot debe ser espacioso.
          </p>
          <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/30" asChild>
            <Link href="/contacto">Contactar Soporte</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
