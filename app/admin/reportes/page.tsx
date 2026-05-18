'use client'

import { useState } from 'react'
import { Download, Package, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getReporteInventario, getReporteVentas } from '@/app/actions/reportes'

export default function ReportesPage() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loadingInventario, setLoadingInventario] = useState(false)
  const [loadingVentas, setLoadingVentas] = useState(false)

  const downloadCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      alert("No hay datos para este reporte.")
      return;
    }
    
    // Obtener las cabeceras
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          let cell = row[header] === null || row[header] === undefined ? '' : row[header];
          // Escapar comillas dobles y envolver en comillas dobles
          cell = String(cell).replace(/"/g, '""');
          return `"${cell}"`;
        }).join(',')
      )
    ].join('\n');

    // Añadir BOM (Byte Order Mark) para que Excel reconozca correctamente la codificación UTF-8
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8;' });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const handleDescargarInventario = async () => {
    setLoadingInventario(true)
    try {
      const data = await getReporteInventario()
      downloadCSV(data, `reporte_inventario_${new Date().toISOString().split('T')[0]}.csv`)
    } catch (error) {
      console.error(error)
      alert("Hubo un error al generar el reporte.")
    } finally {
      setLoadingInventario(false)
    }
  }

  const handleDescargarVentas = async () => {
    if (!startDate || !endDate) {
      alert("Por favor selecciona ambas fechas.")
      return;
    }
    setLoadingVentas(true)
    try {
      const data = await getReporteVentas(startDate, endDate)
      downloadCSV(data, `reporte_ventas_${startDate}_al_${endDate}.csv`)
    } catch (error) {
      console.error(error)
      alert("Hubo un error al generar el reporte.")
    } finally {
      setLoadingVentas(false)
    }
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Reportes</h1>
        <p className="text-muted-foreground mt-1">
          Exporta información clave de tu tienda para contabilidad o análisis en Excel.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Inventario */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-1">
              <Package className="h-5 w-5 text-primary" />
              <CardTitle>Reporte de Inventario</CardTitle>
            </div>
            <CardDescription>
              Descarga un listado completo con el stock actual de todas las variantes (talla, color, modelo) de tu bodega.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleDescargarInventario} disabled={loadingInventario} className="w-full sm:w-auto">
              <Download className="mr-2 h-4 w-4" />
              {loadingInventario ? 'Generando...' : 'Descargar Inventario (CSV)'}
            </Button>
          </CardContent>
        </Card>

        {/* Ventas */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-5 w-5 text-primary" />
              <CardTitle>Reporte de Ventas</CardTitle>
            </div>
            <CardDescription>
              Selecciona un rango de fechas para descargar todas las transacciones, pedidos y totales realizados en la tienda.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Desde</Label>
                <Input 
                  id="start-date" 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">Hasta</Label>
                <Input 
                  id="end-date" 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={handleDescargarVentas} disabled={loadingVentas} className="w-full sm:w-auto">
              <Download className="mr-2 h-4 w-4" />
              {loadingVentas ? 'Generando...' : 'Descargar Ventas (CSV)'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
