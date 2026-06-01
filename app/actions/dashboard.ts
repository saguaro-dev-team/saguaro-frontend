'use server'

import { prisma } from '@/lib/prisma'
import type { 
  KPIData, 
  VentasMensuales, 
  ProductoVendido, 
  StockCritico 
} from '@/lib/types'

export type Period = 'today' | 'week' | 'month' | 'quarter' | 'year'

/** Retorna la fecha de inicio según el período elegido */
function getDateFrom(period: Period): Date {
  const now = new Date()
  switch (period) {
    case 'today': {
      const d = new Date(now)
      d.setHours(0, 0, 0, 0)
      return d
    }
    case 'week': {
      const d = new Date(now)
      d.setDate(d.getDate() - 7)
      d.setHours(0, 0, 0, 0)
      return d
    }
    case 'month': {
      const d = new Date(now)
      d.setDate(1)
      d.setHours(0, 0, 0, 0)
      return d
    }
    case 'quarter': {
      const d = new Date(now)
      d.setMonth(d.getMonth() - 3)
      d.setHours(0, 0, 0, 0)
      return d
    }
    case 'year': {
      const d = new Date(now.getFullYear(), 0, 1) // 1 enero año actual
      return d
    }
  }
}

export async function getKpiData(period: Period = 'month'): Promise<KPIData> {
  const dateFrom = getDateFrom(period)

  const pedidos = await prisma.pedido.findMany({
    where: { 
      estado: { not: 'cancelado' },
      fecha_pedido: { gte: dateFrom }
    }
  })
  
  const totalVentas = pedidos.reduce((acc, p) => acc + p.total, 0)
  const totalPedidos = pedidos.length
  const ticketPromedio = totalPedidos > 0 ? Math.round(totalVentas / totalPedidos) : 0
  
  // Clientes registrados: siempre total histórico (no filtrar por período)
  const clientes = await prisma.usuario.count({
    where: { id_rol: 1 } 
  })
  
  const criticos = await prisma.producto.count({
    where: { stock: { lt: 10 }, modelo: { activo: true } }
  })

  return {
    ticketPromedio,
    totalVentas,
    totalPedidos,
    clientesRegistrados: clientes,
    tasaConversion: 2.5, 
    productosConStockCritico: criticos
  }
}

export async function getVentasMensuales(period: Period = 'month'): Promise<VentasMensuales[]> {
  const dateFrom = getDateFrom(period)

  const pedidos = await prisma.pedido.findMany({
    where: { 
      estado: { not: 'cancelado' },
      fecha_pedido: { gte: dateFrom }
    },
    select: { fecha_pedido: true, total: true }
  })

  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  const map = new Map<string, {ventas: number, pedidos: number}>()
  
  meses.forEach(m => map.set(m, { ventas: 0, pedidos: 0 }))

  pedidos.forEach(p => {
    const mesIndex = p.fecha_pedido.getMonth()
    const mes = meses[mesIndex]
    const data = map.get(mes)!
    data.ventas += p.total
    data.pedidos += 1
  })

  // Para "today" o "week", agrupar por día en vez de mes
  if (period === 'today') {
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

  if (period === 'week') {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    const dayMap = new Map<string, {ventas: number, pedidos: number}>()
    // últimos 7 días en orden
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = `${days[d.getDay()]} ${d.getDate()}`
      dayMap.set(key, { ventas: 0, pedidos: 0 })
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

  return meses.map(mes => ({
    mes,
    ventas: map.get(mes)!.ventas,
    pedidos: map.get(mes)!.pedidos
  }))
}

export async function getProductosVendidos(period: Period = 'month'): Promise<ProductoVendido[]> {
  const dateFrom = getDateFrom(period)

  const articulos = await prisma.articulo_pedido.findMany({
    where: {
      producto: { modelo: { activo: true } },
      pedido: { fecha_pedido: { gte: dateFrom }, estado: { not: 'cancelado' } }
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
    take: 5,
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
        estado: { not: 'cancelado' }
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
      stock: c.stock,
      velocidadVenta,
      diasRestantes
    }
  })
}

export async function getVentasPorCategoria(period: Period = 'month') {
  const dateFrom = getDateFrom(period)

  const articulos = await prisma.articulo_pedido.findMany({
    where: {
      producto: { modelo: { activo: true } },
      pedido: { fecha_pedido: { gte: dateFrom }, estado: { not: 'cancelado' } }
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

export async function getPedidosRecientes(period: Period = 'month') {
  const dateFrom = getDateFrom(period)

  const pedidos = await prisma.pedido.findMany({
    take: 10,
    orderBy: { fecha_pedido: 'desc' },
    where: { fecha_pedido: { gte: dateFrom } },
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

export async function getVentasPorHora(period: Period = 'month') {
  const dateFrom = getDateFrom(period)

  const pedidos = await prisma.pedido.findMany({
    where: { 
      estado: { not: 'cancelado' },
      fecha_pedido: { gte: dateFrom }
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
