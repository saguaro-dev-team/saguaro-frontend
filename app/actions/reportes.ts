'use server'

import { prisma } from '@/lib/prisma'

export async function getReporteInventario() {
  const productos = await prisma.producto.findMany({
    include: {
      modelo: {
        include: {
          categoria: true
        }
      },
      color: true,
      talla: true
    },
    orderBy: {
      modelo: {
        nombre_modelo: 'asc'
      }
    }
  });

  return productos.map(p => ({
    SKU: p.codigo_sku,
    Modelo: p.modelo.nombre_modelo,
    Tipo: p.modelo.tipo,
    Categoria: p.modelo.categoria.nombre_categoria,
    Color: p.color.nombre_color,
    Talla: p.talla.nombre_talla,
    Stock: p.stock,
    Precio: p.precio
  }));
}

export async function getReporteVentas(startDateStr: string, endDateStr: string) {
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);
  endDate.setHours(23, 59, 59, 999);

  const pedidos = await prisma.pedido.findMany({
    where: {
      fecha_pedido: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      usuario: true,
      articulos: true
    },
    orderBy: {
      fecha_pedido: 'desc'
    }
  });

  return pedidos.map(p => ({
    'ID Pedido': p.id_pedido,
    'Fecha': p.fecha_pedido.toISOString().split('T')[0],
    'Estado': p.estado,
    'Cliente': `${p.usuario.nombres} ${p.usuario.primer_apellido}`,
    'Email': p.usuario.direccion_email,
    'Total': p.total,
    'Items (Cant)': p.articulos.reduce((acc, art) => acc + art.cantidad, 0)
  }));
}
