'use client'

import { useState, useEffect } from 'react'
import { Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { getConfiguracion, updateConfiguracion } from '@/app/actions/admin'

export default function ConfigPage() {
  const [envio, setEnvio] = useState('')
  const [devoluciones, setDevoluciones] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getConfiguracion().then((data) => {
      if (data) {
        setEnvio(data.politica_envio || '')
        setDevoluciones(data.politica_devoluciones || '')
      }
      setLoading(false)
    })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const res = await updateConfiguracion(envio, devoluciones)
    if (res.success) {
      alert("Configuración guardada exitosamente")
    } else {
      alert(res.error)
    }
    setSaving(false)
  }

  if (loading) {
    return <div className="p-8 text-muted-foreground">Cargando configuración...</div>
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Configuración de la Tienda
        </h1>
        <p className="text-muted-foreground mt-1">
          Administra los textos globales y políticas de tu tienda.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Política de Envío y Entrega</CardTitle>
            <CardDescription>
              Este texto aparecerá en la sección de envíos de todos los productos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea 
              value={envio}
              onChange={(e) => setEnvio(e.target.value)}
              placeholder="Ej: Envío gratis en compras sobre $50.000..."
              className="min-h-[150px]"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Política de Cambios y Devoluciones</CardTitle>
            <CardDescription>
              Este texto aparecerá en la sección de devoluciones de todos los productos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea 
              value={devoluciones}
              onChange={(e) => setDevoluciones(e.target.value)}
              placeholder="Ej: 30 días para realizar cambios o devoluciones..."
              className="min-h-[150px]"
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} size="lg">
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Guardando...' : 'Guardar Configuración'}
          </Button>
        </div>
      </div>
    </div>
  )
}
