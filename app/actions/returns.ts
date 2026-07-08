'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

function safeRevalidatePath(p: string) {
  try {
    revalidatePath(p)
  } catch (e) {
    // Ignorar fuera de Next.js
  }
}

export async function createReturnRequest(data: {
  id_pedido: number
  id_producto: number
  cantidad?: number
  motivo: string
  comentarios: string
  bancoInfo?: string
}) {
  try {
    const { id_pedido, id_producto, cantidad = 1, motivo, comentarios, bancoInfo } = data

    // Verificar si el pedido existe
    const order = await prisma.pedido.findUnique({
      where: { id_pedido }
    })

    if (!order) {
      return { success: false, error: 'Pedido no encontrado' }
    }

    // Verificar si ya existe una solicitud de devolución para este producto en este pedido
    const existing = await prisma.devolucion.findFirst({
      where: { id_pedido, id_producto }
    })

    if (existing) {
      return { success: false, error: 'Ya has solicitado una devolución para este producto' }
    }

    // El campo motivo de la tabla devolucion es VarChar(255).
    // Para no alterar el modelo, concatenamos el motivo elegido, los comentarios del cliente
    // y los datos bancarios si existen, asegurando no sobrepasar los 255 caracteres de límite.
    let motivoConcatenado = `Motivo: ${motivo}`
    if (comentarios) {
      motivoConcatenado += ` | Comentario: ${comentarios}`
    }
    if (bancoInfo) {
      motivoConcatenado += ` | Banco: ${bancoInfo}`
    }

    // Truncar si excede 255 caracteres para evitar fallos de base de datos
    if (motivoConcatenado.length > 250) {
      motivoConcatenado = motivoConcatenado.substring(0, 247) + '...'
    }

    // Crear la devolución
    const req = await prisma.devolucion.create({
      data: {
        id_pedido,
        id_producto,
        cantidad,
        motivo: motivoConcatenado,
        estado_devolucion: 'pendiente'
      }
    })

    // Actualizar el estado del pedido a 'devolucion_solicitada'
    await prisma.pedido.update({
      where: { id_pedido },
      data: { estado: 'devolucion_solicitada' }
    })

    // Agregar un mensaje automático de confirmación al buzón del usuario (si está registrado)
    if (order.id_usuario) {
      const messagesFilePath = require('path').join(process.cwd(), 'lib', 'mensajes-data.json')
      try {
        if (require('fs').existsSync(messagesFilePath)) {
          const fileContent = require('fs').readFileSync(messagesFilePath, 'utf8')
          const mensajes = JSON.parse(fileContent)
          
          const nuevoMensaje = {
            id: Date.now().toString(),
            fecha: new Date().toISOString(),
            nombre: 'Sistema Saguaro',
            email: 'contacto@saguaro.cl',
            motivo: 'soporte',
            mensaje: `Hemos recibido tu solicitud de devolución para el producto en el pedido SAG-${String(id_pedido).padStart(8, '0')}. Nuestro equipo revisará la solicitud a la brevedad.`,
            numero_pedido: `#${id_pedido}`,
            linkedin_url: null,
            cv_url: null,
            leido: false,
            respondido: false,
            usuarioId: String(order.id_usuario)
          }
          
          mensajes.unshift(nuevoMensaje)
          require('fs').writeFileSync(messagesFilePath, JSON.stringify(mensajes, null, 2), 'utf8')
        }
      } catch (err) {
        console.error("Error al registrar mensaje automático de devolución:", err)
      }
    }

    safeRevalidatePath('/admin/devoluciones')
    safeRevalidatePath('/perfil')
    return { success: true, id_devolucion: req.id_devolucion }
  } catch (error: any) {
    console.error('Error al crear solicitud de devolución:', error)
    return { success: false, error: error.message || 'Error del servidor' }
  }
}

export async function getAdminReturnRequests() {
  try {
    const reqs = await prisma.devolucion.findMany({
      include: {
        pedido: {
          include: {
            usuario: true
          }
        },
        producto: {
          include: {
            modelo: true,
            color: true,
            talla: true
          }
        }
      },
      orderBy: { fecha_solicitud: 'desc' }
    })

    return {
      success: true,
      devoluciones: reqs.map(r => ({
        id_devolucion: r.id_devolucion,
        id_pedido: r.id_pedido,
        id_producto: r.id_producto,
        cantidad: r.cantidad,
        motivo: r.motivo,
        estado_devolucion: r.estado_devolucion,
        fecha_solicitud: r.fecha_solicitud,
        fecha_procesada: r.fecha_procesada,
        pedido: {
          id_pedido: r.pedido.id_pedido,
          fecha_pedido: r.pedido.fecha_pedido,
          total: r.pedido.total,
          estado: r.pedido.estado,
          usuario: r.pedido.usuario ? {
            id_usuario: r.pedido.usuario.id_usuario,
            nombres: r.pedido.usuario.nombres,
            primer_apellido: r.pedido.usuario.primer_apellido,
            segundo_apellido: r.pedido.usuario.segundo_apellido,
            direccion_email: r.pedido.usuario.direccion_email,
            telefono: r.pedido.usuario.telefono
          } : null
        },
        producto: {
          id_producto: r.producto.id_producto,
          codigo_sku: r.producto.codigo_sku,
          stock: r.producto.stock,
          modelo: {
            nombre_modelo: r.producto.modelo.nombre_modelo,
            imagen_url: r.producto.modelo.imagen_url || '/placeholder.jpg'
          },
          color: r.producto.color.nombre_color,
          talla: r.producto.talla.nombre_talla
        }
      }))
    }
  } catch (error: any) {
    console.error('Error al obtener devoluciones de administrador:', error)
    return { success: false, error: error.message || 'Error del servidor' }
  }
}

export async function updateReturnRequestStatus(
  id_devolucion: number,
  newStatus: string,
  rejectReason?: string,
  adminUser?: any
) {
  try {
    const dev = await prisma.devolucion.findUnique({
      where: { id_devolucion },
      include: {
        producto: {
          include: { modelo: true, color: true, talla: true }
        },
        pedido: true
      }
    })

    if (!dev) {
      return { success: false, error: 'Solicitud de devolución no encontrada' }
    }

    const orderId = dev.id_pedido

    // Actualizar registro de devolución
    await prisma.devolucion.update({
      where: { id_devolucion },
      data: {
        estado_devolucion: newStatus,
        fecha_procesada: new Date()
      }
    })

    // Actualizar estado de pedido e inventario según corresponda
    if (newStatus === 'aprobada') {
      await prisma.pedido.update({
        where: { id_pedido: orderId },
        data: { estado: 'devolucion_aprobada' }
      })
    } else if (newStatus === 'rechazada') {
      await prisma.pedido.update({
        where: { id_pedido: orderId },
        data: { estado: 'devolucion_rechazada' }
      })
    } else if (newStatus === 'completada') {
      // 1. Marcar pedido como Reembolsado
      await prisma.pedido.update({
        where: { id_pedido: orderId },
        data: { estado: 'reembolsado' }
      })

      // 2. Incrementar stock de la variante devuelta
      const oldStock = dev.producto.stock
      const newStock = oldStock + dev.cantidad

      await prisma.producto.update({
        where: { id_producto: dev.id_producto },
        data: { stock: newStock }
      })

      // 3. Registrar auditoría de stock
      try {
        await prisma.auditoria_stock.create({
          data: {
            id_usuario: adminUser?.id ? parseInt(adminUser.id) || 0 : 0,
            nombre_usuario: adminUser?.nombre || 'Administrador',
            email_usuario: adminUser?.email || 'admin@saguaro.cl',
            accion: 'AGREGAR',
            sku_producto: dev.producto.codigo_sku,
            nombre_producto: dev.producto.modelo.nombre_modelo,
            detalles: `Reingreso automático por devolución completada (${dev.cantidad} pares) del Pedido SAG-${String(orderId).padStart(8, '0')}.`,
            stock_anterior: oldStock,
            stock_nuevo: newStock
          }
        })
      } catch (err) {
        console.error("Error al registrar auditoría de devolución en returns:", err)
      }
    }

    // Inyectar mensaje de notificación al cliente
    if (dev.pedido.id_usuario) {
      const messagesFilePath = require('path').join(process.cwd(), 'lib', 'mensajes-data.json')
      try {
        if (require('fs').existsSync(messagesFilePath)) {
          const fileContent = require('fs').readFileSync(messagesFilePath, 'utf8')
          const mensajes = JSON.parse(fileContent)
          
          let statusText = ''
          if (newStatus === 'aprobada') {
            statusText = `ha sido APROBADA. Por favor, procede con las instrucciones de despacho enviadas a tu correo.`
          } else if (newStatus === 'rechazada') {
            statusText = `ha sido RECHAZADA.${rejectReason ? ` Motivo: ${rejectReason}` : ''}`
          } else if (newStatus === 'completada') {
            statusText = `ha sido COMPLETADA. Hemos verificado la recepción del producto y se ha gestionado tu reembolso.`
          }

          const nuevoMensaje = {
            id: Date.now().toString(),
            fecha: new Date().toISOString(),
            nombre: 'Sistema Saguaro',
            email: 'contacto@saguaro.cl',
            motivo: 'soporte',
            mensaje: `La solicitud de devolución para tu pedido SAG-${String(orderId).padStart(8, '0')} ${statusText}`,
            numero_pedido: `#${orderId}`,
            linkedin_url: null,
            cv_url: null,
            leido: false,
            respondido: false,
            usuarioId: String(dev.pedido.id_usuario)
          }
          
          mensajes.unshift(nuevoMensaje)
          require('fs').writeFileSync(messagesFilePath, JSON.stringify(mensajes, null, 2), 'utf8')
        }
      } catch (err) {
        console.error("Error al registrar mensaje de actualización de devolución:", err)
      }
    }

    safeRevalidatePath('/admin/devoluciones')
    safeRevalidatePath('/perfil')
    return { success: true }
  } catch (error: any) {
    console.error('Error al actualizar estado de devolución:', error)
    return { success: false, error: error.message || 'Error del servidor' }
  }
}
