'use client'

import { useState, useEffect } from 'react'
import { Search, ShieldAlert, Calendar, ArrowRight, RefreshCw, FileDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getAuditoriaStock } from '@/app/actions/auditoria'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function AuditoriaStockPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [actionFilter, setActionFilter] = useState('all')

  const downloadPDF = () => {
    const doc = new jsPDF()

    // Add title
    doc.setFontSize(18)
    doc.text('Reporte de Auditoria de Stock - Saguaro', 14, 22)
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Fecha de generacion: ${new Date().toLocaleString('es-CL')}`, 14, 28)
    doc.text(`Registros mostrados: ${filteredLogs.length}`, 14, 33)

    // Define table columns
    const tableColumn = ["Fecha y Hora", "Administrador", "Accion", "Producto", "SKU", "Detalles del Cambio", "Variacion"]
    
    // Define table rows
    const tableRows = filteredLogs.map(log => {
      const dateFormatted = new Date(log.fecha_cambio).toLocaleString('es-CL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
      const adminInfo = `${log.nombre_usuario} (${log.email_usuario})`
      const diff = log.stock_nuevo - log.stock_anterior
      const variationStr = `${log.stock_anterior} -> ${log.stock_nuevo} (${diff > 0 ? '+' : ''}${diff})`
      const productName = log.nombre_producto || 'Desconocido'
      
      return [
        dateFormatted,
        adminInfo,
        log.accion,
        productName,
        log.sku_producto || 'N/A',
        log.detalles,
        variationStr
      ]
    })

    // Start autoTable
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [79, 70, 229] }, // matching indigo/violet primary color
      columnStyles: {
        0: { cellWidth: 28 },
        1: { cellWidth: 32 },
        2: { cellWidth: 15, halign: 'center' },
        3: { cellWidth: 30 },
        4: { cellWidth: 20 },
        5: { cellWidth: 'auto' },
        6: { cellWidth: 22, halign: 'right' }
      }
    })

    // Save the PDF
    doc.save(`auditoria-stock-${Date.now()}.pdf`)
  }

  const fetchLogs = () => {
    setLoading(true)
    getAuditoriaStock().then(res => {
      if (res.success && res.logs) {
        setLogs(res.logs)
      }
      setLoading(false)
    })
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.sku_producto.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.nombre_producto && log.nombre_producto.toLowerCase().includes(searchQuery.toLowerCase())) ||
      log.nombre_usuario.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.email_usuario.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.detalles.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesAction = actionFilter === 'all' || log.accion === actionFilter
    
    return matchesSearch && matchesAction
  })

  const getActionBadge = (accion: string) => {
    switch (accion) {
      case 'CREAR':
        return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold border-none">CREAR</Badge>
      case 'AGREGAR':
        return <Badge className="bg-blue-500 hover:bg-blue-600 text-white font-semibold border-none">AGREGAR</Badge>
      case 'RETIRAR':
        return <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-semibold border-none">RETIRAR</Badge>
      case 'MODIFICAR':
        return <Badge className="bg-purple-500 hover:bg-purple-600 text-white font-semibold border-none">MODIFICAR</Badge>
      default:
        return <Badge variant="secondary">{accion}</Badge>
    }
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Auditoría de Stock
            </h1>
            <Badge variant="outline" className="border-amber-500/30 text-amber-600 bg-amber-50/50 dark:bg-amber-950/20 dark:text-amber-400 gap-1 text-[11px] font-semibold py-0.5 px-2">
              <ShieldAlert className="h-3 w-3" /> Solo Lectura (Inmutable)
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Registro histórico de cambios en el inventario de la tienda para propósitos de control y transparencia.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={downloadPDF} className="gap-2">
            <FileDown className="h-4 w-4" />
            Descargar PDF
          </Button>
          <Button variant="outline" size="sm" onClick={fetchLogs} disabled={loading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar logs
          </Button>
        </div>
      </div>

      {/* Info Warning Banner */}
      <div className="bg-blue-50/50 dark:bg-blue-950/10 border border-blue-200/50 dark:border-blue-900/30 p-4 rounded-xl text-sm text-blue-800 dark:text-blue-300 flex items-start gap-3">
        <ShieldAlert className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold mb-0.5">Nota Ética e Integridad del Sistema</p>
          <p className="text-[13px] opacity-90">
            Este registro de auditoría es **estrictamente de solo lectura y no editable**. No existen opciones de edición, eliminación o alteración de registros en esta sección, asegurando que el historial de modificaciones sea transparente e incorruptible para todos los administradores.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por SKU, administrador, detalles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por Acción" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las acciones</SelectItem>
            <SelectItem value="CREAR">CREAR</SelectItem>
            <SelectItem value="AGREGAR">AGREGAR</SelectItem>
            <SelectItem value="RETIRAR">RETIRAR</SelectItem>
            <SelectItem value="MODIFICAR">MODIFICAR</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table Content */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3 border-b bg-muted/10">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Historial de Auditoría</CardTitle>
              <CardDescription>Visualización detallada de acciones logísticas</CardDescription>
            </div>
            <div className="text-xs text-muted-foreground font-medium">
              Mostrando {filteredLogs.length} registros
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-[180px]">Fecha y Hora</TableHead>
                <TableHead className="w-[200px]">Administrador</TableHead>
                <TableHead className="w-[100px] text-center">Acción</TableHead>
                <TableHead className="w-[180px]">Producto</TableHead>
                <TableHead className="w-[120px]">SKU Producto</TableHead>
                <TableHead>Detalles del Cambio</TableHead>
                <TableHead className="w-[160px] text-right">Variación Stock</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    <span className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent inline-block mb-2" />
                    <p className="text-sm font-medium">Cargando registros de auditoría...</p>
                  </TableCell>
                </TableRow>
              ) : filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    <p className="text-sm font-medium">No se encontraron registros de auditoría.</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => {
                  const diff = log.stock_nuevo - log.stock_anterior
                  const isPositive = diff > 0
                  const isZero = diff === 0
                  
                  return (
                    <TableRow key={log.id_auditoria} className="hover:bg-muted/10 transition-colors">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>
                            {new Date(log.fecha_cambio).toLocaleString('es-CL', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit'
                            })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-semibold text-sm text-foreground">{log.nombre_usuario}</p>
                          <p className="text-xs text-muted-foreground">{log.email_usuario}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {getActionBadge(log.accion)}
                      </TableCell>
                      <TableCell className="text-sm font-semibold text-foreground">
                        {log.nombre_producto || 'Desconocido'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-[11px] font-semibold bg-muted/50">
                          {log.sku_producto || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground font-medium max-w-xs md:max-w-md lg:max-w-lg">
                        {log.detalles}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <div className="text-xs text-muted-foreground font-mono">
                            {log.stock_anterior} <ArrowRight className="h-3 w-3 inline mx-0.5" /> {log.stock_nuevo}
                          </div>
                          {!isZero && (
                            <Badge 
                              className={`font-mono text-xs font-bold ${
                                isPositive 
                                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' 
                                  : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20'
                              }`} 
                              variant="outline"
                            >
                              {isPositive ? `+${diff}` : diff}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
