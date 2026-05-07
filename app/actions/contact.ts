'use server'

import fs from 'fs'
import path from 'path'
import { revalidatePath } from 'next/cache'

const mensajesFilePath = path.join(process.cwd(), 'lib', 'mensajes-data.json')
const uploadsDir = path.join(process.cwd(), 'public', 'uploads')

export async function submitContactMessage(formData: FormData) {
  try {
    const nombre = formData.get('nombre') as string
    const email = formData.get('email') as string
    const motivo = formData.get('motivo') as string
    const mensaje = formData.get('mensaje') as string
    
    // Opcionales
    const numero_pedido = formData.get('numero_pedido') as string | null
    const linkedin_url = formData.get('linkedin_url') as string | null
    const cv_file = formData.get('cv_file') as File | null

    let cv_url = null

    // Asegurar que el directorio de subidas existe
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }

    // Manejar el archivo adjunto (CV)
    if (cv_file && cv_file.size > 0) {
      const arrayBuffer = await cv_file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const fileName = `${Date.now()}_${cv_file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const filePath = path.join(uploadsDir, fileName)
      
      fs.writeFileSync(filePath, buffer)
      cv_url = `/uploads/${fileName}`
    }

    // Leer mensajes existentes
    let mensajes = []
    if (fs.existsSync(mensajesFilePath)) {
      const fileContent = fs.readFileSync(mensajesFilePath, 'utf8')
      mensajes = JSON.parse(fileContent)
    }

    const nuevoMensaje = {
      id: Date.now().toString(),
      fecha: new Date().toISOString(),
      nombre,
      email,
      motivo,
      mensaje,
      numero_pedido,
      linkedin_url,
      cv_url,
      leido: false,
      respondido: false
    }

    // Guardar en "base de datos" local (JSON)
    mensajes.unshift(nuevoMensaje)
    fs.writeFileSync(mensajesFilePath, JSON.stringify(mensajes, null, 2), 'utf8')

    // MOCK: Enviar Email de Notificación a chilesaguaro@outlook.com
    console.log('--- ENVIANDO EMAIL DE NOTIFICACIÓN ---')
    console.log(`Para: chilesaguaro@outlook.com`)
    console.log(`Asunto: Nuevo mensaje de contacto - ${motivo}`)
    console.log(`Nombre: ${nombre}`)
    console.log(`Email del usuario: ${email}`)
    console.log(`Mensaje: ${mensaje}`)
    if (numero_pedido) console.log(`Número de pedido: ${numero_pedido}`)
    if (linkedin_url) console.log(`LinkedIn: ${linkedin_url}`)
    if (cv_url) console.log(`CV Adjunto: (Guardado en el servidor: ${cv_url})`)
    console.log('--------------------------------------')
    // Nota para el usuario: Aquí se integraría Resend, SendGrid o nodemailer en un entorno de producción real.

    revalidatePath('/admin/mensajes')
    return { success: true }
  } catch (error: any) {
    console.error('Error al enviar el mensaje:', error)
    return { success: false, error: 'Hubo un problema al enviar tu mensaje.' }
  }
}

export async function getContactMessages() {
  try {
    if (!fs.existsSync(mensajesFilePath)) {
      return []
    }
    const fileContent = fs.readFileSync(mensajesFilePath, 'utf8')
    return JSON.parse(fileContent)
  } catch (error) {
    console.error("Error leyendo mensajes:", error)
    return []
  }
}

export async function markMessageAsRead(id: string) {
    try {
        let mensajes = await getContactMessages();
        const index = mensajes.findIndex((m: any) => m.id === id);
        if (index !== -1) {
            mensajes[index].leido = true;
            fs.writeFileSync(mensajesFilePath, JSON.stringify(mensajes, null, 2), 'utf8');
            revalidatePath('/admin/mensajes');
            return { success: true };
        }
        return { success: false, error: 'Mensaje no encontrado' };
    } catch (error) {
        return { success: false };
    }
}
