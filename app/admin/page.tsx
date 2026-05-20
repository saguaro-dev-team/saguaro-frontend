'use client'

import { useState } from 'react'
import { Calendar, Download, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { KPICards } from '@/components/dashboard/kpi-cards'
import { SalesChart } from '@/components/dashboard/sales-chart'
import { TopProducts } from '@/components/dashboard/top-products'
import { CriticalStock } from '@/components/dashboard/critical-stock'
import { RecentOrders } from '@/components/dashboard/recent-orders'
import { CategoryChart } from '@/components/dashboard/category-chart'
import { HourlyChart } from '@/components/dashboard/hourly-chart'
import { useEffect } from 'react'
import { 
  getKpiData, 
  getVentasMensuales, 
  getProductosVendidos, 
  getStockCritico, 
  getPedidosRecientes, 
  getVentasPorCategoria, 
  getVentasPorHora 
} from '@/app/actions/dashboard'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

export default function AdminDashboardPage() {
  const [period, setPeriod] = useState('month')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [data, setData] = useState<any>({
    kpi: null, ventasMensuales: [], productosVendidos: [], stockCritico: [], 
    pedidosRecientes: [], ventasPorCategoria: [], ventasPorHora: []
  })

  const { toast } = useToast()

  const loadData = async () => {
    setIsRefreshing(true)
    try {
      const [kpi, vMensuales, pVendidos, sCritico, pRecientes, vCategoria, vHora] = await Promise.all([
        getKpiData(),
        getVentasMensuales(),
        getProductosVendidos(),
        getStockCritico(),
        getPedidosRecientes(),
        getVentasPorCategoria(),
        getVentasPorHora()
      ])
      setData({
        kpi, ventasMensuales: vMensuales, productosVendidos: pVendidos, 
        stockCritico: sCritico, pedidosRecientes: pRecientes, 
        ventasPorCategoria: vCategoria, ventasPorHora: vHora
      })
    } catch (e) {
      console.error(e)
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleRefresh = async () => {
    await loadData()
  }

  const exportToCSV = () => {
    if (!data.kpi) {
      toast({
        title: "Error",
        description: "No hay datos de métricas disponibles para exportar.",
        variant: "destructive"
      })
      return
    }

    try {
      let csvContent = "\uFEFF" // UTF-8 BOM so Excel opens it with correct accents
      
      // Header
      csvContent += `REPORTE DE RENDIMIENTO - SAGUARO BAREFOOT\n`
      csvContent += `Fecha de Generación,${new Date().toLocaleString()}\n`
      const periodLabel = period === 'today' ? 'Hoy' : period === 'week' ? 'Esta Semana' : period === 'month' ? 'Este Mes' : period === 'quarter' ? 'Trimestre' : 'Este Año'
      csvContent += `Periodo Seleccionado,${periodLabel}\n\n`
      
      // Section 1: KPIs
      csvContent += `--- RESUMEN DE RENDIMIENTO (KPIs) ---\n`
      csvContent += `Métrica,Valor\n`
      csvContent += `Total Ventas,$${data.kpi.totalVentas.toLocaleString('es-CL')}\n`
      csvContent += `Total Pedidos,${data.kpi.totalPedidos}\n`
      csvContent += `Ticket Promedio,$${data.kpi.ticketPromedio.toLocaleString('es-CL')}\n`
      csvContent += `Clientes Registrados,${data.kpi.clientesRegistrados}\n`
      csvContent += `Tasa de Conversión (%),${data.kpi.tasaConversion}%\n`
      csvContent += `Productos con Stock Crítico,${data.kpi.productosConStockCritico}\n\n`
      
      // Section 2: Ventas Mensuales
      csvContent += `--- HISTORIAL DE VENTAS MENSUALES ---\n`
      csvContent += `Mes,Ventas Totales ($),Cantidad Pedidos\n`
      data.ventasMensuales.forEach((v: any) => {
        csvContent += `"${v.mes}",${v.ventas},${v.pedidos}\n`
      })
      csvContent += `\n`

      // Section 3: Ventas Por Categoría
      csvContent += `--- VENTAS POR CATEGORÍA ---\n`
      csvContent += `Categoría,Ventas ($),Porcentaje (%)\n`
      data.ventasPorCategoria.forEach((c: any) => {
        csvContent += `"${c.categoria}",${c.ventas},${c.porcentaje}%\n`
      })
      csvContent += `\n`

      // Section 4: Top Productos
      csvContent += `--- PRODUCTOS MÁS VENDIDOS ---\n`
      csvContent += `Nombre Producto,Cantidad Vendida,Ingresos Totales ($),Categoría\n`
      data.productosVendidos.forEach((p: any) => {
        csvContent += `"${p.nombre}",${p.cantidad},${p.ingresos},"${p.categoria}"\n`
      })
      csvContent += `\n`

      // Section 5: Stock Crítico
      csvContent += `--- INVENTARIO CON STOCK CRÍTICO ---\n`
      csvContent += `Producto,Stock Actual,Venta Diaria Estimada,Días Estimados para Agotar\n`
      data.stockCritico.forEach((s: any) => {
        csvContent += `"${s.nombre}",${s.stock},${s.velocidadVenta.toFixed(2)},${Math.round(s.diasRestantes)}\n`
      })
      csvContent += `\n`

      // Section 6: Pedidos Recientes
      csvContent += `--- PEDIDOS RECIENTES ---\n`
      csvContent += `ID Pedido,Fecha,Cliente,Total Pagado ($),Estado\n`
      data.pedidosRecientes.forEach((pr: any) => {
        csvContent += `"${pr.id_pedido}","${pr.fecha_pedido.substring(0, 10)}","${pr.cliente}",${pr.total_pagado},"${pr.estado_pedido}"\n`
      })
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `reporte_saguaro_${period}_${new Date().toISOString().slice(0, 10)}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Exportación exitosa",
        description: "El reporte consolidado en formato Excel (CSV) se ha descargado correctamente."
      })
    } catch (e: any) {
      console.error(e)
      toast({
        title: "Error al exportar",
        description: "Hubo un problema al generar el archivo Excel (CSV).",
        variant: "destructive"
      })
    }
  }

  const handlePrint = () => {
    toast({
      title: "Generando PDF",
      description: "Preparando la vista optimizada de impresión..."
    })
    setTimeout(() => {
      window.print()
    }, 500)
  }

  if (!data.kpi && isRefreshing) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Cargando métricas de la tienda...</div>
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Estilos específicos para ocultar elementos al imprimir */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          aside, header, nav, button, [data-slot="sidebar"], .no-print, [role="menu"], [data-slot="dropdown-menu"] {
            display: none !important;
          }
          main, .print-full {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .grid {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
          }
          .lg\\:grid-cols-3 {
            grid-template-columns: 1fr 1fr !important;
          }
          .md\\:grid-cols-2 {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}} />

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Dashboard de Business Intelligence
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitorea el rendimiento de tu tienda en tiempo real
          </p>
        </div>

        <div className="flex items-center gap-3 no-print">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoy</SelectItem>
              <SelectItem value="week">Esta Semana</SelectItem>
              <SelectItem value="month">Este Mes</SelectItem>
              <SelectItem value="quarter">Trimestre</SelectItem>
              <SelectItem value="year">Este Año</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="sr-only">Actualizar</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={!data.kpi}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px]">
              <DropdownMenuLabel>Opciones de Reporte</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={exportToCSV} className="cursor-pointer">
                Excel (CSV)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handlePrint} className="cursor-pointer">
                Imprimir / PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* KPI Cards */}
      <KPICards data={data.kpi || {
        ticketPromedio: 0, totalVentas: 0, totalPedidos: 0, 
        clientesRegistrados: 0, tasaConversion: 0, productosConStockCritico: 0
      }} />

      {/* Charts Row 1 */}
      <div className="grid gap-6 mt-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SalesChart data={data.ventasMensuales} />
        </div>
        <div>
          <CategoryChart data={data.ventasPorCategoria} />
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 mt-6 md:grid-cols-2 lg:grid-cols-3">
        <TopProducts data={data.productosVendidos} />
        <CriticalStock data={data.stockCritico} />
        <HourlyChart data={data.ventasPorHora} />
      </div>

      {/* Recent Orders */}
      <div className="mt-6">
        <RecentOrders data={data.pedidosRecientes} />
      </div>
    </div>
  )
}
