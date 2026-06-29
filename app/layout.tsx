import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/lib/auth-context'
import { Toaster } from '@/components/ui/toaster'
import { RadixCleanup } from '@/components/radix-cleanup'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Saguaro Barefoot Chile - Calzado Ergonómico',
  description: 'Tienda oficial de calzado barefoot y ergonómico en Chile. Descubre comodidad natural para hombre, mujer y niños.',
  keywords: ['barefoot', 'calzado ergonomico', 'zapatos naturales', 'saguaro', 'chile'],
  icons: {
    icon: '/images/saguarologo-footer.webp',
    apple: '/images/saguarologo-footer.webp',
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
          <RadixCleanup />
          {children}
          <Toaster />
        </AuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
