'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { User, Package, MapPin, CreditCard, Settings, LogOut, ChevronRight, Truck } from 'lucide-react'
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
import { getRegiones } from '@/app/actions/location'
import { getUserOrders } from '@/app/actions/orders'

// We will use real orders now

export default function ProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated, logout, updateUser } = useAuth()
  
  const [formData, setFormData] = useState({
    nombres: user?.nombre || '',
    primer_apellido: user?.apellido || '',
    segundo_apellido: '',
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
  const [realOrders, setRealOrders] = useState<any[]>([])

  // Direcciones State
  const [direcciones, setDirecciones] = useState<any[]>([])
  const [isAddingAddress, setIsAddingAddress] = useState(false)
  const [newAddress, setNewAddress] = useState({ calle: '', numero: '', id_comuna: 0, detalles: '' })
  const [addressLoading, setAddressLoading] = useState(false)
  const [regionesData, setRegionesData] = useState<any[]>([])
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null)

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
            nombres: res.profile.nombres || '',
            primer_apellido: res.profile.primer_apellido || '',
            segundo_apellido: res.profile.segundo_apellido || '',
            rut: res.profile.rut || '',
            telefono: res.profile.telefono || '',
            genero: res.profile.genero || '',
            fecha_nacimiento: res.profile.fecha_nacimiento ? new Date(res.profile.fecha_nacimiento).toISOString().split('T')[0] : ''
          }))
        }
      })
      getRegiones().then(res => {
        if (res.success && res.regiones) {
          setRegionesData(res.regiones)
        }
      })
      getUserOrders(user.id).then(res => {
        if (res.success && res.orders) {
          setRealOrders(res.orders)
        }
      })
    }
  }, [isAuthenticated, user, router])

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || newAddress.id_comuna === 0) return
    setAddressLoading(true)
    const res = await addAddress({
      userId: user.id,
      calle: newAddress.calle,
      numero: newAddress.numero,
      id_comuna: newAddress.id_comuna,
      detalles: newAddress.detalles
    })
    
    if (res.success && res.direccion) {
      const comunaData = regionesData.find(r => r.id_region === selectedRegionId)?.comunas.find((c: any) => c.id_comuna === newAddress.id_comuna)
      const regionData = regionesData.find(r => r.id_region === selectedRegionId)
      
      const newDirWithRelations = {
        ...res.direccion,
        comuna: {
          ...comunaData,
          region: regionData
        }
      }
      setDirecciones([newDirWithRelations, ...direcciones])
      setIsAddingAddress(false)
      setNewAddress({ calle: '', numero: '', id_comuna: 0, detalles: '' })
      setSelectedRegionId(null)
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
      nombres: formData.nombres,
      primer_apellido: formData.primer_apellido,
      segundo_apellido: formData.segundo_apellido,
      telefono: formData.telefono,
      genero: formData.genero,
      fecha_nacimiento: formData.fecha_nacimiento,
      currentPassword: passwords.currentPassword,
      newPassword: passwords.newPassword
    })
    
    if (res.success) {
      updateUser({ nombre: formData.nombres, apellido: formData.primer_apellido })
      setSaveSuccess(true)
      setPasswords({ currentPassword: '', newPassword: '' })
      window.scrollTo({ top: 0, behavior: 'smooth' })
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
    switch (status.toLowerCase()) {
      case 'entregado':
        return 'bg-green-100 text-green-800'
      case 'enviado':
        return 'bg-blue-100 text-blue-800'
      case 'preparando':
        return 'bg-yellow-100 text-yellow-800'
      case 'pagado':
        return 'bg-emerald-100 text-emerald-800'
      case 'cancelado':
        return 'bg-red-100 text-red-800'
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

                <div className="space-y-2">
                  <Label htmlFor="nombres">Nombres</Label>
                  <Input
                    id="nombres"
                    name="nombres"
                    value={formData.nombres}
                    onChange={handleChange}
                    maxLength={100}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="primer_apellido">Primer Apellido</Label>
                    <Input
                      id="primer_apellido"
                      name="primer_apellido"
                      value={formData.primer_apellido}
                      onChange={handleChange}
                      maxLength={50}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="segundo_apellido">Segundo Apellido</Label>
                    <Input
                      id="segundo_apellido"
                      name="segundo_apellido"
                      value={formData.segundo_apellido}
                      onChange={handleChange}
                      maxLength={50}
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

                {direcciones.length > 0 && (
                  <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
                      <MapPin className="h-4 w-4" /> Dirección Principal
                    </h4>
                    <p className="text-sm font-medium">
                      {direcciones[0].calle} {direcciones[0].numero}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {direcciones[0].comuna?.nombre}, {direcciones[0].comuna?.region?.nombre}
                    </p>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      name="telefono"
                      value={formData.telefono}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setFormData({ ...formData, [e.target.name]: val })
                      }}
                      maxLength={9}
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
                      max={new Date(new Date().setFullYear(new Date().getFullYear() - 12)).toISOString().split('T')[0]}
                      min={new Date(new Date().setFullYear(new Date().getFullYear() - 110)).toISOString().split('T')[0]}
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
                {realOrders.length > 0 ? (
                  <div className="space-y-4">
                    {realOrders.map((order) => (
                      <div
                        key={order.id_pedido}
                        className="flex flex-col gap-4 rounded-lg border p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="font-bold text-lg font-mono">SAG-{String(order.id_pedido).padStart(8, '0')}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(order.fecha_pedido).toLocaleDateString('es-CL')}
                            </p>
                          </div>
                          <Badge className={getStatusColor(order.estado?.nombre || 'Pendiente')}>
                            {order.estado?.nombre || 'Pendiente'}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          {order.detalle_pedidos.map((det: any) => (
                            <div key={det.id_detalle} className="flex justify-between text-sm">
                              <span>{det.cantidad}x {det.productos?.nombre} ({det.color}, {det.talla})</span>
                              <span className="text-muted-foreground">{formatPrice(det.precio_unitario * det.cantidad)}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex flex-col sm:flex-row justify-between gap-2 text-xs text-muted-foreground mt-2">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-3 w-3" />
                            <span>Pago: {order.pagos?.[0]?.metodos_pago?.nombre || 'Pendiente'}</span>
                          </div>
                          {order.seguimiento_envio && (
                            <div className="flex items-center gap-2 text-primary font-medium">
                              <Truck className="h-3 w-3" />
                              <span>{order.seguimiento_envio.empresa_transporte}: {order.seguimiento_envio.numero_guia} ({order.seguimiento_envio.estado_logistico})</span>
                            </div>
                          )}
                        </div>

                        <Separator />
                        <div className="flex justify-between items-center">
                          <span className="font-bold">Total</span>
                          <span className="font-bold text-xl">{formatPrice(order.total_pagado)}</span>
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
                            {dir.comuna?.nombre || 'Sin comuna'}, {dir.comuna?.region?.nombre || 'Sin región'}
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
                          <Input required id="calle" value={newAddress.calle} onChange={(e) => setNewAddress({...newAddress, calle: e.target.value})} placeholder="Ej. Av. Providencia" maxLength={100} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="numero">Número</Label>
                          <Input required id="numero" value={newAddress.numero} onChange={(e) => setNewAddress({...newAddress, numero: e.target.value})} placeholder="1234" maxLength={10} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="detalles">Detalles (Depto, block, indicaciones)</Label>
                        <Input id="detalles" value={newAddress.detalles} onChange={(e) => setNewAddress({...newAddress, detalles: e.target.value})} placeholder="Depto 402, Torre B..." maxLength={100} />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="region">Región</Label>
                          <Select required value={selectedRegionId ? selectedRegionId.toString() : ''} onValueChange={(val) => {
                            setSelectedRegionId(parseInt(val))
                            setNewAddress({...newAddress, id_comuna: 0})
                          }}>
                            <SelectTrigger id="region">
                              <SelectValue placeholder="Selecciona una región" />
                            </SelectTrigger>
                            <SelectContent>
                              {regionesData.map((reg) => (
                                <SelectItem key={reg.id_region} value={reg.id_region.toString()}>
                                  {reg.nombre}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="comuna">Comuna</Label>
                          <Select required disabled={!selectedRegionId} value={newAddress.id_comuna ? newAddress.id_comuna.toString() : ''} onValueChange={(val) => setNewAddress({...newAddress, id_comuna: parseInt(val)})}>
                            <SelectTrigger id="comuna">
                              <SelectValue placeholder="Selecciona una comuna" />
                            </SelectTrigger>
                            <SelectContent>
                              {regionesData.find(r => r.id_region === selectedRegionId)?.comunas.map((com: any) => (
                                <SelectItem key={com.id_comuna} value={com.id_comuna.toString()}>
                                  {com.nombre}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
