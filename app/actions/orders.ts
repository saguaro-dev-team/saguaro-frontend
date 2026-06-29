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

export async function createOrder(data: {
  userId?: string | null;
  formData: any;
  items: any[];
  total: number;
  finalTotal: number;
  paymentMethod: string;
}) {
  try {
    // Clean up any expired pending orders first to release their stock
    await cleanupExpiredPendingOrders();

    let user_id: number;
    if (data.userId) {
      user_id = parseInt(data.userId);
      // Actualizar el teléfono y datos de contacto en el perfil del usuario activo
      await prisma.usuario.update({
        where: { id_usuario: user_id },
        data: {
          nombres: data.formData.nombres,
          primer_apellido: data.formData.primer_apellido,
          segundo_apellido: data.formData.segundo_apellido || undefined,
          telefono: data.formData.telefono
        }
      });
    } else {
      const existingUser = await prisma.usuario.findUnique({ where: { direccion_email: data.formData.email } });
      if (existingUser) {
        user_id = existingUser.id_usuario;
        // Actualizar el teléfono y datos de contacto en el perfil del usuario invitado existente
        await prisma.usuario.update({
          where: { id_usuario: user_id },
          data: {
            nombres: data.formData.nombres,
            primer_apellido: data.formData.primer_apellido,
            segundo_apellido: data.formData.segundo_apellido || undefined,
            telefono: data.formData.telefono
          }
        });
      } else {
        const newUser = await prisma.usuario.create({
          data: {
            nombres: data.formData.nombres,
            primer_apellido: data.formData.primer_apellido,
            segundo_apellido: data.formData.segundo_apellido || '',
            rut: `G-${Date.now().toString().slice(-9)}`,
            telefono: data.formData.telefono,
            direccion_email: data.formData.email,
            genero: 'No especificado',
            fecha_nacimiento: new Date('1990-01-01'),
          }
        });
        user_id = newUser.id_usuario;
      }
    }

    let direccion = await prisma.direccion.findFirst({
      where: {
        id_usuario: user_id,
        id_comuna: data.formData.id_comuna,
        calle: data.formData.calle,
        numero: data.formData.numero
      }
    });

    if (!direccion) {
      const lastDir = await prisma.direccion.findFirst({
        where: { id_usuario: user_id, id_comuna: data.formData.id_comuna },
        orderBy: { id_direccion: 'desc' }
      });
      const nextId = lastDir ? lastDir.id_direccion + 1 : 1;
      
      direccion = await prisma.direccion.create({
        data: {
          id_usuario: user_id,
          id_comuna: data.formData.id_comuna,
          id_direccion: nextId,
          calle: data.formData.calle,
          numero: data.formData.numero,
          departamento: data.formData.departamento,
        }
      });
    }

    const newOrder = await prisma.$transaction(async (tx) => {
      // 1. Create Pedido
      const pedido = await tx.pedido.create({
        data: {
          id_usuario: user_id,
          fk_usuario_direccion: direccion.id_usuario,
          id_comuna_direccion: direccion.id_comuna,
          fk_numero_correlativo_direccion: direccion.id_direccion,
          total: data.finalTotal,
          estado: "pendiente",
        }
      });

      // 2. Add Articulos and Decrement Stock
      for (const item of data.items) {
        const idModelo = parseInt(item.producto.id.toString());
        const qty = parseInt(item.cantidad.toString());
        const price = parseFloat(item.producto.precio.toString());

        // Find the specific variant based on modelo, color, and talla
        const productoVariant = await tx.producto.findFirst({ 
          where: { 
            id_modelo: idModelo,
            color: { nombre_color: item.color.toString() },
            talla: { nombre_talla: item.talla.toString() }
          } 
        });

        if (!productoVariant || productoVariant.stock < qty) {
          throw new Error(`Stock insuficiente para ${item.producto.nombre} (Talla: ${item.talla}, Color: ${item.color})`);
        }

        await tx.articulo_pedido.create({
          data: {
            id_pedido: pedido.id_pedido,
            id_producto: productoVariant.id_producto,
            cantidad: qty,
            precio: price,
          }
        });
      }

      // 3. Create dummy Payment record
      let metodo = await tx.metodo_pago.findFirst();
      if (!metodo) {
        metodo = await tx.metodo_pago.create({
          data: { nombre: 'Webpay Plus', descripcion: 'Pago con tarjeta' }
        });
      }

      await tx.transaccion_pago.create({
        data: {
          id_pedido: pedido.id_pedido,
          id_metodo_pago: metodo.id_metodo_pago,
          monto: data.finalTotal,
          estado_pago: 'Pendiente de Pago',
          cod_autorizacion: null
        }
      });

      return pedido;
    });

    return { success: true, orderId: newOrder.id_pedido };
  } catch (error: any) {
    console.error('Error al crear pedido:', error);
    return { success: false, error: error.message || 'Error al procesar el pedido' };
  }
}

async function cleanupExpiredPendingOrders() {
  try {
    const oneHourAgo = new Date()
    oneHourAgo.setHours(oneHourAgo.getHours() - 1)

    // Find all pending orders older than 1 hour
    const expiredOrders = await prisma.pedido.findMany({
      where: {
        estado: 'pendiente',
        fecha_pedido: {
          lt: oneHourAgo
        }
      },
      include: {
        articulos: true
      }
    })

    if (expiredOrders.length === 0) return

    console.log(`[Pending Cleanup] Cancelling ${expiredOrders.length} orders older than 1 hour.`)

    await prisma.$transaction(async (tx) => {
      for (const order of expiredOrders) {
        await tx.pedido.update({
          where: { id_pedido: order.id_pedido },
          data: { estado: 'cancelado' }
        })

        await tx.transaccion_pago.updateMany({
          where: { id_pedido: order.id_pedido },
          data: { estado_pago: 'Rechazado' }
        })
      }
    })
  } catch (e) {
    console.error('Error during expired pending orders cleanup:', e)
  }
}

export async function getAdminOrders() {
  try {
    // Run the self-healing pending orders cleanup first
    await cleanupExpiredPendingOrders()

    const orders = await prisma.pedido.findMany({
      include: {
        usuario: true,
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
        },
        direccion: {
          include: {
            comuna: {
              include: {
                region: true
              }
            }
          }
        }
      },
      orderBy: { fecha_pedido: 'desc' }
    })
    
    const formattedOrders = orders.map(o => ({
      id: `SAG-${String(o.id_pedido).padStart(8, '0')}`,
      id_raw: o.id_pedido,
      cliente: o.usuario ? `${o.usuario.nombres} ${o.usuario.primer_apellido} ${o.usuario.segundo_apellido || ''}`.trim() : 'Invitado',
      email: o.usuario ? o.usuario.direccion_email : 'invitado@email.com',
      telefono: o.usuario ? o.usuario.telefono : 'No registrado',
      fecha: o.fecha_pedido.toISOString().split('T')[0],
      total: o.total,
      items: o.articulos.reduce((acc, a) => acc + a.cantidad, 0),
      estado: o.estado,
      direccion: o.direccion ? {
        calle: o.direccion.calle,
        numero: o.direccion.numero || '',
        departamento: o.direccion.departamento || '',
        detalles: o.direccion.detalles || '',
        comuna: o.direccion.comuna.nombre,
        region: o.direccion.comuna.region.nombre
      } : null,
      articulos: o.articulos.map(a => ({
        nombre: a.producto.modelo.nombre_modelo,
        color: a.producto.color.nombre_color,
        talla: a.producto.talla.nombre_talla,
        sku: a.producto.codigo_sku,
        cantidad: a.cantidad,
        precio: a.precio
      }))
    }))
    
    return { success: true, orders: formattedOrders }
  } catch (error: any) {
    console.error('Error al obtener pedidos para admin:', error)
    return { success: false, error: error.message }
  }
}

export async function updateOrderStatus(orderId: number, newStatus: string) {
  try {
    await prisma.$transaction(async (tx) => {
      // Fetch the old status first to check if we are transitioning to/from canceled
      const oldOrder = await tx.pedido.findUnique({
        where: { id_pedido: orderId },
        include: { articulos: true }
      })

      if (!oldOrder) {
        throw new Error('Pedido no encontrado')
      }

      const isSubtracted = (status: string) => ['pagado', 'preparando', 'enviado', 'entregado'].includes(status)
      const wasSubtracted = isSubtracted(oldOrder.estado)
      const willBeSubtracted = isSubtracted(newStatus)

      if (wasSubtracted && !willBeSubtracted) {
        // Restore stock
        for (const art of oldOrder.articulos) {
          await tx.producto.update({
            where: { id_producto: art.id_producto },
            data: { stock: { increment: art.cantidad } }
          })
        }
        // Cancel payments
        await tx.transaccion_pago.updateMany({
          where: { id_pedido: orderId },
          data: { estado_pago: 'Rechazado' }
        })
      } else if (!wasSubtracted && willBeSubtracted) {
        // Deduct stock
        for (const art of oldOrder.articulos) {
          const product = await tx.producto.findUnique({
            where: { id_producto: art.id_producto }
          })
          if (!product || product.stock < art.cantidad) {
            throw new Error(`Stock insuficiente para cambiar estado del pedido (Producto ID: ${art.id_producto})`)
          }
          await tx.producto.update({
            where: { id_producto: art.id_producto },
            data: { stock: { decrement: art.cantidad } }
          })
        }
      }

      await tx.pedido.update({
        where: { id_pedido: orderId },
        data: { estado: newStatus }
      })
    })
    const { revalidatePath } = await import('next/cache')
    revalidatePath('/admin/pedidos')
    revalidatePath('/perfil')
    return { success: true }
  } catch (error: any) {
    console.error('Error al actualizar estado del pedido:', error)
    return { success: false, error: error.message }
  }
}

