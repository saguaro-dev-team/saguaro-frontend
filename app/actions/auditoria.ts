'use server'

import { prisma } from '@/lib/prisma'

interface AdminUser {
  id: string
  nombre: string
  email: string
}

export async function getAuditoriaStock() {
  try {
    const logs = await prisma.auditoria_stock.findMany({
      orderBy: { fecha_cambio: 'desc' }
    })
    return { success: true, logs }
  } catch (error: any) {
    console.error('Error fetching stock audit logs:', error)
    return { success: false, error: error.message }
  }
}

export async function logStockChange(data: {
  adminUser: AdminUser
  accion: 'AGREGAR' | 'RETIRAR' | 'MODIFICAR' | 'CREAR'
  sku: string
  nombreProducto: string
  detalles: string
  stockAnterior: number
  stockNuevo: number
}) {
  try {
    const log = await prisma.auditoria_stock.create({
      data: {
        id_usuario: parseInt(data.adminUser.id),
        nombre_usuario: data.adminUser.nombre,
        email_usuario: data.adminUser.email,
        accion: data.accion,
        sku_producto: data.sku,
        nombre_producto: data.nombreProducto,
        detalles: data.detalles,
        stock_anterior: data.stockAnterior,
        stock_nuevo: data.stockNuevo,
      }
    })
    return { success: true, log }
  } catch (error: any) {
    console.error('Error logging stock change:', error)
    return { success: false, error: error.message }
  }
}
