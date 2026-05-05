'use server'

import { prisma } from '@/lib/prisma'

export async function getUserOrders(userId: string) {
  try {
    const id = parseInt(userId)
    if (isNaN(id)) return { success: false, error: 'ID de usuario inválido' }

    const orders = await prisma.pedido.findMany({
      where: { id_usuario: id },
      include: {
        pagos: {
          include: {
            metodo_pago: true
          }
        },
        envios: {
          include: {
            empresa: true
          }
        },
        articulos: {
          include: {
            producto: {
              include: {
                modelo: true,
                color: true,
                talla: true
              }
            }
          }
        }
      },
      orderBy: { fecha_pedido: 'desc' }
    })
    
    // Mapear los datos al formato que el frontend antiguo esperaba para que no se rompa la vista de perfil
    const mappedOrders = orders.map(o => ({
      id_pedido: o.id_pedido,
      fecha_pedido: o.fecha_pedido,
      total_pagado: o.total,
      estado: { nombre: o.estado },
      pagos: o.pagos.map(p => ({
        metodo_pago: p.metodo_pago.nombre,
        monto: p.monto,
        estado_pago: p.estado_pago
      })),
      seguimiento_envio: o.envios.length > 0 ? {
        empresa_transporte: o.envios[0].empresa.nombre_empresa,
        numero_guia: o.envios[0].numero_seguimiento,
        estado_logistico: o.estado
      } : null,
      detalle_pedidos: o.articulos.map(a => ({
        cantidad: a.cantidad,
        precio_unitario: a.precio,
        color: a.producto.color.nombre_color,
        talla: a.producto.talla.nombre_talla,
        productos: {
          nombre: a.producto.modelo.nombre_modelo,
          imagen_url: '/placeholder.jpg'
        }
      }))
    }))
    
    return { success: true, orders: mappedOrders }
  } catch (error) {
    console.error('Error al cargar pedidos:', error)
    return { success: false, error: 'No se pudieron cargar los pedidos' }
  }
}
