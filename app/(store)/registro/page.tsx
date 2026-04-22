'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { useAuth } from '@/lib/auth-context'
import { getRegiones } from '@/app/actions/location'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function RegisterPage() {
  const router = useRouter()
  const { register, isAuthenticated } = useAuth()
  
  useEffect(() => {
    if (isAuthenticated) {
      window.location.href = '/'
    }
    // Cargar regiones
    getRegiones().then(res => {
      if (res.success && res.regiones) {
        setRegionesData(res.regiones)
      }
    })
  }, [isAuthenticated])
  
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

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

    setIsLoading(true)

    const result = await register({
      email: formData.email,
      password: formData.password,
      nombre: formData.nombre,
      apellido: formData.apellido,
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
      window.location.href = '/'
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
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo_2-emd0nRIpusHh6GoYU8XlNziXq5fEYd.jpg"
              alt="Saguaro Chile"
              width={180}
              height={54}
              className="h-12 w-auto mx-auto"
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
              {error && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input
                    id="nombre"
                    name="nombre"
                    placeholder="Juan"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellido">Apellido</Label>
                  <Input
                    id="apellido"
                    name="apellido"
                    placeholder="Perez"
                    value={formData.apellido}
                    onChange={handleChange}
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
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="rut">RUT</Label>
                  <Input
                    id="rut"
                    name="rut"
                    type="text"
                    placeholder="12345678-9"
                    value={formData.rut}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    name="telefono"
                    type="tel"
                    placeholder="+56 9 1234 5678"
                    value={formData.telefono}
                    onChange={handleChange}
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
                          {reg.nombre_region}
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
                          {com.nombre_comuna}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="calle">Calle</Label>
                  <Input id="calle" name="calle" placeholder="Ej: Av. Providencia" value={formData.calle} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numero">Número</Label>
                  <Input id="numero" name="numero" placeholder="1234" value={formData.numero} onChange={handleChange} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="detalles">Depto / Casa / Referencia (Opcional)</Label>
                <Input id="detalles" name="detalles" placeholder="Depto 402, Block B..." value={formData.detalles} onChange={handleChange} />
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

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              Ya tienes cuenta?{' '}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Iniciar sesion
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
