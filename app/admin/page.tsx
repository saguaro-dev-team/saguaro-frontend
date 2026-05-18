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
import Link from 'next/link'

export default function AdminDashboardPage() {
  const [period, setPeriod] = useState('month')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [data, setData] = useState<any>({
    kpi: null, ventasMensuales: [], productosVendidos: [], stockCritico: [], 
    pedidosRecientes: [], ventasPorCategoria: [], ventasPorHora: []
  })

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

  if (!data.kpi && isRefreshing) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Cargando métricas de la tienda...</div>
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
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

        <div className="flex items-center gap-3">
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
              <SelectItem value="year">Este Ano</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="sr-only">Actualizar</span>
          </Button>

          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
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
