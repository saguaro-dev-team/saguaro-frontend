'use server'

import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function getUserProfile(userId: string) {
  try {
    const id = parseInt(userId)
    if (isNaN(id)) return { success: false, error: 'ID inválido' }

    const user = await prisma.usuario.findUnique({
      where: { id_usuario: id },
      select: {
        rut: true,
        telefono: true,
        genero: true,
        fecha_nacimiento: true,
        nombres: true,
        primer_apellido: true
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
      where: { id_usuario: id, activa: true },
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
        detalles: data.detalles || null,
        activa: true,
        es_principal: false
      }
    })
    
    return { success: true, direccion }
  } catch (error) {
    console.error('Error al crear dirección:', error)
    return { success: false, error: 'No se pudo guardar la dirección' }
  }
}

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

    const user = await prisma.usuario.findUnique({ 
      where: { id_usuario: id },
      include: { login: true }
    })
    if (!user) return { success: false, error: 'Usuario no encontrado' }

    let updateData: any = {
      nombres: data.nombre,
      primer_apellido: data.apellido
    }
    
    if (data.telefono) updateData.telefono = data.telefono
    if (data.genero) updateData.genero = data.genero
    if (data.fecha_nacimiento) updateData.fecha_nacimiento = new Date(data.fecha_nacimiento)

    // Si hay cambio de contraseña y tiene login
    if (data.newPassword && data.currentPassword && user.login) {
      const isMatch = await bcrypt.compare(data.currentPassword, user.login.hash_contrasena)
      if (!isMatch) return { success: false, error: 'La contraseña actual es incorrecta' }
      
      const newHash = await bcrypt.hash(data.newPassword, 10)
      await prisma.usuario_login.update({
        where: { id_usuario: id },
        data: { hash_contrasena: newHash }
      })
    }

    await prisma.usuario.update({
      where: { id_usuario: id },
      data: updateData
    })

    return { success: true }
  } catch (error) {
    console.error('Error actualizando perfil:', error)
    return { success: false, error: 'Error al guardar los datos' }
  }
}
