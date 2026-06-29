'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { useAuth } from '@/lib/auth-context'
import { getRegiones } from '@/app/actions/location'
import { checkEmailOrRutExists } from '@/app/actions/auth'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { formatRut, validateRut } from '@/lib/utils'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'



function RegisterContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get('redirect') || '/'
  const { register, isAuthenticated } = useAuth()
  
  useEffect(() => {
    if (isAuthenticated) {
      window.location.href = redirectUrl
    }
    // Cargar regiones
    getRegiones().then(res => {
      if (res.success && res.regiones) {
        setRegionesData(res.regiones)
      }
    })
  }, [isAuthenticated, redirectUrl])
  
  const [formData, setFormData] = useState({
    nombres: '',
    primer_apellido: '',
    segundo_apellido: '',
    email: '',
    rut: '',
    telefono: '',
    genero: '',
    fecha_nacimiento: '',
    password: '',
    confirmPassword: '',
    calle: '',
    numero: '',
    id_comuna: 0,
    detalles: '',
  })
  const [regionesData, setRegionesData] = useState<any[]>([])
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Real-time validation states
  const [emailError, setEmailError] = useState('')
  const [isValidatingEmail, setIsValidatingEmail] = useState(false)
  const [rutError, setRutError] = useState('')
  const [isValidatingRut, setIsValidatingRut] = useState(false)

  // Debounced Email validation
  useEffect(() => {
    if (!formData.email) {
      setEmailError('')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setEmailError('Formato de correo no válido')
      return
    }

    setEmailError('')
    setIsValidatingEmail(true)
    const delayDebounceFn = setTimeout(async () => {
      const res = await checkEmailOrRutExists(formData.email, undefined)
      if (res.exists && res.emailExists) {
        setEmailError('Este correo electrónico ya está registrado')
      } else {
        setEmailError('')
      }
      setIsValidatingEmail(false)
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [formData.email])

  // Debounced RUT validation
  useEffect(() => {
    if (!formData.rut) {
      setRutError('')
      return
    }

    const cleanRut = formData.rut.replace(/[^0-9kK]/g, '')
    if (cleanRut.length < 8) {
      setRutError('RUT incompleto')
      return
    }

    if (!validateRut(formData.rut)) {
      setRutError('RUT no es válido')
      return
    }

    setRutError('')
    setIsValidatingRut(true)
    const delayDebounceFn = setTimeout(async () => {
      const res = await checkEmailOrRutExists(undefined, formData.rut)
      if (res.exists && res.rutExists) {
        setRutError('Este RUT ya está registrado')
      } else {
        setRutError('')
      }
      setIsValidatingRut(false)
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [formData.rut])

  const hasErrors = !!emailError || !!rutError || isValidatingEmail || isValidatingRut


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (hasErrors) {
      setError('Por favor corrige las alertas en el formulario antes de continuar.')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    if (!acceptTerms) {
      setError('Debes aceptar los terminos y condiciones')
      return
    }

    if (!validateRut(formData.rut)) {
      setError('El RUT ingresado no es válido')
      return
    }

    setIsLoading(true)


    const result = await register({
      email: formData.email,
      password: formData.password,
      nombres: formData.nombres,
      primer_apellido: formData.primer_apellido,
      segundo_apellido: formData.segundo_apellido,
      rut: formData.rut,
      telefono: formData.telefono,
      genero: formData.genero,
      fecha_nacimiento: formData.fecha_nacimiento,
      calle: formData.calle,
      numero: formData.numero,
      id_comuna: formData.id_comuna,
      detalles: formData.detalles
    })
    if (result.success) {
      window.location.href = redirectUrl
    } else {
      setError(result.error || 'Ocurrió un error en el registro')
    }
    
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-muted/30">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <Image
              src="/images/saguarologo.png"
              alt="Saguaro Chile"
              width={300}
              height={90}
              className="h-20 w-auto mx-auto"
            />
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Crear Cuenta</CardTitle>
            <CardDescription>
              Registrate para acceder a ofertas exclusivas y seguir tus pedidos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {redirectUrl === '/checkout' && (
                <div className="rounded-lg bg-amber-50/80 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/30 p-3 text-sm text-amber-800 dark:text-amber-300 flex items-start gap-2">
                  <Info className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                  <span>
                    Debes registrarte para continuar con tu compra.
                  </span>
                </div>
              )}
              {error && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="nombres">Nombres</Label>
                <Input
                  id="nombres"
                  name="nombres"
                  placeholder="Juan Andres"
                  value={formData.nombres}
                  onChange={handleChange}
                  maxLength={100}
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="primer_apellido">Primer Apellido</Label>
                  <Input
                    id="primer_apellido"
                    name="primer_apellido"
                    placeholder="Perez"
                    value={formData.primer_apellido}
                    onChange={handleChange}
                    maxLength={50}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="segundo_apellido">Segundo Apellido</Label>
                  <Input
                    id="segundo_apellido"
                    name="segundo_apellido"
                    placeholder="Soto"
                    value={formData.segundo_apellido}
                    onChange={handleChange}
                    maxLength={50}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  maxLength={100}
                  required
                  className={emailError ? 'border-destructive focus-visible:ring-destructive' : ''}
                />
                {isValidatingEmail && (
                  <p className="text-[11px] text-muted-foreground animate-pulse">Validando disponibilidad...</p>
                )}
                {emailError && (
                  <p className="text-[11px] text-destructive font-medium">{emailError}</p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="rut">RUT</Label>
                  <Input
                    id="rut"
                    name="rut"
                    type="text"
                    placeholder="12.345.678-9"
                    value={formData.rut}
                    onChange={(e) => {
                      const formatted = formatRut(e.target.value);
                      if (formatted.length <= 12) {
                        setFormData({ ...formData, rut: formatted });
                      }
                    }}
                    maxLength={12}
                    required
                    className={rutError ? 'border-destructive focus-visible:ring-destructive' : ''}
                  />
                  {isValidatingRut && (
                    <p className="text-[11px] text-muted-foreground animate-pulse">Validando disponibilidad...</p>
                  )}
                  {rutError && (
                    <p className="text-[11px] text-destructive font-medium">{rutError}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    name="telefono"
                    type="tel"
                    placeholder="912345678"
                    value={formData.telefono}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setFormData({ ...formData, telefono: val });
                    }}
                    maxLength={9}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
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
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="genero">Género</Label>
                  <select
                    id="genero"
                    name="genero"
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.genero}
                    onChange={(e) => setFormData({ ...formData, genero: e.target.value })}
                    required
                  >
                    <option value="">Selecciona...</option>
                    <option value="Femenino">Femenino</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Otro">Otro</option>
                    <option value="Prefiero no decirlo">Prefiero no decirlo</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="********"
                    value={formData.password}
                    onChange={handleChange}
                    maxLength={50}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="********"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  maxLength={50}
                  required
                />
              </div>

              <Separator className="my-4" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Dirección de Despacho</h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="region">Región</Label>
                  <Select required onValueChange={(val) => {
                    setSelectedRegionId(parseInt(val))
                    setFormData({...formData, id_comuna: 0})
                  }}>
                    <SelectTrigger id="region">
                      <SelectValue placeholder="Selecciona..." />
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
                  <Select required disabled={!selectedRegionId} value={formData.id_comuna ? formData.id_comuna.toString() : ''} onValueChange={(val) => setFormData({...formData, id_comuna: parseInt(val)})}>
                    <SelectTrigger id="comuna">
                      <SelectValue placeholder="Selecciona..." />
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

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="calle">Calle</Label>
                  <Input id="calle" name="calle" placeholder="Ej: Av. Providencia" value={formData.calle} onChange={handleChange} maxLength={100} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numero">Número</Label>
                  <Input id="numero" name="numero" placeholder="1234" value={formData.numero} onChange={handleChange} maxLength={10} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="detalles">Depto / Casa / Referencia (Opcional)</Label>
                <Input id="detalles" name="detalles" placeholder="Depto 402, Block B..." value={formData.detalles} onChange={handleChange} maxLength={100} />
              </div>

              <label className="flex items-start gap-2 cursor-pointer">
                <Checkbox
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                  className="mt-1"
                />
                <span className="text-sm text-muted-foreground">
                  Acepto los{' '}
                  <Link href="/terminos" className="text-primary hover:underline">
                    terminos y condiciones
                  </Link>{' '}
                  y la{' '}
                  <Link href="/privacidad" className="text-primary hover:underline">
                    politica de privacidad
                  </Link>
                </span>
              </label>

              <Button type="submit" className="w-full" disabled={isLoading || hasErrors}>
                {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              Ya tienes cuenta?{' '}
              <Link href={`/login${redirectUrl !== '/' ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`} className="text-primary hover:underline font-medium">
                Iniciar sesion
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground">Cargando...</div>}>
      <RegisterContent />
    </Suspense>
  )
}
