'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingCart, 
  BarChart3, 
  Settings,
  LogOut,
  Menu,
  X,
  FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/lib/auth-context'
import { useState } from 'react'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Productos', href: '/admin/productos', icon: Package },
  { name: 'Pedidos', href: '/admin/pedidos', icon: ShoppingCart },
  { name: 'Clientes', href: '/admin/clientes', icon: Users },
  { name: 'Blog', href: '/admin/blog', icon: FileText },
  { name: 'Reportes', href: '/admin/reportes', icon: BarChart3 },
  { name: 'Configuracion', href: '/admin/configuracion', icon: Settings },
]

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isAuthenticated, isAdmin, user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      router.push('/login')
    }
  }, [isAuthenticated, isAdmin, router])

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sidebar">
        <p className="text-sidebar-foreground">Verificando permisos...</p>
      </div>
    )
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-4">
        <Link href="/admin" className="flex items-center gap-2">
          <Image
            src="/images/saguarologo.png"
            alt="Saguaro"
            width={40}
            height={40}
            className="h-10 w-auto object-contain rounded-lg"
          />

          <div>
            <span className="font-bold text-sidebar-foreground">Saguaro</span>
            <span className="block text-xs text-sidebar-foreground/60">Panel Admin</span>
          </div>
        </Link>
      </div>

      <Separator className="bg-sidebar-border" />

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </Link>
        ))}
      </nav>

      <Separator className="bg-sidebar-border" />

      {/* User section */}
      <div className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-sidebar-accent flex items-center justify-center">
            <span className="text-sm font-medium text-sidebar-foreground">
              {user?.nombre?.[0]}{user?.apellido?.[0]}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-sidebar-foreground">
              {user?.nombre} {user?.apellido}
            </p>
            <p className="text-xs text-sidebar-foreground/60">{user?.email}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
            asChild
          >
            <Link href="/">Ver Tienda</Link>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-sidebar-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
          </Button>

        </div>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-sidebar">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-sidebar-border bg-sidebar px-4 lg:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-sidebar-foreground">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 bg-sidebar border-sidebar-border">
            <SidebarContent />
          </SheetContent>
        </Sheet>

        <Link href="/admin" className="flex items-center gap-2">
          <Image
            src="/images/saguarologo.png"
            alt="Saguaro"
            width={32}
            height={32}
            className="h-8 w-auto object-contain rounded-lg"
          />

          <span className="font-bold text-sidebar-foreground">Admin</span>
        </Link>
      </header>

      {/* Main content */}
      <main className="lg:pl-64">
        <div className="min-h-screen bg-background">
          {children}
        </div>
      </main>
    </div>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminLayoutContent>{children}</AdminLayoutContent>
  )
}
