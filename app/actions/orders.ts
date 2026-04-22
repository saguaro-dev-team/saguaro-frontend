'use server'

import { prisma } from '@/lib/prisma'

export async function getUserOrders(userId: string) {
  try {
    const id = parseInt(userId)
    if (isNaN(id)) return { success: false, error: 'ID de usuario inválido' }

    const orders = await prisma.pedidos.findMany({
      where: { id_usuario: id, is_active: true },
      include: {
        estado: true,
        pagos: {
          include: {
            metodos_pago: true
          }
        },
        seguimiento_envio: true,
        detalle_pedidos: {
          include: {
            productos: true
          }
        }
      },
      orderBy: { fecha_pedido: 'desc' }
    })
    
    return { success: true, orders }
  } catch (error) {
    console.error('Error al cargar pedidos:', error)
    return { success: false, error: 'No se pudieron cargar los pedidos' }
  }
}
