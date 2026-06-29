import Link from 'next/link'
import Image from 'next/image'
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

const footerLinks = {
  tienda: [
    { name: 'Hombre', href: '/categoria/hombre' },
    { name: 'Mujer', href: '/categoria/mujer' },
    { name: 'Niños', href: '/categoria/nino' },
    { name: 'Ofertas', href: '/ofertas' },
    { name: 'Nuevos', href: '/nuevos' },
  ],
  ayuda: [
    { name: 'Guía de Tallas', href: '/guia-tallas' },
    { name: 'Envíos', href: '/envios' },
    { name: 'Devoluciones', href: '/devoluciones' },
    { name: 'Preguntas Frecuentes', href: '/faq' },
    { name: 'Contacto', href: '/contacto' },
  ],
  empresa: [
    { name: 'Sobre Nosotros', href: '/nosotros' },
    { name: 'Blog', href: '/blog' },
    { name: 'Trabaja con Nosotros', href: '/contacto' },
    { name: 'Términos y Condiciones', href: '/terminos' },
    { name: 'Política de Privacidad', href: '/privacidad' },
  ],
}

const socialLinks = [
  { name: 'Facebook', href: 'https://facebook.com/saguarochile', icon: Facebook },
  { name: 'Instagram', href: 'https://instagram.com/saguarochile', icon: Instagram },
  { name: 'Youtube', href: 'https://youtube.com/saguarochile', icon: Youtube },
]

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Image
              src="/images/saguarologo-footer.webp"
              alt="Saguaro"
              width={200}
              height={250}
              className="h-32 w-auto object-contain"
            />

            <p className="mt-4 max-w-xs text-sm text-background/80">
              Calzado barefoot de alta calidad para toda la familia. Reconecta con el
              movimiento natural de tus pies.
            </p>

            <div className="mt-6 flex flex-col gap-3 text-sm">
              <a
                href="mailto:chilesaguaro@outlook.com"
                className="flex items-center gap-2 hover:text-primary"
              >
                <Mail className="h-4 w-4" />
                chilesaguaro@outlook.com
              </a>
              <a
                href="tel:+56912345678"
                className="flex items-center gap-2 hover:text-primary"
              >
                <Phone className="h-4 w-4" />
                +56 9 1234 5678
              </a>
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Santiago, Chile
              </p>
            </div>

            <div className="mt-6 flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-background/10 hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <social.icon className="h-5 w-5" />
                  <span className="sr-only">{social.name}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold">Tienda</h3>
            <ul className="mt-4 flex flex-col gap-2">
              {footerLinks.tienda.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-background/70 hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold">Ayuda</h3>
            <ul className="mt-4 flex flex-col gap-2">
              {footerLinks.ayuda.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-background/70 hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold">Empresa</h3>
            <ul className="mt-4 flex flex-col gap-2">
              {footerLinks.empresa.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-background/70 hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8 bg-background/20" />

        <div className="flex flex-col items-center justify-between gap-4 text-sm text-background/60 md:flex-row">
          <p>&copy; {new Date().getFullYear()} Saguaro Chile. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4">
            <span>Métodos de pago:</span>
            <div className="flex gap-2">
              <span className="rounded bg-background/10 px-2 py-1 text-xs">Webpay</span>
              <span className="rounded bg-background/10 px-2 py-1 text-xs">Transferencia</span>
              <span className="rounded bg-background/10 px-2 py-1 text-xs">Mercado Pago</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
