'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { User, Package, MapPin, CreditCard, Settings, LogOut, ChevronRight, Truck, MessageSquare, Mail, Star } from 'lucide-react'
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
import { cleanChileanPhone, formatRut, validateRut } from '@/lib/utils'
import { getUserContactMessages } from '@/app/actions/contact'
import { createReturnRequest } from '@/app/actions/returns'
import { createProductRating } from '@/app/actions/ratings'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

// We will use real orders now

function ProfileContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab') || 'datos'
  
  const { user, isAuthenticated, isLoading, logout, updateUser } = useAuth()
  
  const [activeTab, setActiveTab] = useState(tabParam)

  // Sync activeTab when the query parameter changes
  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam)
    }
  }, [tabParam])
  
  const [formData, setFormData] = useState({
    nombres: user?.nombre || '',
    primer_apellido: user?.apellido || '',
    segundo_apellido: '',
    email: user?.email || '',
    rut: '',
    telefono: user?.telefono ? cleanChileanPhone(user.telefono) : '',
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
  const [showAllOrders, setShowAllOrders] = useState(false)

  // Direcciones State
  const [direcciones, setDirecciones] = useState<any[]>([])
  const [isAddingAddress, setIsAddingAddress] = useState(false)
  const [newAddress, setNewAddress] = useState({ calle: '', numero: '', id_comuna: 0, detalles: '' })
  const [addressLoading, setAddressLoading] = useState(false)
  const [regionesData, setRegionesData] = useState<any[]>([])
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null)

  // Mensajes State
  const [userMessages, setUserMessages] = useState<any[]>([])
  const [loadingMessages, setLoadingMessages] = useState(false)

  // Devoluciones State
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false)
  const [selectedOrderForReturn, setSelectedOrderForReturn] = useState<any | null>(null)
  const [selectedProductForReturn, setSelectedProductForReturn] = useState('')
  const [returnQuantity, setReturnQuantity] = useState(1)
  const [returnReason, setReturnReason] = useState('')
  const [returnComments, setReturnComments] = useState('')
  const [bankBanco, setBankBanco] = useState('')
  const [bankTipoCuenta, setBankTipoCuenta] = useState('')
  const [bankRut, setBankRut] = useState('')
  const [bankNombre, setBankNombre] = useState('')
  const [bankNumeroCuenta, setBankNumeroCuenta] = useState('')
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false)
  const [returnError, setReturnError] = useState('')

  // Return Label State
  const [selectedOrderForLabel, setSelectedOrderForLabel] = useState<any | null>(null)
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false)

  // Valoraciones State
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false)
  const [selectedOrderForRating, setSelectedOrderForRating] = useState<any | null>(null)
  const [ratingsData, setRatingsData] = useState<Record<number, { puntuacion: number, comentario: string }>>({})
  const [isSubmittingRating, setIsSubmittingRating] = useState(false)
  const [ratingError, setRatingError] = useState('')
  const [ratingSuccess, setRatingSuccess] = useState('')

  const handleSubmitRatings = async () => {
    setRatingError('')
    setRatingSuccess('')
    if (!selectedOrderForRating || !user) return

    // Validar que cada producto tenga al menos una puntuación elegida
    const productsToRate = selectedOrderForRating.detalle_pedidos
    for (const det of productsToRate) {
      const prodId = det.id_producto
      const ratingInfo = ratingsData[prodId]
      if (!ratingInfo || ratingInfo.puntuacion < 1 || ratingInfo.puntuacion > 5) {
        setRatingError(`Por favor selecciona una puntuación de 1 a 5 estrellas para el producto: ${det.productos?.nombre || 'Producto'}`)
        return
      }
    }

    setIsSubmittingRating(true)
    let hasError = false
    let lastErrorMsg = ''

    // Crear las valoraciones
    for (const det of productsToRate) {
      const prodId = det.id_producto
      const ratingInfo = ratingsData[prodId]
      
      const res = await createProductRating({
        id_usuario: parseInt(user.id),
        id_producto: prodId,
        puntuacion: ratingInfo.puntuacion,
        comentario: ratingInfo.comentario
      })

      if (!res.success) {
        hasError = true
        lastErrorMsg = res.error || 'Error al guardar la calificación'
      }
    }

    setIsSubmittingRating(false)
    if (hasError) {
      setRatingError(lastErrorMsg)
    } else {
      setRatingSuccess('¡Muchas gracias por valorar tus productos! Tus calificaciones se han registrado exitosamente.')
      setTimeout(() => {
        setIsRatingModalOpen(false)
        setRatingsData({})
        setRatingSuccess('')
        if (user?.id) {
          getUserOrders(user.id).then(res => {
            if (res.success && res.orders) {
              setRealOrders(res.orders)
            }
          })
        }
      }, 3000)
    }
  }

  const handleSubmitReturn = async () => {
    setReturnError('')
    if (!selectedProductForReturn) {
      setReturnError('Por favor selecciona el producto que deseas devolver.')
      return
    }
    if (!returnReason) {
      setReturnError('Por favor selecciona el motivo de la devolución.')
      return
    }
    if (!returnComments.trim()) {
      setReturnError('Por favor ingresa comentarios descriptivos.')
      return
    }
    if (bankRut && !validateRut(bankRut)) {
      setReturnError('Por favor ingresa un RUT válido para el titular de la cuenta.')
      return
    }

    setIsSubmittingReturn(true)

    const matchingDetail = selectedOrderForReturn.detalle_pedidos.find(
      (det: any, idx: number) => String(det.sku || idx) === selectedProductForReturn
    )

    if (!matchingDetail) {
      setReturnError('Producto no válido.')
      setIsSubmittingReturn(false)
      return
    }

    let bancoInfo = ''
    if (bankNombre || bankRut || bankBanco || bankNumeroCuenta) {
      bancoInfo = `Nombre: ${bankNombre}, RUT: ${bankRut}, Banco: ${bankBanco}, Tipo: ${bankTipoCuenta}, Num: ${bankNumeroCuenta}`
    }

    const res = await createReturnRequest({
      id_pedido: selectedOrderForReturn.id_pedido,
      id_producto: matchingDetail.id_producto,
      cantidad: returnQuantity,
      motivo: returnReason,
      comentarios: returnComments,
      bancoInfo: bancoInfo || undefined
    })

    setIsSubmittingReturn(false)

    if (res.success) {
      alert('Tu solicitud de devolución ha sido enviada con éxito. Un ejecutivo la revisará.')
      setIsReturnModalOpen(false)
      // Refrescar órdenes de usuario
      if (user) {
        getUserOrders(user.id).then(r => {
          if (r.success && r.orders) {
            setRealOrders(r.orders)
          }
        })
      }
      // Resetear campos
      setReturnReason('')
      setReturnComments('')
      setSelectedProductForReturn('')
      setReturnQuantity(1)
      setBankBanco('')
      setBankTipoCuenta('')
      setBankRut('')
      setBankNombre('')
      setBankNumeroCuenta('')
    } else {
      setReturnError(res.error || 'Ocurrió un error al procesar tu solicitud.')
    }
  }

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading) {
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
              telefono: res.profile.telefono ? cleanChileanPhone(res.profile.telefono) : '',
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
    }
  }, [isLoading, isAuthenticated, user, router])

  useEffect(() => {
    if (user && activeTab === 'mensajes') {
      setLoadingMessages(true)
      getUserContactMessages(user.id, user.email).then(res => {
        if (res.success && res.messages) {
          setUserMessages(res.messages)
        }
        setLoadingMessages(false)
      })
    }
  }, [activeTab, user])

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
      case 'devolucion_solicitada':
        return 'bg-amber-100 text-amber-800'
      case 'devolucion_aprobada':
        return 'bg-indigo-100 text-indigo-800'
      case 'devolucion_rechazada':
        return 'bg-rose-100 text-rose-800'
      case 'reembolsado':
        return 'bg-teal-100 text-teal-800'
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
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
            <TabsTrigger value="mensajes" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Mensajes</span>
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
                      placeholder="912345678"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Ingresa 9 dígitos, comenzando por el 9 (ej: 912345678).
                    </p>
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
                {(() => {
                  const displayedOrders = showAllOrders 
                    ? realOrders 
                    : realOrders.filter(order => {
                        const est = order.estado?.nombre?.toLowerCase() || '';
                        return est !== 'cancelado' && est !== 'pendiente';
                      });

                  return displayedOrders.length > 0 ? (
                    <div className="space-y-4">
                      {/* Barra de Filtro */}
                      <div className="flex items-center justify-between bg-muted/40 p-3.5 rounded-xl border border-muted/50 mb-2">
                        <p className="text-xs text-muted-foreground font-medium">
                          Mostrando {displayedOrders.length} {showAllOrders ? 'pedidos (historial completo)' : 'pedidos activos'}
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setShowAllOrders(!showAllOrders)}
                          className="text-xs font-semibold h-8 rounded-full border-primary/30 text-primary hover:bg-primary/5 transition-colors"
                        >
                          {showAllOrders ? 'Ver solo activos' : 'Ver historial completo'}
                        </Button>
                      </div>

                      {displayedOrders.map((order, idx) => {
                        const isCanceledOrPending = order.estado?.nombre?.toLowerCase() === 'cancelado' || order.estado?.nombre?.toLowerCase() === 'pendiente';
                        return (
                          <div
                            key={`order-${order.id_pedido}-${idx}`}
                            className={`flex flex-col gap-4 rounded-lg border p-4 hover:shadow-md transition-all duration-300 ${
                              isCanceledOrPending ? 'opacity-60 bg-muted/10 border-dashed' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <p className="font-bold text-lg font-mono">SAG-{String(order.id_pedido).padStart(8, '0')}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(order.fecha_pedido).toLocaleDateString('es-CL')}
                                </p>
                              </div>
                              <Badge className={getStatusColor(order.estado?.nombre || 'Pendiente')}>
                                {(() => {
                                  const nombre = order.estado?.nombre || 'Pendiente'
                                  if (nombre === 'devolucion_solicitada') return 'Devolución Solicitada'
                                  if (nombre === 'devolucion_aprobada') return 'Devolución Aprobada'
                                  if (nombre === 'devolucion_rechazada') return 'Devolución Rechazada'
                                  if (nombre === 'reembolsado') return 'Reembolsado'
                                  return nombre
                                })()}
                              </Badge>
                            </div>
                            
                            <div className="space-y-4 my-2">
                              {order.detalle_pedidos.map((det: any, idx: number) => (
                                <div 
                                  key={`${det.productos?.nombre}-${det.color}-${det.talla}-${idx}`} 
                                  className="flex items-center gap-4 bg-muted/20 p-3 rounded-xl border border-muted/30"
                                >
                                  <div className="h-16 w-16 bg-muted rounded-lg overflow-hidden shrink-0 flex items-center justify-center border relative">
                                    {det.productos?.imagen_url && det.productos?.imagen_url !== '/placeholder.jpg' ? (
                                      <img 
                                        src={det.productos.imagen_url} 
                                        alt={det.productos.nombre} 
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      <Package className="h-6 w-6 text-muted-foreground/30" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold truncate">{det.productos?.nombre}</p>
                                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground mt-0.5">
                                      <span>Talla: {det.talla}</span>
                                      <span>Color: {det.color}</span>
                                      <span>Cant: {det.cantidad}</span>
                                    </div>
                                    {det.sku && (
                                      <p className="text-[10px] font-mono text-muted-foreground mt-1 uppercase">
                                        SKU: {det.sku}
                                      </p>
                                    )}
                                  </div>
                                  <div className="text-right shrink-0">
                                    <p className="text-sm font-bold">{formatPrice(det.precio_unitario * det.cantidad)}</p>
                                    <p className="text-[10px] text-muted-foreground">{det.cantidad}x {formatPrice(det.precio_unitario)}</p>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="flex flex-col sm:flex-row justify-between gap-2 text-xs text-muted-foreground mt-2">
                              <div className="flex items-center gap-2">
                                <CreditCard className="h-3 w-3" />
                                <span>Pago: {order.pagos?.[0]?.metodo_pago || 'Pendiente'} ({order.pagos?.[0]?.estado_pago || 'Pendiente de Pago'})</span>
                              </div>
                              {order.seguimiento_envio && (
                                <div className="flex items-center gap-2 text-primary font-medium">
                                  <Truck className="h-3 w-3" />
                                  <span>{order.seguimiento_envio.empresa_transporte}: {order.seguimiento_envio.numero_guia} ({order.seguimiento_envio.estado_logistico})</span>
                                </div>
                              )}
                            </div>

                            {order.direccion_entrega && (
                              <div className="bg-muted/40 p-4 rounded-xl border border-muted/50 text-xs space-y-2">
                                <div>
                                  <p className="font-bold text-muted-foreground uppercase tracking-wider text-[10px] mb-1">Dirección de despacho:</p>
                                  <p className="text-foreground font-medium">
                                    {order.direccion_entrega.calle} {order.direccion_entrega.numero}
                                    {order.direccion_entrega.departamento && `, Depto/Apto ${order.direccion_entrega.departamento}`}
                                  </p>
                                  <p className="text-muted-foreground">
                                    {order.direccion_entrega.comuna}, {order.direccion_entrega.region}
                                  </p>
                                </div>

                                {order.comentarios_cliente && (
                                  <div className="pt-2 border-t border-muted/70">
                                    <p className="font-bold text-muted-foreground uppercase tracking-wider text-[10px] mb-1">Indicaciones de entrega:</p>
                                    <p className="text-foreground italic leading-relaxed bg-background/50 p-2 rounded-lg border">
                                      "{order.comentarios_cliente}"
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}

                            <Separator />
                            <div className="flex justify-between items-center">
                              <span className="font-bold">Total</span>
                              <span className="font-bold text-xl">{formatPrice(order.total_pagado)}</span>
                            </div>

                            {order.estado?.nombre === 'entregado' && (
                              <div className="flex justify-end gap-2 pt-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-xs border-amber-600 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20 rounded-full"
                                  onClick={() => {
                                    setSelectedOrderForReturn(order)
                                    setIsReturnModalOpen(true)
                                  }}
                                >
                                  Solicitar Devolución
                                </Button>
                                <Button 
                                  variant="default" 
                                  size="sm" 
                                  className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center gap-1.5"
                                  onClick={() => {
                                    setSelectedOrderForRating(order)
                                    const initialRatings: Record<number, { puntuacion: number, comentario: string }> = {}
                                    order.detalle_pedidos.forEach((det: any) => {
                                      initialRatings[det.id_producto] = { puntuacion: 5, comentario: '' }
                                    })
                                    setRatingsData(initialRatings)
                                    setIsRatingModalOpen(true)
                                  }}
                                >
                                  <Star className="h-3 w-3 fill-current text-yellow-300" />
                                  Calificar Productos
                                </Button>
                              </div>
                            )}

                            {order.estado?.nombre?.toLowerCase() === 'devolucion_aprobada' && (
                              <div className="flex justify-end gap-2 pt-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-xs border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 rounded-full font-bold"
                                  onClick={() => {
                                    setSelectedOrderForLabel(order)
                                    setIsLabelModalOpen(true)
                                  }}
                                >
                                  Ver Etiqueta de Retorno
                                </Button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Aun no tienes pedidos activos</p>
                      {realOrders.length > 0 && (
                        <Button className="mt-4" onClick={() => setShowAllOrders(true)} variant="outline">
                          Ver pedidos cancelados o pendientes
                        </Button>
                      )}
                      <Button className="mt-4 ml-2" asChild>
                        <Link href="/categoria/hombre">Explorar Productos</Link>
                      </Button>
                    </div>
                  );
                })()}
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
                    <div key={`dir-${dir.id_direccion}-${idx}`} className="rounded-lg border p-4 bg-muted/20">
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

          {/* Mensajes */}
          <TabsContent value="mensajes">
            <Card>
              <CardHeader>
                <CardTitle>Buzón de Consultas</CardTitle>
                <CardDescription>
                  Revisa el historial de tus mensajes y las respuestas de nuestro equipo
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingMessages ? (
                  <div className="text-center py-12 text-muted-foreground animate-pulse">
                    Cargando historial de mensajes...
                  </div>
                ) : userMessages.length > 0 ? (
                  <div className="space-y-6">
                    {userMessages.map((msg, idx) => (
                      <div key={`msg-${msg.id}-${idx}`} className="border rounded-2xl p-5 space-y-4 hover:shadow-sm transition-shadow">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-semibold capitalize">
                              {msg.motivo === 'soporte' ? 'Soporte / Pedido' :
                               msg.motivo === 'tallas' ? 'Duda Tallas' :
                               msg.motivo === 'trabaja' ? 'Postulación' :
                               msg.motivo === 'mayorista' ? 'Mayorista' : 'Otro'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(msg.fecha).toLocaleString('es-CL')}
                            </span>
                          </div>
                          <div>
                            {msg.respondido ? (
                              <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white">Respondido</Badge>
                            ) : (
                              <Badge variant="secondary">Recibido (Pendiente)</Badge>
                            )}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Tu Consulta:</p>
                          <p className="text-sm bg-muted/30 p-3.5 rounded-xl border border-muted/50 whitespace-pre-wrap leading-relaxed">
                            {msg.mensaje}
                          </p>
                        </div>

                        {msg.respondido && msg.respuesta && (
                          <div className="space-y-1 bg-primary/5 p-4 rounded-xl border border-primary/10">
                            <p className="text-xs font-bold uppercase text-primary tracking-wider flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                              Respuesta del Equipo Saguaro:
                            </p>
                            <p className="text-sm text-foreground whitespace-pre-wrap italic leading-relaxed pt-1">
                              {msg.respuesta}
                            </p>
                            {msg.fecha_respuesta && (
                              <p className="text-[10px] text-muted-foreground pt-2 text-right">
                                Respondido el {new Date(msg.fecha_respuesta).toLocaleString('es-CL')}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                    <p className="text-muted-foreground">Aún no has enviado ninguna consulta.</p>
                    <Button className="mt-4" asChild>
                      <Link href="/contacto">Ir al Centro de Ayuda</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal de Solicitud de Devolución */}
      <Dialog open={isReturnModalOpen} onOpenChange={(open) => {
        setIsReturnModalOpen(open)
        if (!open) {
          setReturnReason('')
          setReturnComments('')
          setSelectedProductForReturn('')
          setReturnQuantity(1)
          setBankBanco('')
          setBankTipoCuenta('')
          setBankRut('')
          setBankNombre('')
          setBankNumeroCuenta('')
          setReturnError('')
        }
      }}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Solicitar Devolución</DialogTitle>
            <DialogDescription>
              Completa el formulario para iniciar tu proceso de devolución.
            </DialogDescription>
          </DialogHeader>

          {selectedOrderForReturn && (
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>1. Selecciona el calzado a devolver</Label>
                <Select 
                  value={selectedProductForReturn} 
                  onValueChange={(val) => {
                    setSelectedProductForReturn(val)
                    setReturnQuantity(1)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Elige un producto de tu pedido" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedOrderForReturn.detalle_pedidos.map((det: any, idx: number) => (
                      <SelectItem 
                        key={idx} 
                        value={String(det.sku || idx)}
                      >
                        {det.productos?.nombre} ({det.color}, Talla {det.talla})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {(() => {
                const matchingDetail = selectedOrderForReturn.detalle_pedidos.find(
                  (det: any, idx: number) => String(det.sku || idx) === selectedProductForReturn
                )
                const maxReturnQty = matchingDetail ? matchingDetail.cantidad : 1
                if (selectedProductForReturn && maxReturnQty > 1) {
                  return (
                    <div className="space-y-2">
                      <Label>Cantidad a devolver (Máximo {maxReturnQty})</Label>
                      <Select 
                        value={String(returnQuantity)} 
                        onValueChange={(val) => setReturnQuantity(parseInt(val))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona la cantidad" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: maxReturnQty }, (_, i) => i + 1).map((qty) => (
                            <SelectItem key={qty} value={String(qty)}>
                              {qty} {qty === 1 ? 'unidad' : 'unidades'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )
                }
                return null
              })()}

              <div className="space-y-2">
                <Label>2. Motivo de la Devolución</Label>
                <Select value={returnReason} onValueChange={setReturnReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un motivo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="falla_fabrica">Falla de Fábrica / Calidad</SelectItem>
                    <SelectItem value="talla_incorrecta">Talla Incorrecta</SelectItem>
                    <SelectItem value="no_me_gusto">No me gustó / Arrepentimiento</SelectItem>
                    <SelectItem value="otro">Otro Motivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>3. Comentarios del Cliente</Label>
                <Textarea 
                  placeholder="Explícanos de manera sencilla el problema con el producto..."
                  value={returnComments}
                  onChange={(e) => setReturnComments(e.target.value)}
                  maxLength={150}
                  className="min-h-[85px] resize-none"
                />
              </div>

              <div className="border-t pt-3 space-y-3">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  4. Datos Bancarios para Reembolso (Opcional / Pago Débito)
                </p>
                
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor="bankNombre" className="text-xs">Nombre Completo</Label>
                    <Input id="bankNombre" value={bankNombre} onChange={(e) => setBankNombre(e.target.value)} placeholder="Juan Perez" maxLength={50} className="h-9 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="bankRut" className="text-xs">RUT Titular</Label>
                    <Input id="bankRut" value={bankRut} onChange={(e) => setBankRut(formatRut(e.target.value))} placeholder="12.345.678-9" maxLength={15} className="h-9 text-xs" />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor="bankBanco" className="text-xs">Banco</Label>
                    <Input id="bankBanco" value={bankBanco} onChange={(e) => setBankBanco(e.target.value)} placeholder="Banco Estado" maxLength={30} className="h-9 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="bankTipo" className="text-xs">Tipo de Cuenta</Label>
                    <Input id="bankTipo" value={bankTipoCuenta} onChange={(e) => setBankTipoCuenta(e.target.value)} placeholder="Cuenta Corriente" maxLength={30} className="h-9 text-xs" />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="bankNumero" className="text-xs">Número de Cuenta</Label>
                  <Input id="bankNumero" value={bankNumeroCuenta} onChange={(e) => setBankNumeroCuenta(e.target.value)} placeholder="123456789" maxLength={30} className="h-9 text-xs" />
                </div>
              </div>

              {returnError && (
                <p className="text-xs font-semibold text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
                  {returnError}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setIsReturnModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  className="flex-1" 
                  disabled={isSubmittingReturn}
                  onClick={handleSubmitReturn}
                >
                  {isSubmittingReturn ? 'Enviando...' : 'Enviar Solicitud'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Calificación de Productos */}
      <Dialog open={isRatingModalOpen} onOpenChange={(open) => {
        setIsRatingModalOpen(open)
        if (!open) {
          setRatingsData({})
          setRatingError('')
          setRatingSuccess('')
        }
      }}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 fill-current text-yellow-400" />
              Valorar mis Productos
            </DialogTitle>
            <DialogDescription>
              Comparte tu experiencia para ayudar a otros compradores. Puedes calificar de 1 a 5 estrellas y dejar un comentario opcional para cada producto.
            </DialogDescription>
          </DialogHeader>

          {selectedOrderForRating && (
            <div className="space-y-6 pt-4">
              {selectedOrderForRating.detalle_pedidos.map((det: any, idx: number) => {
                const prodId = det.id_producto
                const ratingInfo = ratingsData[prodId] || { puntuacion: 5, comentario: '' }

                return (
                  <div key={idx} className="bg-muted/30 p-4 rounded-xl border border-muted/50 space-y-3">
                    <div className="flex gap-3 items-center">
                      <div className="h-12 w-12 bg-muted rounded-lg overflow-hidden border shrink-0 flex items-center justify-center">
                        {det.productos?.imagen_url && det.productos?.imagen_url !== '/placeholder.jpg' ? (
                          <img 
                            src={det.productos.imagen_url} 
                            alt={det.productos.nombre} 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Package className="h-5 w-5 text-muted-foreground/30" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate text-foreground">{det.productos?.nombre}</p>
                        <p className="text-xs text-muted-foreground">Talla: {det.talla} | Color: {det.color}</p>
                      </div>
                    </div>

                    {/* Selector de Estrellas */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground">Calificación (Estrellas)</Label>
                      <div className="flex gap-1.5 items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => {
                              setRatingsData(prev => ({
                                ...prev,
                                [prodId]: { ...prev[prodId], puntuacion: star }
                              }))
                            }}
                            className="p-1 hover:scale-110 transition-transform focus:outline-none"
                          >
                            <Star 
                              className={`h-6 w-6 transition-colors ${
                                star <= ratingInfo.puntuacion 
                                  ? 'fill-yellow-400 text-yellow-400' 
                                  : 'text-muted-foreground/30 fill-transparent'
                              }`}
                            />
                          </button>
                        ))}
                        <span className="text-xs font-medium ml-2 text-foreground">
                          {ratingInfo.puntuacion === 5 ? '¡Excelente!' :
                           ratingInfo.puntuacion === 4 ? 'Muy bueno' :
                           ratingInfo.puntuacion === 3 ? 'Bueno' :
                           ratingInfo.puntuacion === 2 ? 'Regular' : 'Malo'}
                        </span>
                      </div>
                    </div>

                    {/* Comentario Opcional */}
                    <div className="space-y-1">
                      <Label htmlFor={`comment-${prodId}`} className="text-xs font-semibold text-muted-foreground">Comentario (Opcional)</Label>
                      <Textarea
                        id={`comment-${prodId}`}
                        placeholder="¿Qué tal te parecieron? (calidad, comodidad, talla...)"
                        value={ratingInfo.comentario}
                        onChange={(e) => {
                          setRatingsData(prev => ({
                            ...prev,
                            [prodId]: { ...prev[prodId], comentario: e.target.value }
                          }))
                        }}
                        maxLength={250}
                        className="min-h-[60px] resize-none text-xs"
                      />
                    </div>
                  </div>
                )
              })}

              {ratingError && (
                <p className="text-xs font-semibold text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
                  {ratingError}
                </p>
              )}

              {ratingSuccess && (
                <p className="text-xs font-semibold text-emerald-600 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                  {ratingSuccess}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <Button 
                  variant="outline" 
                  className="flex-1 rounded-full"
                  onClick={() => setIsRatingModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full" 
                  disabled={isSubmittingRating || !!ratingSuccess}
                  onClick={handleSubmitRatings}
                >
                  {isSubmittingRating ? 'Guardando...' : 'Enviar Calificaciones'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Etiqueta de Retorno */}
      <Dialog open={isLabelModalOpen} onOpenChange={setIsLabelModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Etiqueta de Despacho de Devolución</DialogTitle>
            <DialogDescription>
              Imprime esta etiqueta y pégala en la caja del calzado para realizar el envío de retorno.
            </DialogDescription>
          </DialogHeader>

          {selectedOrderForLabel && (
            <div className="space-y-6 pt-4">
              {/* Contenedor Etiqueta de Envio (Estilo Chilexpress) */}
              <div id="print-label-area" className="border-2 border-black p-4 bg-white text-black font-sans text-xs">
                {/* Cabecera */}
                <div className="flex justify-between items-center border-b-2 border-black pb-2 mb-3">
                  <div>
                    <h2 className="text-lg font-black tracking-tight">CHILEXPRESS</h2>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Devolución e-Commerce</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[10px]">SERVICIO: ENCOMIENDA</p>
                    <p className="font-mono text-[9px]">ID: SAG-{String(selectedOrderForLabel.id_pedido).padStart(8, '0')}</p>
                  </div>
                </div>

                {/* Direcciones (Remitente y Destinatario) */}
                <div className="grid grid-cols-2 gap-4 border-b-2 border-black pb-3 mb-3">
                  <div>
                    <p className="font-bold uppercase border-b border-black pb-0.5 mb-1 text-[9px]">REMITENTE (CLIENTE):</p>
                    <p className="font-semibold">{selectedOrderForLabel.direccion_entrega?.calle} {selectedOrderForLabel.direccion_entrega?.numero}</p>
                    {selectedOrderForLabel.direccion_entrega?.departamento && (
                      <p className="text-[10px]">Depto: {selectedOrderForLabel.direccion_entrega.departamento}</p>
                    )}
                    <p className="text-[10px]">{selectedOrderForLabel.direccion_entrega?.comuna}, {selectedOrderForLabel.direccion_entrega?.region}</p>
                    <p className="text-[10px] mt-1 font-semibold">{user?.nombre} {user?.apellido}</p>
                    <p className="text-[10px]">Fono: {user?.telefono || 'No registrado'}</p>
                  </div>
                  <div className="border-l border-black pl-3">
                    <p className="font-bold uppercase border-b border-black pb-0.5 mb-1 text-[9px]">DESTINATARIO (TIENDA):</p>
                    <p className="font-bold">Saguaro Barefoot Chile</p>
                    <p className="font-semibold">Av. Vitacura 5250, Of. 402</p>
                    <p className="text-[10px]">Vitacura, Región Metropolitana</p>
                    <p className="text-[10px] mt-1">Fono: +56 9 8765 4321</p>
                    <p className="text-[9px] font-bold text-muted-foreground mt-1">Ref: BODEGA DEVOLUCIONES</p>
                  </div>
                </div>

                {/* Código de barras y QR */}
                <div className="flex flex-col items-center justify-center py-4 border-b-2 border-black mb-3">
                  {/* Código de barras simulado por CSS */}
                  <div className="h-14 w-full max-w-[280px] bg-black mb-1" style={{
                    background: 'repeating-linear-gradient(90deg, #000, #000 3px, #fff 3px, #fff 6px, #000 6px, #000 7px, #fff 7px, #fff 10px, #000 10px, #000 14px, #fff 14px, #fff 16px)'
                  }} />
                  <p className="font-mono text-[10px] tracking-[4px] font-bold">DEV-SAG-{String(selectedOrderForLabel.id_pedido).padStart(8, '0')}</p>
                </div>

                {/* QR Code de verdad (usando la API gratuita qrserver) */}
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <p className="font-bold text-[10px]">INSTRUCCIONES:</p>
                    <p className="text-[9px] text-muted-foreground leading-snug">
                      1. Guarda el calzado en su embalaje original.<br />
                      2. Pega esta etiqueta de forma visible en la caja.<br />
                      3. Llévalo a cualquier sucursal Chilexpress.<br />
                      4. El costo de este envío de retorno es **$0 (Gratuito)**.
                    </p>
                  </div>
                  <div className="h-20 w-20 border p-1 shrink-0 bg-white">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=DEV-SAG-${String(selectedOrderForLabel.id_pedido).padStart(8, '0')}`}
                      alt="Código QR de Devolución"
                      className="h-full w-full object-contain"
                    />
                  </div>
                </div>
              </div>

              {/* Botón de Acción */}
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setIsLabelModalOpen(false)}
                >
                  Cerrar
                </Button>
                <Button 
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                  onClick={() => {
                    const printContent = document.getElementById('print-label-area')?.innerHTML
                    
                    if (printContent) {
                      const printWindow = window.open('', '_blank')
                      if (printWindow) {
                        printWindow.document.write(`
                          <html>
                            <head>
                              <title>Imprimir Etiqueta de Retorno</title>
                              <style>
                                body { font-family: sans-serif; display: flex; justify-content: center; padding: 20px; }
                                #label { border: 2px solid black; padding: 20px; width: 400px; }
                                .flex { display: flex; justify-content: space-between; }
                                .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                                .border-b-2 { border-bottom: 2px solid black; }
                                .pb-2 { padding-bottom: 8px; }
                                .pb-3 { padding-bottom: 12px; }
                                .mb-3 { margin-bottom: 12px; }
                                .text-lg { font-size: 18px; font-weight: bold; }
                                .font-mono { font-family: monospace; }
                                .font-bold { font-weight: bold; }
                                .text-right { text-align: right; }
                                .h-14 { height: 56px; }
                                .w-full { width: 100%; }
                                .tracking-widest { letter-spacing: 4px; }
                                .mt-1 { margin-top: 4px; }
                                .leading-snug { line-height: 1.3; }
                                .h-20 { height: 80px; }
                                .w-20 { width: 80px; }
                                .border { border: 1px solid #ccc; }
                                .p-1 { padding: 4px; }
                              </style>
                            </head>
                            <body onload="window.print();window.close();">
                              <div id="label">${printContent}</div>
                            </body>
                          </html>
                        `)
                        printWindow.document.close()
                      }
                    }
                  }}
                >
                  Imprimir Etiqueta
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground">Cargando perfil...</div>}>
      <ProfileContent />
    </Suspense>
  )
}
