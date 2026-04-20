'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { User, Package, MapPin, CreditCard, Settings, LogOut, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth-context'
import { getUserAddresses, addAddress, updateUserProfile, getUserProfile } from '@/app/actions/profile'

// Mock orders data
const mockOrders = [
  {
    id: 'SAG-12345678',
    fecha: '2024-03-15',
    total: 109980,
    estado: 'Entregado',
    items: 2,
  },
  {
    id: 'SAG-12345679',
    fecha: '2024-03-01',
    total: 54990,
    estado: 'Enviado',
    items: 1,
  },
]

export default function ProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated, logout, updateUser } = useAuth()
  
  const [formData, setFormData] = useState({
    nombre: user?.nombre || '',
    apellido: user?.apellido || '',
    email: user?.email || '',
    rut: '',
    telefono: '',
    genero: '',
    fecha_nacimiento: ''
  })
  
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: ''
  })
  
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState('')

  // Direcciones State
  const [direcciones, setDirecciones] = useState<any[]>([])
  const [isAddingAddress, setIsAddingAddress] = useState(false)
  const [newAddress, setNewAddress] = useState({ calle: '', numero: '', comuna: '', region: '', detalles: '' })
  const [addressLoading, setAddressLoading] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    } else if (user) {
      getUserAddresses(user.id).then((res) => {
        if (res.success && res.direcciones) {
          setDirecciones(res.direcciones)
        }
      })
      getUserProfile(user.id).then((res) => {
        if (res.success && res.profile) {
          setFormData(prev => ({
            ...prev,
            rut: res.profile.rut || '',
            telefono: res.profile.telefono || '',
            genero: res.profile.genero || '',
            fecha_nacimiento: res.profile.fecha_nacimiento ? new Date(res.profile.fecha_nacimiento).toISOString().split('T')[0] : ''
          }))
        }
      })
    }
  }, [isAuthenticated, user, router])

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setAddressLoading(true)
    const res = await addAddress({
      userId: user.id,
      calle: newAddress.calle,
      numero: newAddress.numero,
      comuna: newAddress.comuna,
      region: newAddress.region,
      detalles: newAddress.detalles
    })
    
    if (res.success && res.direccion) {
      setDirecciones([res.direccion, ...direcciones])
      setIsAddingAddress(false)
      setNewAddress({ calle: '', numero: '', comuna: '', region: '', detalles: '' })
    }
    setAddressLoading(false)
  }

  if (!isAuthenticated) {
    return null
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setSaveSuccess(false)
    setSaveError('')
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value })
    setSaveSuccess(false)
    setSaveError('')
  }

  const handleSave = async () => {
    if (!user) return
    setIsSaving(true)
    setSaveSuccess(false)
    setSaveError('')
    
    const res = await updateUserProfile({
      userId: user.id,
      nombre: formData.nombre,
      apellido: formData.apellido,
      telefono: formData.telefono,
      genero: formData.genero,
      fecha_nacimiento: formData.fecha_nacimiento,
      currentPassword: passwords.currentPassword,
      newPassword: passwords.newPassword
    })
    
    if (res.success) {
      updateUser({ nombre: formData.nombre, apellido: formData.apellido })
      setSaveSuccess(true)
      setPasswords({ currentPassword: '', newPassword: '' })
    } else {
      setSaveError(res.error || 'Error al guardar los datos')
    }
    
    setIsSaving(false)
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Entregado':
        return 'bg-green-100 text-green-800'
      case 'Enviado':
        return 'bg-blue-100 text-blue-800'
      case 'Preparando':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-7xl px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-primary">Inicio</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">Mi Perfil</span>
        </nav>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Mi Perfil</h1>
            <p className="text-muted-foreground">Administra tu cuenta y revisa tus pedidos</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar Sesion
          </Button>
        </div>

        <Tabs defaultValue="datos" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="datos" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Datos</span>
            </TabsTrigger>
            <TabsTrigger value="pedidos" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Pedidos</span>
            </TabsTrigger>
            <TabsTrigger value="direcciones" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Direcciones</span>
            </TabsTrigger>
          </TabsList>

          {/* Datos Personales */}
          <TabsContent value="datos">
            <Card>
              <CardHeader>
                <CardTitle>Datos Personales</CardTitle>
                <CardDescription>
                  Actualiza tu informacion personal
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {saveSuccess && (
                  <div className="rounded-lg bg-green-100 p-3 text-sm text-green-800">
                    Datos actualizados correctamente
                  </div>
                )}
                {saveError && (
                  <div className="rounded-lg bg-red-100 p-3 text-sm text-red-800">
                    {saveError}
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apellido">Apellido</Label>
                    <Input
                      id="apellido"
                      name="apellido"
                      value={formData.apellido}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rut">RUT</Label>
                    <Input
                      id="rut"
                      name="rut"
                      value={formData.rut}
                      disabled
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
                    <Input
                      id="fecha_nacimiento"
                      name="fecha_nacimiento"
                      type="date"
                      value={formData.fecha_nacimiento}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="genero">Género</Label>
                    <Select value={formData.genero} onValueChange={(val) => {
                      setFormData({ ...formData, genero: val })
                      setSaveSuccess(false)
                      setSaveError('')
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="masculino">Masculino</SelectItem>
                        <SelectItem value="femenino">Femenino</SelectItem>
                        <SelectItem value="otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-2">Cambiar Contraseña</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Deja los campos en blanco si no deseas cambiar tu contraseña
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Contraseña Actual</Label>
                      <Input id="currentPassword" name="currentPassword" type="password" value={passwords.currentPassword} onChange={handlePasswordChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Nueva Contraseña</Label>
                      <Input id="newPassword" name="newPassword" type="password" value={passwords.newPassword} onChange={handlePasswordChange} />
                    </div>
                  </div>
                </div>

                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pedidos */}
          <TabsContent value="pedidos">
            <Card>
              <CardHeader>
                <CardTitle>Mis Pedidos</CardTitle>
                <CardDescription>
                  Revisa el estado de tus compras
                </CardDescription>
              </CardHeader>
              <CardContent>
                {mockOrders.length > 0 ? (
                  <div className="space-y-4">
                    {mockOrders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div className="space-y-1">
                          <p className="font-medium font-mono">{order.id}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.fecha).toLocaleDateString('es-CL')} | {order.items}{' '}
                            {order.items === 1 ? 'producto' : 'productos'}
                          </p>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="font-medium">{formatPrice(order.total)}</p>
                          <Badge className={getStatusColor(order.estado)}>
                            {order.estado}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Aun no tienes pedidos</p>
                    <Button className="mt-4" asChild>
                      <Link href="/categoria/hombre">Explorar Productos</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Direcciones */}
          <TabsContent value="direcciones">
            <Card>
              <CardHeader>
                <CardTitle>Mis Direcciones</CardTitle>
                <CardDescription>
                  Administra tus direcciones de envio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {direcciones.length === 0 && !isAddingAddress && (
                    <div className="text-center py-6">
                      <MapPin className="h-10 w-10 mx-auto text-muted-foreground mb-3 opacity-50" />
                      <p className="text-muted-foreground">No tienes direcciones guardadas</p>
                    </div>
                  )}

                  {direcciones.map((dir, idx) => (
                    <div key={dir.id_direccion} className="rounded-lg border p-4 bg-muted/20">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{dir.calle} {dir.numero}</h3>
                            {idx === 0 && <Badge variant="secondary">Principal</Badge>}
                          </div>
                          {dir.detalles && (
                            <p className="text-sm text-muted-foreground">
                              {dir.detalles}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground">
                            {dir.comuna}, {dir.region}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {isAddingAddress ? (
                    <form onSubmit={handleSaveAddress} className="rounded-lg border p-4 space-y-4 bg-muted/10">
                      <h3 className="font-medium text-lg">Nueva Dirección</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="calle">Calle</Label>
                          <Input required id="calle" value={newAddress.calle} onChange={(e) => setNewAddress({...newAddress, calle: e.target.value})} placeholder="Ej. Av. Providencia" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="numero">Número</Label>
                          <Input required id="numero" value={newAddress.numero} onChange={(e) => setNewAddress({...newAddress, numero: e.target.value})} placeholder="1234" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="detalles">Detalles (Depto, block, indicaciones)</Label>
                        <Input id="detalles" value={newAddress.detalles} onChange={(e) => setNewAddress({...newAddress, detalles: e.target.value})} placeholder="Depto 402, Torre B..." />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="comuna">Comuna</Label>
                          <Input required id="comuna" value={newAddress.comuna} onChange={(e) => setNewAddress({...newAddress, comuna: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="region">Región</Label>
                          <Input required id="region" value={newAddress.region} onChange={(e) => setNewAddress({...newAddress, region: e.target.value})} />
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => setIsAddingAddress(false)}>Cancelar</Button>
                        <Button type="submit" disabled={addressLoading}>
                          {addressLoading ? 'Guardando...' : 'Guardar Dirección'}
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <Button variant="outline" className="w-full border-dashed py-8" onClick={() => setIsAddingAddress(true)}>
                      <MapPin className="h-4 w-4 mr-2" />
                      Agregar Nueva Dirección
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
