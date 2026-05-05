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
    const existingUser = await prisma.usuario.findFirst({
      where: {
        OR: [
          { direccion_email: data.email },
          { rut: data.rut }
        ]
      }
    })

    if (existingUser) {
      if (existingUser.direccion_email === data.email) return { success: false, error: 'El email ya está registrado' }
      if (existingUser.rut === data.rut) return { success: false, error: 'El RUT ya está registrado' }
    }

    // Hashear la contraseña
    const password_hash = await bcrypt.hash(data.password, 10)

    // Insertar en la base de datos usando una transacción para asegurar integridad
    const result = await prisma.$transaction(async (tx) => {
      
      // Buscar o crear el rol Cliente por defecto
      let rolCliente = await tx.rol.findFirst({ where: { nombre_rol: 'Cliente' }})
      if (!rolCliente) {
        rolCliente = await tx.rol.create({ data: { nombre_rol: 'Cliente', descripcion: 'Usuario estandar' }})
      }

      const user = await tx.usuario.create({
        data: {
          nombres: data.nombre,
          primer_apellido: data.apellido,
          segundo_apellido: '', // Si tuvieran 2 apellidos se agregaría aquí
          rut: data.rut,
          direccion_email: data.email,
          telefono: data.telefono,
          genero: data.genero,
          fecha_nacimiento: new Date(data.fecha_nacimiento),
          estado: true,
          id_rol: rolCliente.id_rol
        }
      })

      // Crear credenciales de acceso separadas según Nuevo Modelo
      await tx.usuario_login.create({
        data: {
          id_usuario: user.id_usuario,
          hash_contrasena: password_hash,
          bloqueado: false
        }
      })

      // Crear dirección
      if (data.id_comuna) {
        await tx.direccion.create({
          data: {
            id_usuario: user.id_usuario,
            id_comuna: data.id_comuna,
            calle: data.calle || 'Calle pendiente',
            numero: data.numero || 'S/N',
            detalles: data.detalles || '',
            activa: true,
            es_principal: true
          }
        })
      }

      return user
    })

    return { 
      success: true, 
      user: { 
        id: result.id_usuario, 
        email: result.direccion_email, 
        nombre: result.nombres, 
        apellido: result.primer_apellido 
      } 
    }
  } catch (error) {
    console.error('Error registrando usuario:', error)
    return { success: false, error: 'Error del servidor al crear la cuenta' }
  }
}

export async function loginUser(email: string, password: string) {
  try {
    const user = await prisma.usuario.findUnique({
      where: { direccion_email: email },
      include: {
        login: true,
        rol: true
      }
    })

    if (!user) return { success: false, error: 'Credenciales inválidas' }
    if (!user.estado) return { success: false, error: 'Tu cuenta ha sido desactivada' }
    if (!user.login) return { success: false, error: 'Cuenta no tiene acceso web' }
    if (user.login.bloqueado) return { success: false, error: 'Tu cuenta ha sido bloqueada' }

    const isMatch = await bcrypt.compare(password, user.login.hash_contrasena)
    if (!isMatch) {
      // Opcional: Registrar en historial_intentos_login
      return { success: false, error: 'Credenciales inválidas' }
    }

    // Actualizar fecha conexión
    await prisma.usuario_login.update({
      where: { id_usuario: user.id_usuario },
      data: { fecha_conexion: new Date() }
    })

    return { 
      success: true, 
      user: { 
        id: user.id_usuario, 
        email: user.direccion_email, 
        nombre: user.nombres, 
        apellido: user.primer_apellido,
        role: user.rol?.nombre_rol.toLowerCase() || 'cliente',
        fechaRegistro: user.fecha_registro
      } 
    }
  } catch (error) {
    console.error('Error en login:', error)
    return { success: false, error: 'Error interno del servidor' }
  }
}
