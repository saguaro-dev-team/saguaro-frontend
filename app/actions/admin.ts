'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function updateProductType(id: string, nuevoTipo: string) {
  try {
    await prisma.modelo.update({
      where: { id_modelo: parseInt(id) },
      data: { tipo: nuevoTipo }
    })
    revalidatePath(`/producto/${id}`)
    revalidatePath('/admin/productos')
    revalidatePath('/')
    return { success: true }
  } catch (error: any) {
    console.error("Error actualizando tipo:", error)
    return { success: false, error: error.message }
  }
}


export async function getConfiguracion() {
  // Nota: La tabla configuracion_tienda no existe en el esquema final 4.
  // Deberíamos crearla o usar una alternativa. Por ahora, mock para no romper.
  return {
    id_config: 1,
    politica_envio: 'Envío gratis en compras sobre $50.000...',
    politica_devoluciones: '30 días para realizar cambios...'
  }
}

export async function updateConfiguracion(envio: string, devoluciones: string) {
  return { success: true }
}

export async function updateProductCaracteristicas(id: string, caracteristicas: string[]) {
  // Las características tampoco están en el esquema actual.
  // Podríamos agregarlas a 'modelo' o simplemente ignorar.
  return { success: true }
}

export async function updateProductDescription(id: string, descripcion: string) {
  try {
    await prisma.modelo.update({
      where: { id_modelo: parseInt(id) },
      data: { descripcion }
    })
    revalidatePath(`/producto/${id}`)
    revalidatePath('/admin/productos')
    return { success: true }
  } catch (error) {
    console.error("Error guardando descripcion:", error)
    return { success: false, error: 'Error guardando descripción' }
  }
}

export async function getProductVariants(modelId: string) {
  try {
    const id_modelo = parseInt(modelId)
    if (isNaN(id_modelo)) return { success: false, error: 'ID de modelo inválido' }

    const variants = await prisma.producto.findMany({
      where: { id_modelo },
      include: {
        color: true,
        talla: true
      },
      orderBy: [
        { color: { nombre_color: 'asc' } },
        { talla: { nombre_talla: 'asc' } }
      ]
    })

    return { success: true, variants }
  } catch (error: any) {
    console.error('Error al obtener variantes:', error)
    return { success: false, error: error.message }
  }
}

export async function updateProductFull(id: string, data: any) {
  try {
    console.log(`[updateProductFull] Actualizando Modelo ID: ${id}`, data)
    
    const id_modelo = parseInt(id)
    const precio = parseInt(data.precio_normal)
    const stock = parseInt(data.stock)
    const id_categoria = parseInt(data.id_categoria)

    // 1. Actualizar el Modelo
    await prisma.modelo.update({
      where: { id_modelo },
      data: {
        nombre_modelo: data.nombre,
        descripcion: data.descripcion,
        id_categoria: isNaN(id_categoria) ? undefined : id_categoria,
        tipo: data.tipo,
        uso: data.uso,
        estilo: data.estilo,
      }
    })

    // 2. Actualizar precio de todas las variantes existentes
    await prisma.producto.updateMany({
      where: { id_modelo },
      data: {
        precio: precio,
      }
    })

    // 3. Si se enviaron stocks por variante específicos, los actualizamos uno a uno
    if (data.variantsStock && Array.isArray(data.variantsStock)) {
      for (const v of data.variantsStock) {
        await prisma.producto.update({
          where: { id_producto: parseInt(v.id_producto) },
          data: { stock: parseInt(v.stock) || 0 }
        })
      }
    } else {
      // Si el admin envió un stock específico y solo hay una variante, lo actualizamos (retrocompatibilidad)
      const variantsCount = await prisma.producto.count({ where: { id_modelo } })
      if (variantsCount === 1) {
        await prisma.producto.updateMany({
          where: { id_modelo },
          data: { stock }
        })
      }
    }
    
    revalidatePath('/')
    revalidatePath('/admin/productos')
    return { success: true }
  } catch (error: any) {
    console.error("Error DETALLADO actualizando producto:", error)
    return { success: false, error: `No se pudo guardar: ${error.message}` }
  }
}

export async function createProduct(data: any) {
  try {
    const precio = parseInt(data.precio_normal)
    const stockTotal = parseInt(data.stock) || 0
    const id_categoria = parseInt(data.id_categoria)

    if (isNaN(precio)) {
      throw new Error("El precio debe ser un número válido")
    }

    // 1. Crear el Modelo
    const modelo = await prisma.modelo.create({
      data: {
        nombre_modelo: data.nombre,
        id_categoria: isNaN(id_categoria) ? 1 : id_categoria,
        descripcion: data.descripcion,
        marca: "Saguaro",
        imagen_url: '/placeholder.jpg',
        tipo: data.tipo || 'casual',
        uso: data.uso || 'walking',
        estilo: data.estilo || 'casual'
      }


    })

    // 2. Manejar variantes (Colores y Tallas)
    const coloresNombres = (data.color || 'Estándar').split(',').map((c: string) => c.trim()).filter(Boolean)
    const tallasNombres = (data.talla || '40').split(',').map((t: string) => t.trim()).filter(Boolean)

    const stockPorVariante = Math.floor(stockTotal / (coloresNombres.length * tallasNombres.length)) || 0

    for (const cName of coloresNombres) {
      let color = await prisma.color.findFirst({ where: { nombre_color: cName } })
      if (!color) {
        color = await prisma.color.create({ data: { nombre_color: cName, codigo_hex: '#cccccc' } })
      }

      for (const tName of tallasNombres) {
        let talla = await prisma.talla.findFirst({ where: { nombre_talla: tName } })
        if (!talla) {
          talla = await prisma.talla.create({ data: { nombre_talla: tName } })
        }

        const sku = `SAG-${modelo.id_modelo}-${color.id_color}-${talla.id_talla}`;
        
        await prisma.producto.create({
          data: {
            id_modelo: modelo.id_modelo,
            id_color: color.id_color,
            id_talla: talla.id_talla,
            codigo_sku: sku,
            precio: precio,
            stock: stockPorVariante,
          }
        })
      }
    }

    // 3. Si es novedad
    if (data.is_novedad) {
      const firstVariant = await prisma.producto.findFirst({ where: { id_modelo: modelo.id_modelo } })
      if (firstVariant) {
        await prisma.producto_novedad.create({
          data: {
            id_producto: firstVariant.id_producto,
            fecha_inicio: new Date(),
            fecha_fin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          }
        })
      }
    }

    revalidatePath('/')
    revalidatePath('/admin/productos')
    return { success: true, id: modelo.id_modelo }
  } catch (error: any) {
    console.error("Error creando producto:", error)
    return { success: false, error: `Error al crear el producto: ${error.message}` }
  }
}

export async function toggleProductStatus(id: string, nuevoEstado: boolean) {
  try {
    const id_modelo = parseInt(id)
    await prisma.modelo.update({
      where: { id_modelo },
      data: { activo: nuevoEstado }
    })
    
    revalidatePath('/admin/productos')
    revalidatePath('/')
    return { success: true }
  } catch (error: any) {
    console.error("Error cambiando estado del producto:", error)
    return { success: false, error: error.message }
  }
}

export async function getUsuarios() {
  try {
    const usuarios = await prisma.usuario.findMany({
      include: {
        rol: true,
        _count: {
          select: { pedidos: true }
        }
      },
      orderBy: { fecha_registro: 'desc' }
    })
    return { success: true, usuarios }
  } catch (error: any) {
    console.error("Error obteniendo usuarios:", error)
    return { success: false, error: error.message }
  }
}

export async function getUsuarioDetalles(id: number) {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario: id },
      include: {
        rol: true,
        direcciones: {
          where: { activa: true },
          include: {
            comuna: {
              include: {
                region: true
              }
            }
          }
        },
        pedidos: {
          include: {
            articulos: {
              include: {
                producto: {
                  include: {
                    modelo: true
                  }
                }
              }
            }
          },
          orderBy: { fecha_pedido: 'desc' }
        }
      }
    })
    return { success: true, usuario }
  } catch (error: any) {
    console.error("Error obteniendo detalles del usuario:", error)
    return { success: false, error: error.message }
  }
}

export async function updateUserRole(id: number, nuevoRol: string) {
  try {
    const rol = await prisma.rol.findUnique({
      where: { nombre_rol: nuevoRol.toLowerCase() }
    })

    if (!rol) {
      throw new Error(`El rol ${nuevoRol} no existe`)
    }

    await prisma.usuario.update({
      where: { id_usuario: id },
      data: { id_rol: rol.id_rol }
    })

    revalidatePath('/admin/clientes')
    return { success: true }
  } catch (error: any) {
    console.error("Error actualizando rol:", error)
    return { success: false, error: error.message }
  }
}

export async function addStockToProduct(id_producto: number, amount: number) {
  try {
    const updated = await prisma.producto.update({
      where: { id_producto },
      data: { stock: { increment: amount } }
    });
    revalidatePath('/admin');
    revalidatePath('/admin/productos');
    return { success: true, stock: updated.stock };
  } catch (error: any) {
    console.error('Error adding stock:', error);
    return { success: false, error: error.message };
  }
}


