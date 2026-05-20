'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { ShoppingBag, User, Menu, X, Search, ChevronDown, Ruler } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
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
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
                    <Link href="/pedidos">Mis Pedidos</Link>
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
                    onSelect={(e) => {
                      e.preventDefault();
                      logout();
                      window.location.href = '/';
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
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Menu</span>
                  </Button>
                </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col gap-4 mt-8">
                  {navigation.map((item) => (
                    <div key={item.name} className="py-2">
                      <Link
                        href={item.href}
                        className="text-lg font-semibold hover:text-primary transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                      {item.submenu && (
                        <div className="ml-4 mt-2 flex flex-col gap-2">
                          {item.submenu.map((subitem) => (
                            <Link
                              key={subitem.name}
                              href={subitem.href}
                              className="text-muted-foreground hover:text-primary"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              {subitem.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </nav>
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
