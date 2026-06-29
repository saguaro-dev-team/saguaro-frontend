'use server'

import { prisma } from '@/lib/prisma'
import type { 
  KPIData, 
  VentasMensuales, 
  ProductoVendido, 
  StockCritico 
} from '@/lib/types'

export type Period = 
  | 'today'          // Día de hoy (calendario)
  | 'yesterday'      // Día de ayer (calendario)
  | 'last24h'        // Últimas 24 horas (rodante)
  | 'week'           // Últimos 7 días (rodante)
  | 'last30'         // Últimos 30 días (rodante)
  | 'last90'         // Últimos 90 días (rodante)
  | 'last12m'        // Últimos 12 meses (rodante)
  | 'ytd'            // Todo el año hasta la fecha (YTD)
  | 'custom'         // Personalizado

export interface DashboardFilter {
  period: Period
  startDate?: string // YYYY-MM-DD
  endDate?: string   // YYYY-MM-DD
}

/** Retorna el rango de fechas (inicio y fin) según el período o filtro personalizado */
function getDateRange(filter: DashboardFilter): { dateFrom: Date, dateTo: Date } {
  const now = new Date()
  const dateTo = new Date(now)
  dateTo.setHours(23, 59, 59, 999) // Fin del día actual por defecto

  switch (filter.period) {
    case 'today': {
      const dateFrom = new Date(now)
      dateFrom.setHours(0, 0, 0, 0)
      return { dateFrom, dateTo }
    }
    case 'yesterday': {
      const dateFrom = new Date(now)
      dateFrom.setDate(dateFrom.getDate() - 1)
      dateFrom.setHours(0, 0, 0, 0)
      
      const yesterdayTo = new Date(now)
      yesterdayTo.setDate(yesterdayTo.getDate() - 1)
      yesterdayTo.setHours(23, 59, 59, 999)
      return { dateFrom, dateTo: yesterdayTo }
    }
    case 'last24h': {
      const dateFrom = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      return { dateFrom, dateTo: now }
    }
    case 'week': {
      const dateFrom = new Date(now)
      dateFrom.setDate(dateFrom.getDate() - 7)
      dateFrom.setHours(0, 0, 0, 0)
      return { dateFrom, dateTo }
    }
    case 'last30': {
      const dateFrom = new Date(now)
      dateFrom.setDate(dateFrom.getDate() - 30)
      dateFrom.setHours(0, 0, 0, 0)
      return { dateFrom, dateTo }
    }
    case 'last90': {
      const dateFrom = new Date(now)
      dateFrom.setDate(dateFrom.getDate() - 90)
      dateFrom.setHours(0, 0, 0, 0)
      return { dateFrom, dateTo }
    }
    case 'last12m': {
      const dateFrom = new Date(now)
      dateFrom.setFullYear(dateFrom.getFullYear() - 1)
      dateFrom.setHours(0, 0, 0, 0)
      return { dateFrom, dateTo }
    }
    case 'ytd': {
      const dateFrom = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0)
      return { dateFrom, dateTo }
    }
    case 'custom': {
      const dateFrom = filter.startDate ? new Date(filter.startDate + 'T00:00:00') : new Date(now)
      const customTo = filter.endDate ? new Date(filter.endDate + 'T23:59:59') : new Date(now)
      
      if (isNaN(dateFrom.getTime())) {
        dateFrom.setTime(now.getTime())
        dateFrom.setHours(0, 0, 0, 0)
      }
      if (isNaN(customTo.getTime())) {
        customTo.setTime(now.getTime())
        customTo.setHours(23, 59, 59, 999)
      }
      return { dateFrom, dateTo: customTo }
    }
    default: {
      const dateFrom = new Date(now)
      dateFrom.setDate(dateFrom.getDate() - 30)
      dateFrom.setHours(0, 0, 0, 0)
      return { dateFrom, dateTo }
    }
  }
}

export async function getKpiData(filter: DashboardFilter = { period: 'last30' }): Promise<KPIData> {
  const { dateFrom, dateTo } = getDateRange(filter)

  const pedidos = await prisma.pedido.findMany({
    where: { 
      estado: { in: ['pagado', 'preparando', 'enviado', 'entregado'] },
      fecha_pedido: { gte: dateFrom, lte: dateTo }
    }
  })
  
  const totalVentas = pedidos.reduce((acc, p) => acc + p.total, 0)
  const totalPedidos = pedidos.length
  const ticketPromedio = totalPedidos > 0 ? Math.round(totalVentas / totalPedidos) : 0
  
  // Clientes registrados: siempre total histórico (no filtrar por período)
  // Excluimos a los administradores (aquellos con rol 'admin')
  const clientes = await prisma.usuario.count({
    where: {
      OR: [
        { id_rol: null },
        {
          rol: {
            nombre_rol: {
              not: 'admin'
            }
          }
        }
      ]
    }
  })
  
  const criticos = await prisma.producto.count({
    where: { stock: { lt: 10 }, modelo: { activo: true } }
  })

  const totalVariantes = await prisma.producto.count({
    where: { modelo: { activo: true } }
  })

  return {
    ticketPromedio,
    totalVentas,
    totalPedidos,
    clientesRegistrados: clientes,
    tasaConversion: 2.5, 
    productosConStockCritico: criticos,
    totalVariantes
  }
}

export async function getVentasMensuales(filter: DashboardFilter = { period: 'last30' }): Promise<VentasMensuales[]> {
  const { dateFrom, dateTo } = getDateRange(filter)

  const pedidos = await prisma.pedido.findMany({
    where: { 
      estado: { in: ['pagado', 'preparando', 'enviado', 'entregado'] },
      fecha_pedido: { gte: dateFrom, lte: dateTo }
    },
    select: { fecha_pedido: true, total: true }
  })

  const diffTime = Math.abs(dateTo.getTime() - dateFrom.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  // 1. Agrupación por Hora (Rango de 2 días o menos)
  if (diffDays <= 2) {
    const hours = Array.from({length: 24}, (_, i) => i) // 00:00 a 23:00
    const hourMap = new Map<string, {ventas: number, pedidos: number}>()
    hours.forEach(h => hourMap.set(`${h.toString().padStart(2,'0')}:00`, { ventas: 0, pedidos: 0 }))
    pedidos.forEach(p => {
      const h = p.fecha_pedido.getHours()
      const key = `${h.toString().padStart(2,'0')}:00`
      if (hourMap.has(key)) {
        const d = hourMap.get(key)!
        d.ventas += p.total
        d.pedidos += 1
      }
    })
    return Array.from(hourMap.entries()).map(([mes, v]) => ({ mes, ...v }))
  }

  // 2. Agrupación por Día (Rango de 2 a 31 días)
  if (diffDays <= 31) {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    const dayMap = new Map<string, {ventas: number, pedidos: number}>()
    
    const temp = new Date(dateFrom)
    while (temp <= dateTo) {
      const key = `${days[temp.getDay()]} ${temp.getDate()}`
      dayMap.set(key, { ventas: 0, pedidos: 0 })
      temp.setDate(temp.getDate() + 1)
    }

    pedidos.forEach(p => {
      const d = p.fecha_pedido
      const key = `${days[d.getDay()]} ${d.getDate()}`
      if (dayMap.has(key)) {
        const data = dayMap.get(key)!
        data.ventas += p.total
        data.pedidos += 1
      }
    })
    return Array.from(dayMap.entries()).map(([mes, v]) => ({ mes, ...v }))
  }

  // 3. Agrupación por Mes (Rango mayor a 31 días)
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  const map = new Map<string, {ventas: number, pedidos: number}>()
  
  const temp = new Date(dateFrom)
  temp.setDate(1) // primer día del mes
  
  let iterations = 0
  while (temp <= dateTo && iterations < 36) {
    const label = `${meses[temp.getMonth()]} ${temp.getFullYear().toString().substring(2)}`
    map.set(label, { ventas: 0, pedidos: 0 })
    temp.setMonth(temp.getMonth() + 1)
    iterations++
  }
  
  if (map.size === 0) {
    meses.forEach(m => map.set(m, { ventas: 0, pedidos: 0 }))
    pedidos.forEach(p => {
      const mesIndex = p.fecha_pedido.getMonth()
      const mes = meses[mesIndex]
      const data = map.get(mes)!
      data.ventas += p.total
      data.pedidos += 1
    })
    return meses.map(mes => ({
      mes,
      ventas: map.get(mes)!.ventas,
      pedidos: map.get(mes)!.pedidos
    }))
  }

  pedidos.forEach(p => {
    const d = p.fecha_pedido
    const label = `${meses[d.getMonth()]} ${d.getFullYear().toString().substring(2)}`
    if (map.has(label)) {
      const data = map.get(label)!
      data.ventas += p.total
      data.pedidos += 1
    }
  })
  return Array.from(map.entries()).map(([mes, v]) => ({ mes, ...v }))
}

export async function getProductosVendidos(filter: DashboardFilter = { period: 'last30' }): Promise<ProductoVendido[]> {
  const { dateFrom, dateTo } = getDateRange(filter)

  const articulos = await prisma.articulo_pedido.findMany({
    where: {
      producto: { modelo: { activo: true } },
      pedido: { 
        fecha_pedido: { gte: dateFrom, lte: dateTo }, 
        estado: { in: ['pagado', 'preparando', 'enviado', 'entregado'] } 
      }
    },
    include: {
      producto: {
        include: { modelo: true }
      }
    }
  })

  const map = new Map<number, ProductoVendido>()

  articulos.forEach(art => {
    const id = art.producto.id_modelo
    if (!map.has(id)) {
      map.set(id, {
        nombre: art.producto.modelo.nombre_modelo,
        cantidad: 0,
        ingresos: 0,
        categoria: art.producto.modelo.tipo
      })
    }
    const val = map.get(id)!
    val.cantidad += art.cantidad
    val.ingresos += (art.cantidad * art.precio)
  })

  return Array.from(map.values())
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 5)
}

// Stock crítico no cambia según período — siempre es el estado actual del inventario
export async function getStockCritico(): Promise<StockCritico[]> {
  const criticos = await prisma.producto.findMany({
    where: { stock: { lt: 10 }, modelo: { activo: true } },
    include: {
      modelo: true,
      color: true,
      talla: true
    },
    orderBy: { stock: 'asc' }
  })

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const productIds = criticos.map(c => c.id_producto)

  const sales = await prisma.articulo_pedido.findMany({
    where: {
      id_producto: { in: productIds },
      pedido: {
        fecha_pedido: { gte: thirtyDaysAgo },
        estado: { in: ['pagado', 'preparando', 'enviado', 'entregado'] }
      }
    },
    select: {
      id_producto: true,
      cantidad: true
    }
  })

  const salesMap = new Map<number, number>()
  sales.forEach(s => {
    salesMap.set(s.id_producto, (salesMap.get(s.id_producto) || 0) + s.cantidad)
  })

  return criticos.map(c => {
    const totalSold = salesMap.get(c.id_producto) || 0
    const velocidadVenta = Math.max(0.1, totalSold / 30)
    const diasRestantes = c.stock / velocidadVenta

    return {
      id_producto: c.id_producto,
      nombre: `${c.modelo.nombre_modelo} - ${c.talla.nombre_talla} ${c.color.nombre_color}`,
      codigo_sku: c.codigo_sku,
      stock: c.stock,
      velocidadVenta,
      diasRestantes
    }
  })
}

export async function getVentasPorCategoria(filter: DashboardFilter = { period: 'last30' }) {
  const { dateFrom, dateTo } = getDateRange(filter)

  const articulos = await prisma.articulo_pedido.findMany({
    where: {
      producto: { modelo: { activo: true } },
      pedido: { 
        fecha_pedido: { gte: dateFrom, lte: dateTo }, 
        estado: { in: ['pagado', 'preparando', 'enviado', 'entregado'] } 
      }
    },
    include: {
      producto: {
        include: { 
          modelo: {
            include: { categoria: true }
          }
        }
      }
    }
  })

  let total = 0
  const map = new Map<string, number>()

  articulos.forEach(art => {
    const cat = art.producto.modelo.categoria.nombre_categoria
    const rev = art.cantidad * art.precio
    map.set(cat, (map.get(cat) || 0) + rev)
    total += rev
  })

  return Array.from(map.entries()).map(([categoria, ventas]) => ({
    categoria,
    ventas,
    porcentaje: total > 0 ? parseFloat(((ventas / total) * 100).toFixed(1)) : 0
  })).sort((a,b) => b.ventas - a.ventas)
}

export async function getPedidosRecientes(filter: DashboardFilter = { period: 'last30' }) {
  const { dateFrom, dateTo } = getDateRange(filter)

  const pedidos = await prisma.pedido.findMany({
    take: 10,
    orderBy: { fecha_pedido: 'desc' },
    where: { 
      fecha_pedido: { gte: dateFrom, lte: dateTo },
      estado: { not: 'cancelado' }
    },
    include: { usuario: true }
  })

  return pedidos.map(p => ({
    id_pedido: p.id_pedido,
    id_usuario: p.id_usuario,
    fecha_pedido: p.fecha_pedido.toISOString(),
    total_pagado: p.total,
    estado_pedido: p.estado,
    token_webpay: 'N/A',
    authorization_code: 'N/A',
    is_active: true,
    cliente: `${p.usuario?.nombres || 'Cliente'} ${p.usuario?.primer_apellido || 'Anónimo'}`
  }))
}

export async function getVentasPorHora(filter: DashboardFilter = { period: 'last30' }) {
  const { dateFrom, dateTo } = getDateRange(filter)

  const pedidos = await prisma.pedido.findMany({
    where: { 
      estado: { in: ['pagado', 'preparando', 'enviado', 'entregado'] },
      fecha_pedido: { gte: dateFrom, lte: dateTo }
    },
    select: { fecha_pedido: true }
  })

  // Chile está en UTC-4 (horario estándar) o UTC-3 (horario de verano).
  // Usamos UTC-4 como offset fijo para convertir la hora UTC almacenada en BD.
  const CHILE_OFFSET_HOURS = -4

  // Mostrar las 24 horas para no perder ninguna compra fuera de rango
  const allHours = Array.from({ length: 24 }, (_, i) => i)
  const map = new Map<number, number>()
  allHours.forEach(h => map.set(h, 0))

  pedidos.forEach(p => {
    // Convertir UTC a hora local de Chile
    const utcHour = p.fecha_pedido.getUTCHours()
    let localHour = (utcHour + CHILE_OFFSET_HOURS + 24) % 24
    map.set(localHour, (map.get(localHour) || 0) + 1)
  })

  // Mostrar solo el rango de horas que tiene datos, o el rango comercial 7-23
  const relevantHours = allHours.filter(h => h >= 7 && h <= 23)

  return relevantHours.map(h => ({
    hora: `${h.toString().padStart(2, '0')}:00`,
    ventas: map.get(h) || 0
  }))
}

export async function getOrderDetails(id_pedido: number) {
  const pedido = await prisma.pedido.findUnique({
    where: { id_pedido },
    include: {
      usuario: true,
      direccion: { include: { comuna: { include: { region: true } } } },
      articulos: { include: { producto: { include: { modelo: true, talla: true, color: true } } } },
      pagos: true,
    }
  })
  return pedido
}
