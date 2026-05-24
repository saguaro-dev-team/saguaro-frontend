'use server'

import { prisma } from '@/lib/prisma'
import type { 
  KPIData, 
  VentasMensuales, 
  ProductoVendido, 
  StockCritico 
} from '@/lib/types'

export async function getKpiData(): Promise<KPIData> {
  const pedidos = await prisma.pedido.findMany({
    where: { estado: { not: 'cancelado' } }
  });
  
  const totalVentas = pedidos.reduce((acc, p) => acc + p.total, 0);
  const totalPedidos = pedidos.length;
  const ticketPromedio = totalPedidos > 0 ? Math.round(totalVentas / totalPedidos) : 0;
  
  const clientes = await prisma.usuario.count({
    where: { id_rol: 1 } 
  });
  
  const criticos = await prisma.producto.count({
    where: { stock: { lt: 10 }, modelo: { activo: true } }
  });

  return {
    ticketPromedio,
    totalVentas,
    totalPedidos,
    clientesRegistrados: clientes,
    tasaConversion: 2.5, 
    productosConStockCritico: criticos
  }
}

export async function getVentasMensuales(): Promise<VentasMensuales[]> {
  const pedidos = await prisma.pedido.findMany({
    where: { estado: { not: 'cancelado' } },
    select: { fecha_pedido: true, total: true }
  });

  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const map = new Map<string, {ventas: number, pedidos: number}>();
  
  meses.forEach(m => map.set(m, { ventas: 0, pedidos: 0 }));

  pedidos.forEach(p => {
    const mesIndex = p.fecha_pedido.getMonth();
    const mes = meses[mesIndex];
    const data = map.get(mes)!;
    data.ventas += p.total;
    data.pedidos += 1;
  });

  return meses.map(mes => ({
    mes,
    ventas: map.get(mes)!.ventas,
    pedidos: map.get(mes)!.pedidos
  }));
}

export async function getProductosVendidos(): Promise<ProductoVendido[]> {
  const articulos = await prisma.articulo_pedido.findMany({
    where: {
      producto: { modelo: { activo: true } }
    },
    include: {
      producto: {
        include: { modelo: true }
      }
    }
  });

  const map = new Map<number, ProductoVendido>();

  articulos.forEach(art => {
    const id = art.producto.id_modelo;
    if (!map.has(id)) {
      map.set(id, {
        nombre: art.producto.modelo.nombre_modelo,
        cantidad: 0,
        ingresos: 0,
        categoria: art.producto.modelo.tipo
      });
    }
    const val = map.get(id)!;
    val.cantidad += art.cantidad;
    val.ingresos += (art.cantidad * art.precio);
  });

  return Array.from(map.values())
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 5);
}

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
  });

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const productIds = criticos.map(c => c.id_producto);

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
  });

  const salesMap = new Map<number, number>();
  sales.forEach(s => {
    salesMap.set(s.id_producto, (salesMap.get(s.id_producto) || 0) + s.cantidad);
  });

  return criticos.map(c => {
    const totalSold = salesMap.get(c.id_producto) || 0;
    // Velocidad de venta diaria (ventas en 30 días / 30).
    // Usamos un mínimo de 0.1 ventas/día si no hay ventas recientes, para evitar división por cero.
    const velocidadVenta = Math.max(0.1, totalSold / 30);
    const diasRestantes = c.stock / velocidadVenta;

    return {
      id_producto: c.id_producto,
      nombre: `${c.modelo.nombre_modelo} - ${c.talla.nombre_talla} ${c.color.nombre_color}`,
      stock: c.stock,
      velocidadVenta,
      diasRestantes
    };
  });
}

export async function getVentasPorCategoria() {
  const articulos = await prisma.articulo_pedido.findMany({
    where: {
      producto: { modelo: { activo: true } }
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
  });

  let total = 0;
  const map = new Map<string, number>();

  articulos.forEach(art => {
    const cat = art.producto.modelo.categoria.nombre_categoria;
    const rev = art.cantidad * art.precio;
    map.set(cat, (map.get(cat) || 0) + rev);
    total += rev;
  });

  return Array.from(map.entries()).map(([categoria, ventas]) => ({
    categoria,
    ventas,
    porcentaje: total > 0 ? parseFloat(((ventas / total) * 100).toFixed(1)) : 0
  })).sort((a,b) => b.ventas - a.ventas);
}

export async function getPedidosRecientes() {
  const pedidos = await prisma.pedido.findMany({
    take: 5,
    orderBy: { fecha_pedido: 'desc' },
    include: { usuario: true }
  });

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
  }));
}

export async function getVentasPorHora() {
  const pedidos = await prisma.pedido.findMany({
    where: { estado: { not: 'cancelado' } }
  });

  const hours = Array.from({length: 14}, (_, i) => i + 8); // 8 to 21
  const map = new Map<number, number>();
  hours.forEach(h => map.set(h, 0));

  pedidos.forEach(p => {
    const h = p.fecha_pedido.getHours();
    if (map.has(h)) {
      map.set(h, map.get(h)! + 1);
    }
  });

  return hours.map(h => ({
    hora: `${h.toString().padStart(2, '0')}:00`,
    ventas: map.get(h)!
  }));
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
  });
  return pedido;
}

