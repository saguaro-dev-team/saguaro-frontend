import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/lib/auth-context'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Saguaro Barefoot Chile - Calzado Ergonómico',
  description: 'Tienda oficial de calzado barefoot y ergonómico en Chile. Descubre comodidad natural para hombre, mujer y niños.',
  keywords: ['barefoot', 'calzado ergonomico', 'zapatos naturales', 'saguaro', 'chile'],
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#1B7B4E',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="light">
      <body className="font-sans antialiased bg-background text-foreground">
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
        <script dangerouslySetInnerHTML={{__html: `
          // Radix UI modal cleanup patch - limpia overlays atascados en cualquier navegacion
          function cleanupRadix() {
            document.body.style.pointerEvents = 'auto';
            document.body.style.overflow = '';
            document.body.removeAttribute('data-scroll-locked');
            document.body.removeAttribute('inert');
            document.documentElement.removeAttribute('data-scroll-locked');
            document.querySelectorAll(
              '[data-slot="dialog-overlay"], [data-slot="sheet-overlay"], [data-slot="dialog-portal"], [data-slot="sheet-portal"], [data-radix-focus-guard], [class*="DialogOverlay"], [class*="SheetOverlay"], [vaul-overlay]'
            ).forEach(function(el) { el.remove(); });
          }
          // Ejecutar al cargar
          cleanupRadix();
          // Monitorear cambios de ruta
          let lastPath = window.location.pathname;
          setInterval(function() {
            if (lastPath !== window.location.pathname) {
              lastPath = window.location.pathname;
              cleanupRadix();
              setTimeout(cleanupRadix, 100);
              setTimeout(cleanupRadix, 300);
              setTimeout(cleanupRadix, 600);
            }
          }, 50);
          // Monitorear cambios del body con MutationObserver
          var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(m) {
              if (m.type === 'attributes' && m.attributeName === 'data-scroll-locked' && document.body.hasAttribute('data-scroll-locked')) {
                setTimeout(function() {
                  if (document.body.hasAttribute('data-scroll-locked') && !document.querySelector('[data-radix-dialog-content], [data-radix-sheet-content], [data-state="open"]')) {
                    cleanupRadix();
                  }
                }, 500);
              }
            });
          });
          observer.observe(document.body, { attributes: true, attributeFilter: ['data-scroll-locked'] });
        `}} />
      </body>
    </html>
  )
}
