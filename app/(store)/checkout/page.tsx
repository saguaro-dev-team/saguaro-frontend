'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronRight, ShoppingBag, CreditCard, Truck, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCart } from '@/lib/cart-context'
import { useAuth } from '@/lib/auth-context'
import { formatPrice } from '@/lib/store-data'
import { getRegiones } from '@/app/actions/location'
import { createOrder } from '@/app/actions/orders'
import { initWebpayTransaction } from '@/app/actions/webpay'
import { getUserProfile, getUserAddresses } from '@/app/actions/profile'
import { useEffect } from 'react'
import { cleanChileanPhone } from '@/lib/utils'
import { checkCartStock } from '@/app/actions/products'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, total, clearCart } = useCart()
  const { isAuthenticated, user, isLoading } = useAuth()
  
  const [step, setStep] = useState(1)
  const [shippingMethod, setShippingMethod] = useState('standard')
  const [paymentMethod, setPaymentMethod] = useState('webpay')
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)

  const [formData, setFormData] = useState({
    email: user?.email || '',
    nombres: user?.nombre || '',
    primer_apellido: user?.apellido || '',
    segundo_apellido: '',
    telefono: user?.telefono ? cleanChileanPhone(user.telefono) : '',
    calle: '',
    numero: '',
    departamento: '',
    detalles: '',
    id_comuna: 0,
    codigoPostal: '',
    comentarios: '',
  })
  
  const [regionesData, setRegionesData] = useState<any[]>([])
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)
  const [validationError, setValidationError] = useState('')
  const [stockChecks, setStockChecks] = useState<any[]>([])
  const [checkingStock, setCheckingStock] = useState(false)

  useEffect(() => {
    if (items.length > 0) {
      setCheckingStock(true)
      const payload = items.map(item => ({
        id: item.producto.id,
        talla: item.talla,
        color: item.color,
        cantidad: item.cantidad
      }))
      checkCartStock(payload).then(res => {
        if (res.success && res.stockStates) {
          setStockChecks(res.stockStates)
        }
        setCheckingStock(false)
      }).catch(err => {
        console.error("Error checking stock in checkout page:", err)
        setCheckingStock(false)
      })
    }
  }, [items])

  const hasAnyStockError = stockChecks.some(c => !c.hasEnoughStock)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated) {
      router.push('/login?redirect=/checkout')
    }
  }, [mounted, isLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      // Load user profile details (surnames, telephone)
      getUserProfile(user.id).then(res => {
        if (res.success && res.profile) {
          setFormData(prev => ({
            ...prev,
            email: user.email || prev.email,
            nombres: res.profile.nombres || prev.nombres,
            primer_apellido: res.profile.primer_apellido || prev.primer_apellido,
            segundo_apellido: res.profile.segundo_apellido || prev.segundo_apellido,
            telefono: res.profile.telefono ? cleanChileanPhone(res.profile.telefono) : prev.telefono,
          }))
        }
      })

      // Load user addresses details (calle, numero, departamento, comuna, detalles)
      getUserAddresses(user.id).then(res => {
        if (res.success && res.direcciones && res.direcciones.length > 0) {
          const principal = res.direcciones.find((dir: any) => dir.es_principal) || res.direcciones[0]
          setFormData(prev => ({
            ...prev,
            calle: principal.calle || prev.calle,
            numero: principal.numero || prev.numero,
            departamento: principal.departamento || prev.departamento || '',
            detalles: principal.detalles || prev.detalles || '',
            id_comuna: principal.id_comuna || prev.id_comuna,
          }))
          if (principal.comuna) {
            setSelectedRegionId(principal.comuna.id_region)
          }
        }
      })
    }
  }, [isAuthenticated, user])

  useEffect(() => {
    getRegiones().then(res => {
      if (res.success && res.regiones) {
        setRegionesData(res.regiones)
      }
    })
  }, [])

  const shippingCost = shippingMethod === 'express' ? 7990 : (total >= 50000 ? 0 : 4990)
  const finalTotal = total + shippingCost

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleContinueToStep2 = () => {
    setValidationError('')
    if (hasAnyStockError) {
      setValidationError('Por favor resuelve los problemas de stock en tu carrito.')
      return
    }
    const { email, nombres, primer_apellido, segundo_apellido, telefono, calle, numero, id_comuna } = formData
    
    if (!email || !nombres || !primer_apellido || !segundo_apellido || !telefono || !calle || !numero || !id_comuna) {
      setValidationError('Por favor completa todos los campos requeridos.')
      return
    }

    if (telefono.length !== 9) {
      setValidationError('El teléfono debe tener exactamente 9 dígitos.')
      return
    }

    setStep(2)
  }

  const [checkoutError, setCheckoutError] = useState('')
  const [webpayData, setWebpayData] = useState<{ url: string; token: string } | null>(null)

  useEffect(() => {
    if (webpayData) {
      const form = document.getElementById('webpay-form') as HTMLFormElement
      if (form) form.submit()
    }
  }, [webpayData])

  const handleSubmit = async () => {
    if (!user?.id) {
      setCheckoutError('Debes iniciar sesión para completar la compra.')
      return
    }
    if (hasAnyStockError) {
      setCheckoutError('No puedes proceder con el pago porque hay productos sin stock suficiente.')
      return
    }
    setIsProcessing(true)
    setCheckoutError('')
    
    const res = await createOrder({
      userId: user?.id || null,
      formData,
      items,
      total,
      finalTotal,
      paymentMethod
    })

    if (res.success && res.orderId) {
      const wpRes = await initWebpayTransaction(res.orderId, finalTotal)
      if (wpRes.success && wpRes.url && wpRes.token) {
        setWebpayData({ url: wpRes.url, token: wpRes.token })
      } else {
        setCheckoutError(wpRes.error || 'Error al conectar con Webpay.')
        setIsProcessing(false)
      }
    } else {
      setCheckoutError(res.error || 'Ocurrió un error al procesar el pedido.')
      setIsProcessing(false)
    }
  }

  // Bloquear usuarios no autenticados — mostrar mensaje de login inmediatamente
  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-16 px-4">
        <span className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4" />
        <p className="text-muted-foreground font-medium">Cargando checkout...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-16 px-4 text-center">
        <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Debes iniciar sesión para comprar</h1>
        <p className="text-muted-foreground mb-6">
          Crea una cuenta o inicia sesión para continuar con tu compra.
        </p>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/login?redirect=/checkout">Iniciar Sesión</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/registro?redirect=/checkout">Crear Cuenta</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (webpayData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-16 px-4">
        <span className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent mb-6" />
        <h1 className="text-2xl font-bold mb-2">Redirigiendo a Webpay Plus...</h1>
        <p className="text-muted-foreground">Por favor espera, no cierres esta ventana.</p>
        
        <form id="webpay-form" action={webpayData.url} method="POST" className="hidden">
          <input type="hidden" name="token_ws" value={webpayData.token} />
        </form>
      </div>
    )
  }

  if (items.length === 0 && !orderComplete) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-16 px-4">
        <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Tu carrito esta vacio</h1>
        <p className="text-muted-foreground mb-6">Agrega productos para continuar con la compra</p>
        <Button asChild>
          <Link href="/categoria/hombre">Explorar Productos</Link>
        </Button>
      </div>
    )
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-16 px-4">
        <div className="text-center max-w-md">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <CheckCircle className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Pedido Confirmado!</h1>
          <p className="text-muted-foreground mb-2">
            Gracias por tu compra. Hemos enviado un correo de confirmacion a {formData.email}
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Numero de pedido: <span className="font-mono font-medium">SAG-{Date.now().toString().slice(-8)}</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link href="/">Volver al Inicio</Link>
            </Button>
            {isAuthenticated && (
              <Button variant="outline" asChild>
                <Link href="/perfil">Ver Mis Pedidos</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-7xl px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-primary">Inicio</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">Checkout</span>
        </nav>

        <h1 className="text-3xl font-bold mb-8">Finalizar Compra</h1>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[
            { num: 1, label: 'Datos' },
            { num: 2, label: 'Envio' },
            { num: 3, label: 'Pago' },
          ].map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full font-medium ${
                  step >= s.num
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {s.num}
              </div>
              <span className={`ml-2 hidden sm:block ${step >= s.num ? 'text-foreground' : 'text-muted-foreground'}`}>
                {s.label}
              </span>
              {i < 2 && (
                <div className={`mx-4 h-0.5 w-12 sm:w-24 ${step > s.num ? 'bg-primary' : 'bg-muted'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2">
            {hasAnyStockError && (
              <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold mb-6 flex flex-col gap-1">
                <span>⚠️ ¡Atención! Algunos productos en tu carrito ya no tienen stock suficiente.</span>
                <span className="text-xs font-normal">Por favor, ajusta las cantidades o elimina los productos marcados para poder continuar.</span>
              </div>
            )}
            
            {/* Step 1: Contact & Address */}
            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Datos de Contacto y Direccion</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {!isAuthenticated && (
                    <div className="rounded-lg bg-muted/50 p-4 text-sm">
                      Ya tienes cuenta?{' '}
                      <Link href="/login" className="text-primary hover:underline">
                        Inicia sesion
                      </Link>{' '}
                      para una compra mas rapida.
                    </div>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        maxLength={100}
                        disabled={isAuthenticated}
                        className={isAuthenticated ? "bg-muted/50 text-muted-foreground cursor-not-allowed border-dashed" : ""}
                        required
                      />
                      {isAuthenticated && (
                        <p className="text-[11px] text-muted-foreground font-medium">
                          El comprobante de compra se enviará al correo asociado a tu cuenta.
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telefono">Telefono</Label>
                      <Input
                        id="telefono"
                        name="telefono"
                        type="tel"
                        value={formData.telefono}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          setFormData({ ...formData, telefono: val });
                        }}
                        maxLength={9}
                        placeholder="912345678"
                        required
                      />
                      <p className="text-[11px] text-muted-foreground">
                        Ingresa 9 dígitos, comenzando por el 9 (ej: 912345678).
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="nombres">Nombres</Label>
                      <Input
                        id="nombres"
                        name="nombres"
                        value={formData.nombres}
                        onChange={handleInputChange}
                        maxLength={100}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="primer_apellido">Primer Apellido</Label>
                      <Input
                        id="primer_apellido"
                        name="primer_apellido"
                        value={formData.primer_apellido}
                        onChange={handleInputChange}
                        maxLength={50}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="segundo_apellido">Segundo Apellido</Label>
                      <Input
                        id="segundo_apellido"
                        name="segundo_apellido"
                        value={formData.segundo_apellido}
                        onChange={handleInputChange}
                        maxLength={50}
                        required
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="calle">Calle</Label>
                      <Input
                        id="calle"
                        name="calle"
                        value={formData.calle}
                        onChange={handleInputChange}
                        maxLength={100}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="numero">Numero</Label>
                      <Input
                        id="numero"
                        name="numero"
                        value={formData.numero}
                        onChange={handleInputChange}
                        maxLength={10}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="departamento">Departamento (opcional)</Label>
                      <Input
                        id="departamento"
                        name="departamento"
                        value={formData.departamento}
                        onChange={handleInputChange}
                        maxLength={20}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="codigoPostal">Codigo Postal</Label>
                      <Input
                        id="codigoPostal"
                        name="codigoPostal"
                        value={formData.codigoPostal}
                        onChange={handleInputChange}
                        maxLength={10}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="region">Región</Label>
                      <Select
                        value={selectedRegionId ? selectedRegionId.toString() : ''}
                        onValueChange={(value) => {
                          setSelectedRegionId(parseInt(value))
                          setFormData({ ...formData, id_comuna: 0 })
                        }}
                      >
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
                      <Select
                        disabled={!selectedRegionId}
                        value={formData.id_comuna ? formData.id_comuna.toString() : ''}
                        onValueChange={(value) => setFormData({ ...formData, id_comuna: parseInt(value) })}
                      >
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

                  <div className="space-y-2">
                    <Label htmlFor="comentarios">Instrucciones o Notas de Entrega (Opcional)</Label>
                    <Textarea
                      id="comentarios"
                      name="comentarios"
                      value={formData.comentarios}
                      onChange={(e) => setFormData({ ...formData, comentarios: e.target.value })}
                      placeholder="Ej: Dejar en portería, portón verde, llamar por teléfono al llegar..."
                      maxLength={300}
                      className="min-h-[80px] resize-none"
                    />
                  </div>

                  {validationError && (
                    <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium mb-4">
                      {validationError}
                    </div>
                  )}

                  <Button className="w-full" onClick={handleContinueToStep2} disabled={hasAnyStockError}>
                    Continuar al Envio
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Shipping */}
            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Metodo de Envio
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup value={shippingMethod} onValueChange={setShippingMethod}>
                    <div
                      className={`flex items-center justify-between rounded-lg border p-4 cursor-pointer ${
                        shippingMethod === 'standard' ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => setShippingMethod('standard')}
                    >
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="standard" id="standard" />
                        <div>
                          <Label htmlFor="standard" className="cursor-pointer font-medium">
                            Envio Estandar
                          </Label>
                          <p className="text-sm text-muted-foreground">5-10 dias habiles</p>
                        </div>
                      </div>
                      <span className="font-medium">
                        {total >= 50000 ? 'Gratis' : formatPrice(4990)}
                      </span>
                    </div>

                    <div
                      className={`flex items-center justify-between rounded-lg border p-4 cursor-pointer ${
                        shippingMethod === 'express' ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => setShippingMethod('express')}
                    >
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="express" id="express" />
                        <div>
                          <Label htmlFor="express" className="cursor-pointer font-medium">
                            Envio Express
                          </Label>
                          <p className="text-sm text-muted-foreground">2-3 dias habiles</p>
                        </div>
                      </div>
                      <span className="font-medium">{formatPrice(7990)}</span>
                    </div>
                  </RadioGroup>

                  <div className="flex gap-3 pt-4">
                    <Button variant="outline" onClick={() => setStep(1)}>
                      Volver
                    </Button>
                    <Button className="flex-1" onClick={() => setStep(3)} disabled={hasAnyStockError}>
                      Continuar al Pago
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Metodo de Pago
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div
                      className={`flex items-center gap-3 rounded-lg border p-4 cursor-pointer ${
                        paymentMethod === 'webpay' ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => setPaymentMethod('webpay')}
                    >
                      <RadioGroupItem value="webpay" id="webpay" />
                      <div>
                        <Label htmlFor="webpay" className="cursor-pointer font-medium">
                          Webpay Plus
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Pago seguro con tarjeta de credito o debito
                        </p>
                      </div>
                    </div>


                  </RadioGroup>

                  {checkoutError && (
                    <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium mb-4">
                      {checkoutError}
                    </div>
                  )}
                  <div className="flex gap-3 pt-4">
                    <Button variant="outline" onClick={() => setStep(2)}>
                      Volver
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={handleSubmit}
                      disabled={isProcessing || hasAnyStockError}
                    >
                      {isProcessing ? 'Procesando...' : `Pagar ${formatPrice(finalTotal)}`}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Resumen del Pedido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={`${item.producto.id}-${item.talla}-${item.color}`}
                      className="flex gap-3"
                    >
                      <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden relative">
                        {(() => {
                          const { producto, color } = item
                          let activeImage = '/placeholder.jpg'
                          if (color && producto.imagenesPorColor) {
                            const activeColorLower = color.toLowerCase().trim()
                            const matchingKey = Object.keys(producto.imagenesPorColor).find(
                              key => key.toLowerCase().trim() === activeColorLower
                            )
                            if (matchingKey) {
                              const imagesForColor = producto.imagenesPorColor[matchingKey]
                              if (imagesForColor && imagesForColor.length > 0) {
                                activeImage = imagesForColor[0]
                              }
                            }
                          }
                          if (activeImage === '/placeholder.jpg' && producto.imagenes && producto.imagenes.length > 0) {
                            activeImage = producto.imagenes[0]
                          }

                          return activeImage && activeImage !== '/placeholder.jpg' ? (
                            <img
                              src={activeImage}
                              alt={producto.nombre}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                          )
                        })()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.producto.nombre}</p>
                        <p className="text-xs text-muted-foreground">
                          Talla: {item.talla} | Color: {item.color} | Cant: {item.cantidad}
                        </p>
                        {(() => {
                          const check = stockChecks.find(c => c.id === item.producto.id && c.talla === item.talla && c.color === item.color)
                          if (check && !check.hasEnoughStock) {
                            return (
                              <p className="text-[11px] text-rose-600 font-semibold mt-0.5">
                                {check.stock === 0 ? '¡Sin stock disponible!' : `Solo quedan ${check.stock} unidades`}
                              </p>
                            )
                          }
                          return null
                        })()}
                        <p className="text-sm font-medium mt-1">
                          {formatPrice(item.producto.precio * item.cantidad)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Envio</span>
                    <span>{shippingCost === 0 ? 'Gratis' : formatPrice(shippingCost)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium text-base">
                    <span>Total</span>
                    <span>{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                {total < 50000 && (
                  <p className="mt-4 text-xs text-muted-foreground text-center">
                    Agrega {formatPrice(50000 - total)} mas para obtener envio gratis!
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
