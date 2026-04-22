'use server'

import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function registerUser(data: {
  email: string
  password: string
  nombre: string
  apellido: string
  rut: string
  telefono: string
  genero: string
  fecha_nacimiento: string
  calle?: string
  numero?: string
  id_comuna?: number
  detalles?: string
}) {
  try {
    // Verificar si el correo o RUT ya existen
    const existingUser = await prisma.usuarios.findFirst({
      where: {
        OR: [
          { email: data.email },
          { rut: data.rut }
        ]
      }
    })

    if (existingUser) {
      if (existingUser.email === data.email) return { success: false, error: 'El email ya está registrado' }
      if (existingUser.rut === data.rut) return { success: false, error: 'El RUT ya está registrado' }
    }

    // Hashear la contraseña
    const password_hash = await bcrypt.hash(data.password, 10)
    const nombre_completo = `${data.nombre} ${data.apellido}`

    // Insertar en la base de datos usando una transacción para asegurar integridad
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.usuarios.create({
        data: {
          nombre_completo,
          rut: data.rut,
          email: data.email,
          password_hash,
          telefono: data.telefono,
          genero: data.genero,
          fecha_nacimiento: new Date(data.fecha_nacimiento),
          rol: 'Cliente'
        }
      })

      if (data.id_comuna) {
        await tx.direccion.create({
          data: {
            id_usuario: user.id_usuario,
            id_comuna: data.id_comuna,
            calle: data.calle || 'Calle pendiente',
            numero: data.numero || 'S/N',
            detalles: data.detalles || '',
            is_active: true
          }
        })
      }

      return user
    })

    return { 
      success: true, 
      user: { 
        id: result.id_usuario, 
        email: result.email, 
        nombre: data.nombre, 
        apellido: data.apellido 
      } 
    }
  } catch (error) {
    console.error('Error registrando usuario:', error)
    return { success: false, error: 'Error del servidor al crear la cuenta' }
  }
}

export async function loginUser(email: string, password: string) {
  try {
    const user = await prisma.usuarios.findUnique({
      where: { email }
    })

    if (!user) return { success: false, error: 'Credenciales inválidas' }
    if (!user.is_active) return { success: false, error: 'Tu cuenta ha sido desactivada' }

    const isMatch = await bcrypt.compare(password, user.password_hash)
    if (!isMatch) return { success: false, error: 'Credenciales inválidas' }

    // Intentar separar el nombre completo en nombre y apellido
    const nameParts = user.nombre_completo.split(' ')
    const nombre = nameParts[0]
    const apellido = nameParts.length > 1 ? nameParts.slice(1).join(' ') : ''

    return { 
      success: true, 
      user: { 
        id: user.id_usuario, 
        email: user.email, 
        nombre, 
        apellido,
        role: user.rol?.toLowerCase() || 'cliente',
        fechaRegistro: user.fecha_registro
      } 
    }
  } catch (error) {
    console.error('Error en login:', error)
    return { success: false, error: 'Error interno del servidor' }
  }
}
