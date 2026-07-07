'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { ShoppingBag, User, Menu, X, Search, ChevronDown, Ruler } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useCart } from '@/lib/cart-context'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { CartSheet } from './cart-sheet'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

const navigation = [
  { name: 'Inicio', href: '/' },
  {
    name: 'Hombre',
    href: '/categoria/hombre',
    submenu: [
      { name: 'Casuales', href: '/categoria/hombre?tipo=casuales' },
      { name: 'Deportivas', href: '/categoria/hombre?tipo=deportivas' },
      { name: 'Sandalias', href: '/categoria/hombre?tipo=sandalias' },
    ],
  },
  {
    name: 'Mujer',
    href: '/categoria/mujer',
    submenu: [
      { name: 'Casuales', href: '/categoria/mujer?tipo=casuales' },
      { name: 'Deportivas', href: '/categoria/mujer?tipo=deportivas' },
      { name: 'Sandalias', href: '/categoria/mujer?tipo=sandalias' },
    ],
  },
  {
    name: 'Niños',
    href: '/categoria/nino',
    submenu: [
      { name: 'Casuales', href: '/categoria/nino?tipo=casuales' },
      { name: 'Deportivas', href: '/categoria/nino?tipo=deportivas' },
      { name: 'Botas', href: '/categoria/nino?tipo=botas' },
    ],
  },
  { name: 'Ver Todo', href: '/categoria/todos' },
  { name: 'Ofertas', href: '/ofertas' },
  { name: 'Blog', href: '/blog' },
  { name: 'Guía de Tallas', href: '/guia-tallas' },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { itemCount, openCart } = useCart()
  const { isAuthenticated, isAdmin, user, logout } = useAuth()
  const router = useRouter()
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({})

  const toggleSubmenu = (name: string) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [name]: !prev[name]
    }))
  }

  useEffect(() => {
    setMounted(true)
    // Global cleanup for Radix UI pointer-events bug
    document.body.style.pointerEvents = 'auto'
  }, [])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setSearchOpen(false)
      router.push(`/buscar?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-white">
      {/* Top bar */}
      <div className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 py-2 text-center text-sm">
          Envio gratis en compras sobre $50.000 | Despacho a todo Chile
        </div>
      </div>

      <nav className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/images/saguarologo.png"
              alt="Saguaro Chile"
              width={200}
              height={60}
              className="h-14 w-auto object-contain"
              priority
            />


          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:gap-1">
            {navigation.map((item) =>
              item.submenu ? (
                <DropdownMenu key={item.name}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-1 text-foreground">
                      {item.name}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="start" 
                    sideOffset={8} 
                    className="w-56 p-2 z-[100] animate-in fade-in-0 zoom-in-95 duration-200"
                  >
                    <DropdownMenuItem asChild>
                      <Link href={item.href} className="font-medium">
                        Ver todo {item.name}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {item.submenu.map((subitem) => (
                      <DropdownMenuItem key={subitem.name} asChild>
                        <Link href={subitem.href}>{subitem.name}</Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button key={item.name} variant="ghost" asChild className="text-foreground">
                  <Link href={item.href}>{item.name}</Link>
                </Button>
              )
            )}
          </div>

          {/* Right side icons */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="hidden md:flex" onClick={() => setSearchOpen(true)}>
              <Search className="h-5 w-5" />
              <span className="sr-only">Buscar</span>
            </Button>

            {/* User menu */}
            {!mounted ? (
              <Button variant="ghost" className="gap-2 px-2 invisible">
                <User className="h-5 w-5" />
                <span className="hidden sm:inline font-medium">Cargando...</span>
              </Button>
            ) : isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 px-2">
                    <User className="h-5 w-5" />
                    <span className="hidden sm:inline font-medium">
                      {isAdmin ? 'Admin' : `Hola, ${user?.nombre}`}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  sideOffset={8}
                  className="w-56 p-2 z-[100] animate-in fade-in-0 zoom-in-95 duration-200"
                >
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user?.nombre} {user?.apellido}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/perfil">Mi Perfil</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/perfil?tab=pedidos">Mis Pedidos</Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin/productos" className="text-primary font-medium">
                          Panel de Administracion
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onSelect={async (e) => {
                      e.preventDefault();
                      logout();
                      router.push('/');
                    }} 
                    className="text-destructive"
                  >
                    Cerrar Sesion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" asChild className="gap-2 px-2">
                <Link href="/login">
                  <User className="h-5 w-5" />
                  <span className="hidden sm:inline font-medium">Iniciar sesión</span>
                </Link>
              </Button>
            )}

            {/* Cart */}
            <Button variant="ghost" size="icon" className="relative" onClick={openCart}>
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {itemCount}
                </span>
              )}
              <span className="sr-only">Carrito</span>
            </Button>

            {/* Mobile menu button */}
            <div className="flex items-center lg:hidden">
              <Button variant="ghost" size="icon" className="mr-2" onClick={() => setSearchOpen(true)}>
                <Search className="h-5 w-5" />
                <span className="sr-only">Buscar</span>
              </Button>
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative hover:bg-muted/50 rounded-full">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Menú</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[310px] sm:w-[380px] p-0 flex flex-col justify-between bg-white border-l shadow-2xl">
                  <SheetHeader className="sr-only">
                    <SheetTitle>Menú de Navegación Móvil</SheetTitle>
                    <SheetDescription>Accede a las distintas categorías y secciones de la tienda Saguaro Barefoot Chile.</SheetDescription>
                  </SheetHeader>

                  {/* Header visual con Logo */}
                  <div className="p-5 border-b flex items-center justify-between bg-muted/20">
                    <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
                      <Image
                        src="/images/saguarologo.png"
                        alt="Saguaro Chile"
                        width={130}
                        height={40}
                        className="h-10 w-auto object-contain"
                      />
                    </Link>
                  </div>

                  {/* Links de navegación con scrollable area */}
                  <div className="flex-1 overflow-y-auto px-5 py-4">
                    <nav className="flex flex-col gap-1">
                      {navigation.map((item) => {
                        const hasSubmenu = !!item.submenu;
                        const isSubmenuOpen = !!openSubmenus[item.name];

                        return (
                          <div key={item.name} className="border-b border-border/40 last:border-0 py-2">
                            {hasSubmenu ? (
                              <div>
                                <button
                                  onClick={() => toggleSubmenu(item.name)}
                                  className="w-full flex items-center justify-between py-2 text-base font-semibold text-foreground hover:text-primary transition-colors text-left"
                                >
                                  <span>{item.name}</span>
                                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ${isSubmenuOpen ? 'rotate-180 text-primary' : ''}`} />
                                </button>
                                
                                {/* Contenedor animado de submenús */}
                                <div className={`grid transition-all duration-300 ease-in-out ${isSubmenuOpen ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0 pointer-events-none'}`}>
                                  <div className="overflow-hidden">
                                    <div className="pl-4 pb-2 flex flex-col gap-2 border-l-2 border-primary/20">
                                      <Link
                                        href={item.href}
                                        className="text-sm font-medium text-foreground/80 hover:text-primary py-1"
                                        onClick={() => setMobileMenuOpen(false)}
                                      >
                                        Ver todo {item.name}
                                      </Link>
                                      {item.submenu!.map((subitem) => (
                                        <Link
                                          key={subitem.name}
                                          href={subitem.href}
                                          className="text-sm text-muted-foreground hover:text-primary py-1 transition-colors"
                                          onClick={() => setMobileMenuOpen(false)}
                                        >
                                          {subitem.name}
                                        </Link>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <Link
                                href={item.href}
                                className="flex items-center justify-between py-2 text-base font-semibold text-foreground hover:text-primary transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                <span>{item.name}</span>
                                {item.name === 'Ofertas' && (
                                  <span className="bg-destructive/10 text-destructive text-xs font-semibold px-2 py-0.5 rounded-full animate-pulse">
                                    ¡Sale!
                                  </span>
                                )}
                              </Link>
                            )}
                          </div>
                        );
                      })}
                    </nav>
                  </div>

                  {/* Pie de página con login/perfil */}
                  <div className="p-5 border-t bg-muted/30">
                    {isAuthenticated ? (
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {user?.nombre?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{user?.nombre} {user?.apellido}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[180px]">{user?.email}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <Button variant="outline" size="sm" asChild className="rounded-full">
                            <Link href="/perfil" onClick={() => setMobileMenuOpen(false)}>Mi Perfil</Link>
                          </Button>
                          <Button variant="default" size="sm" onClick={() => { logout(); setMobileMenuOpen(false); router.push('/'); }} className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Cerrar Sesión
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button className="w-full rounded-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2 py-5 font-semibold" asChild>
                        <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                          <User className="h-4 w-4" />
                          Iniciar Sesión
                        </Link>
                      </Button>
                    )}
                    <p className="text-center text-[10px] text-muted-foreground mt-4">
                      Saguaro Chile © 2026 | Envío a todo el país
                    </p>
                  </div>
                </SheetContent>
              </Sheet>
          </div>
          </div>
        </div>
      </nav>

      <CartSheet />

      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Buscar Productos</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSearchSubmit} className="mt-4 flex items-center gap-2">
            <Input 
              autoFocus
              placeholder="Ej: Zero drop, Running..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">Buscar</Button>
          </form>
        </DialogContent>
      </Dialog>
    </header>
  )
}
