'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

function safeRevalidatePath(p: string) {
  try {
    revalidatePath(p)
  } catch (e) {
    // Ignorar errores fuera del contexto de Next.js
  }
}

export async function createProductRating(data: {
  id_usuario: number
  id_producto: number
  puntuacion: number
  comentario?: string
}) {
  try {
    const { id_usuario, id_producto, puntuacion, comentario } = data

    if (puntuacion < 1 || puntuacion > 5) {
      return { success: false, error: 'La calificación debe estar entre 1 y 5 estrellas.' }
    }

    // Verificar si el usuario ya valoró este producto
    const existing = await prisma.valoracion.findFirst({
      where: { id_usuario, id_producto }
    })

    if (existing) {
      return { success: false, error: 'Ya has calificado este producto.' }
    }

    // Crear la valoración
    await prisma.valoracion.create({
      data: {
        id_usuario,
        id_producto,
        puntuacion,
        comentario: comentario?.trim() || null
      }
    })

    // Revalidar las páginas dinámicas afectadas
    safeRevalidatePath(`/producto/${id_producto}`)
    safeRevalidatePath('/perfil')

    return { success: true }
  } catch (error: any) {
    console.error('Error al crear la valoración:', error)
    return { success: false, error: error.message || 'Error del servidor' }
  }
}

export async function getProductReviews(id_producto: number) {
  try {
    const reviews = await prisma.valoracion.findMany({
      where: { id_producto },
      include: {
        usuario: {
          select: {
            nombres: true,
            primer_apellido: true
          }
        }
      },
      orderBy: { fecha_creacion: 'desc' }
    })

    return {
      success: true,
      reviews: reviews.map(r => ({
        id_valoracion: r.id_valoracion,
        id_usuario: r.id_usuario,
        puntuacion: r.puntuacion,
        comentario: r.comentario,
        fecha_creacion: r.fecha_creacion,
        usuario: r.usuario ? {
          nombre: r.usuario.nombres,
          apellido: r.usuario.primer_apellido
        } : null
      }))
    }
  } catch (error: any) {
    console.error('Error al obtener reseñas del producto:', error)
    return { success: false, error: error.message || 'Error del servidor' }
  }
}

export async function getProductAverage(id_producto: number) {
  try {
    const stats = await prisma.valoracion.aggregate({
      where: { id_producto },
      _avg: {
        puntuacion: true
      },
      _count: {
        id_valoracion: true
      }
    })

    return {
      success: true,
      average: stats._avg.puntuacion || 0,
      count: stats._count.id_valoracion || 0
    }
  } catch (error: any) {
    console.error('Error al obtener promedio del producto:', error)
    return { success: false, average: 0, count: 0 }
  }
}

export async function getAdminReviews() {
  try {
    const reviews = await prisma.valoracion.findMany({
      include: {
        usuario: {
          select: {
            nombres: true,
            primer_apellido: true,
            direccion_email: true
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
      orderBy: { fecha_creacion: 'desc' }
    })

    return {
      success: true,
      reviews: reviews.map(r => ({
        id_valoracion: r.id_valoracion,
        puntuacion: r.puntuacion,
        comentario: r.comentario,
        fecha_creacion: r.fecha_creacion,
        usuario: r.usuario ? {
          nombre: `${r.usuario.nombres} ${r.usuario.primer_apellido}`,
          email: r.usuario.direccion_email
        } : null,
        producto: {
          id_producto: r.producto.id_producto,
          sku: r.producto.codigo_sku,
          modelo: r.producto.modelo.nombre_modelo,
          color: r.producto.color.nombre_color,
          talla: r.producto.talla.nombre_talla
        }
      }))
    }
  } catch (error: any) {
    console.error('Error al obtener valoraciones de administrador:', error)
    return { success: false, error: error.message || 'Error del servidor' }
  }
}

export async function deleteReview(id_valoracion: number) {
  try {
    // Obtener la valoración para saber qué producto revalidar
    const val = await prisma.valoracion.findUnique({
      where: { id_valoracion },
      select: { id_producto: true }
    })

    if (!val) {
      return { success: false, error: 'Reseña no encontrada' }
    }

    await prisma.valoracion.delete({
      where: { id_valoracion }
    })

    // Revalidar páginas dinámicas
    safeRevalidatePath(`/producto/${val.id_producto}`)
    safeRevalidatePath('/admin/valoraciones')

    return { success: true }
  } catch (error: any) {
    console.error('Error al eliminar reseña:', error)
    return { success: false, error: error.message || 'Error del servidor' }
  }
}
