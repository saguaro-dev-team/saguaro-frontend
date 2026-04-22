'use server'

import { prisma } from '@/lib/prisma'

export async function getUserProfile(userId: string) {
  try {
    const id = parseInt(userId)
    if (isNaN(id)) return { success: false, error: 'ID inválido' }

    const user = await prisma.usuarios.findUnique({
      where: { id_usuario: id },
      select: {
        rut: true,
        telefono: true,
        genero: true,
        fecha_nacimiento: true
      }
    })
    
    if (!user) return { success: false, error: 'Usuario no encontrado' }
    return { success: true, profile: user }
  } catch (error) {
    console.error('Error al cargar perfil:', error)
    return { success: false, error: 'Error del servidor' }
  }
}

export async function getUserAddresses(userId: string) {
  try {
    const id = parseInt(userId)
    if (isNaN(id)) return { success: false, error: 'ID de usuario inválido' }

    const direcciones = await prisma.direccion.findMany({
      where: { id_usuario: id, is_active: true },
      include: {
        comuna: {
          include: {
            region: true
          }
        }
      },
      orderBy: { id_direccion: 'desc' }
    })
    
    return { success: true, direcciones }
  } catch (error) {
    console.error('Error al cargar direcciones:', error)
    return { success: false, error: 'No se pudieron cargar las direcciones' }
  }
}

export async function addAddress(data: {
  userId: string
  calle: string
  numero: string
  id_comuna: number
  detalles?: string
}) {
  try {
    const id = parseInt(data.userId)
    if (isNaN(id)) return { success: false, error: 'ID de usuario inválido' }

    const direccion = await prisma.direccion.create({
      data: {
        id_usuario: id,
        calle: data.calle,
        numero: data.numero,
        id_comuna: data.id_comuna,
        detalles: data.detalles || null
      }
    })
    
    return { success: true, direccion }
  } catch (error) {
    console.error('Error al crear dirección:', error)
    return { success: false, error: 'No se pudo guardar la dirección' }
  }
}

import bcrypt from 'bcryptjs'

export async function updateUserProfile(data: {
  userId: string
  nombre: string
  apellido: string
  telefono?: string
  genero?: string
  fecha_nacimiento?: string
  currentPassword?: string
  newPassword?: string
}) {
  try {
    const id = parseInt(data.userId)
    if (isNaN(id)) return { success: false, error: 'ID inválido' }

    const user = await prisma.usuarios.findUnique({ where: { id_usuario: id } })
    if (!user) return { success: false, error: 'Usuario no encontrado' }

    let updateData: any = {
      nombre_completo: `${data.nombre} ${data.apellido}`.trim()
    }
    
    if (data.telefono) updateData.telefono = data.telefono
    if (data.genero) updateData.genero = data.genero
    if (data.fecha_nacimiento) updateData.fecha_nacimiento = new Date(data.fecha_nacimiento)

    if (data.newPassword && data.currentPassword) {
      const isMatch = await bcrypt.compare(data.currentPassword, user.password_hash)
      if (!isMatch) return { success: false, error: 'La contraseña actual es incorrecta' }
      updateData.password_hash = await bcrypt.hash(data.newPassword, 10)
    }

    await prisma.usuarios.update({
      where: { id_usuario: id },
      data: updateData
    })

    return { success: true }
  } catch (error) {
    console.error('Error actualizando perfil:', error)
    return { success: false, error: 'Error al guardar los datos' }
  }
}
