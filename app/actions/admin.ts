'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function updateProductType(id: string, nuevoTipo: string) {
  try {
    await prisma.productos.update({
      where: { id_producto: parseInt(id) },
      data: { tipo: nuevoTipo }
    })
    
    // Revalidar las paginas afectadas para que se refresquen los datos
    revalidatePath('/')
    revalidatePath('/categoria/hombre')
    revalidatePath('/categoria/mujer')
    revalidatePath('/categoria/nino')
    revalidatePath('/admin/productos')
    
    return { success: true }
  } catch (error) {
    console.error("Error actualizando tipo:", error)
    return { success: false, error: "Error de base de datos" }
  }
}

export async function getConfiguracion() {
  let config = await prisma.configuracion_tienda.findUnique({ where: { id_config: 1 } })
  if (!config) {
    config = await prisma.configuracion_tienda.create({
      data: { 
        id_config: 1, 
        politica_envio: 'Envío gratis en compras sobre $50.000\nDespacho a todo Chile\nTiempo de entrega: 3-5 días hábiles (Santiago), 5-10 días hábiles (regiones)', 
        politica_devoluciones: '30 días para realizar cambios o devoluciones\nProductos deben estar sin uso y con etiquetas originales\nCambios de talla sin costo adicional' 
      }
    })
  }
  return config
}

export async function updateConfiguracion(envio: string, devoluciones: string) {
  try {
    await prisma.configuracion_tienda.upsert({
      where: { id_config: 1 },
      update: { politica_envio: envio, politica_devoluciones: devoluciones },
      create: { id_config: 1, politica_envio: envio, politica_devoluciones: devoluciones }
    })
    return { success: true }
  } catch(error) {
    console.error("Error actualizando configuracion:", error)
    return { success: false, error: 'Error guardando configuración' }
  }
}

export async function updateProductCaracteristicas(id: string, caracteristicas: string[]) {
  try {
    await prisma.productos.update({
      where: { id_producto: parseInt(id) },
      data: { caracteristicas }
    })
    revalidatePath(`/producto/${id}`)
    revalidatePath('/admin/productos')
    return { success: true }
  } catch (error) {
    console.error("Error guardando caracteristicas:", error)
    return { success: false, error: 'Error guardando características' }
  }
}

export async function updateProductDescription(id: string, descripcion: string) {
  try {
    await prisma.productos.update({
      where: { id_producto: parseInt(id) },
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

export async function updateProductFull(id: string, data: any) {
  try {
    console.log(`[updateProductFull] Actualizando ID: ${id}`, data)
    
    // Validaciones numéricas robustas
    const precio_normal = parseInt(data.precio_normal)
    const precio_oferta = data.precio_oferta && data.precio_oferta !== "" ? parseInt(data.precio_oferta) : null
    const stock = parseInt(data.stock)
    const id_categoria = parseInt(data.id_categoria)

    if (isNaN(precio_normal) || isNaN(stock)) {
      throw new Error("El precio y el stock deben ser números válidos")
    }

    await prisma.productos.update({
      where: { id_producto: parseInt(id) },
      data: {
        nombre: data.nombre,
        id_categoria: isNaN(id_categoria) ? undefined : id_categoria,
        descripcion: data.descripcion,
        precio_normal,
        precio_oferta,
        stock,
        talla: data.talla,
        color: data.color,
        tipo: data.tipo,
        genero: data.genero,
        uso: data.uso,
        estilo: data.estilo,
        is_novedad: data.is_novedad,
        is_recomendado: data.is_recomendado,
        caracteristicas: data.caracteristicas // Prisma maneja el reemplazo de arrays
      }
    })
    
    revalidatePath('/')
    revalidatePath('/admin/productos')
    return { success: true }
  } catch (error: any) {
    console.error("Error DETALLADO actualizando producto:", error)
    // Devolver un mensaje más específico si es posible
    const msg = error.message || 'Error desconocido'
    return { success: false, error: `No se pudo guardar: ${msg}. Asegúrate de que los precios sean números y no superes los límites de texto.` }
  }
}

export async function createProduct(data: any) {
  try {
    const precio_normal = parseInt(data.precio_normal)
    const precio_oferta = data.precio_oferta && data.precio_oferta !== "" ? parseInt(data.precio_oferta) : null
    const stock = parseInt(data.stock)
    const id_categoria = parseInt(data.id_categoria)

    if (isNaN(precio_normal) || isNaN(stock)) {
      throw new Error("El precio y el stock deben ser números válidos")
    }

    const product = await prisma.productos.create({
      data: {
        nombre: data.nombre,
        id_categoria: isNaN(id_categoria) ? 1 : id_categoria,
        descripcion: data.descripcion,
        precio_normal,
        precio_oferta,
        stock,
        talla: data.talla,
        color: data.color,
        tipo: data.tipo || 'casual',
        genero: data.genero,
        uso: data.uso,
        estilo: data.estilo,
        is_novedad: data.is_novedad || false,
        is_recomendado: data.is_recomendado || false,
        caracteristicas: data.caracteristicas || [],
        imagen_url: '/placeholder.jpg'
      }
    })
    revalidatePath('/')
    revalidatePath('/admin/productos')
    return { success: true, id: product.id_producto }
  } catch (error: any) {
    console.error("Error creando producto:", error)
    return { success: false, error: `Error al crear el producto: ${error.message}` }
  }
}
