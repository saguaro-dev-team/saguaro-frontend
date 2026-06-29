'use server'

import fs from 'fs'
import path from 'path'
import { revalidatePath } from 'next/cache'

function safeRevalidatePath(p: string) {
  try {
    revalidatePath(p)
  } catch (e) {
    // Ignorar error de contexto fuera de Next.js (por ejemplo, al ejecutar scripts de prueba)
  }
}

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
    const usuarioId = formData.get('usuarioId') as string | null

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
      respondido: false,
      usuarioId: usuarioId || null
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

    safeRevalidatePath('/admin/mensajes')
    return { success: true }
  } catch (error: any) {
    console.error('Error al enviar el mensaje:', error)
    return { success: false, error: 'Hubo un problema al enviar tu mensaje.' }
  }
}

export async function subscribeToNewsletter(email: string) {
  try {
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Por favor ingresa un correo válido.' }
    }

    // Leer mensajes existentes
    let mensajes = []
    if (fs.existsSync(mensajesFilePath)) {
      const fileContent = fs.readFileSync(mensajesFilePath, 'utf8')
      mensajes = JSON.parse(fileContent)
    }

    // Check if already subscribed
    const existing = mensajes.find((m: any) => m.email === email && m.motivo === 'newsletter')
    if (existing) {
      return { success: true, alreadySubscribed: true }
    }

    const nuevoMensaje = {
      id: Date.now().toString(),
      fecha: new Date().toISOString(),
      nombre: 'Suscriptor Boletín',
      email,
      motivo: 'newsletter',
      mensaje: 'El usuario se suscribió al boletín de ofertas y novedades.',
      numero_pedido: null,
      linkedin_url: null,
      cv_url: null,
      leido: false,
      respondido: false
    }

    mensajes.unshift(nuevoMensaje)
    fs.writeFileSync(mensajesFilePath, JSON.stringify(mensajes, null, 2), 'utf8')

    safeRevalidatePath('/admin/mensajes')
    return { success: true }
  } catch (error: any) {
    console.error('Error al suscribir:', error)
    return { success: false, error: 'Ocurrió un error al procesar tu suscripción.' }
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
            safeRevalidatePath('/admin/mensajes');
            return { success: true };
        }
        return { success: false, error: 'Mensaje no encontrado' };
    } catch (error) {
        return { success: false };
    }
}

export async function replyToMessage(id: string, replyText: string) {
  try {
    let mensajes = await getContactMessages()
    const index = mensajes.findIndex((m: any) => m.id === id)
    if (index !== -1) {
      mensajes[index].leido = true
      mensajes[index].respondido = true
      mensajes[index].respuesta = replyText
      mensajes[index].fecha_respuesta = new Date().toISOString()
      
      fs.writeFileSync(mensajesFilePath, JSON.stringify(mensajes, null, 2), 'utf8')

      // Enviar correo real o simular según configuración SMTP en .env
      const smtpHost = process.env.SMTP_HOST
      const smtpPort = process.env.SMTP_PORT
      const smtpUser = process.env.SMTP_USER
      const smtpPass = process.env.SMTP_PASS
      const smtpFrom = process.env.SMTP_FROM || 'Saguaro Chile <contacto@saguaro.cl>'

      const getMotivoLabelText = (m: string) => {
        switch (m) {
          case 'soporte': return 'Soporte / Pedido'
          case 'tallas': return 'Dudas Tallas'
          case 'trabaja': return 'Postulación Trabajo'
          case 'mayorista': return 'Mayorista / Colaboración'
          default: return 'Otro Motivo'
        }
      }

      if (smtpHost && smtpPort && smtpUser && smtpPass) {
        const nodemailer = await import('nodemailer')
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: parseInt(smtpPort),
          secure: parseInt(smtpPort) === 465, // true para puerto 465, false para otros como 587
          auth: {
            user: smtpUser,
            password: smtpPass,
          },
        } as any)

        const motivoLabel = getMotivoLabelText(mensajes[index].motivo)
        await transporter.sendMail({
          from: smtpFrom,
          to: mensajes[index].email,
          subject: `RE: Consulta a Saguaro Chile - Motivo: ${motivoLabel}`,
          text: replyText,
        })

        console.log(`[SMTP EMAIL SENT] Correo real enviado con éxito desde ${smtpFrom} a ${mensajes[index].email}`)
      } else {
        // Fallback: Simulación de envío de correo en consola si no hay SMTP configurado
        console.log('==================================================')
        console.log('📧 [SIMULACIÓN CORREO ELECTRÓNICO] - RESPUESTA CONTACTO')
        console.log(`De: ${smtpFrom}`)
        console.log(`Para: ${mensajes[index].nombre} <${mensajes[index].email}>`)
        console.log(`Asunto: RE: Consulta a Saguaro Chile - Motivo: ${getMotivoLabelText(mensajes[index].motivo)}`)
        console.log(`Fecha: ${new Date().toLocaleString('es-CL')}`)
        console.log('--------------------------------------------------')
        console.log(`Hola ${mensajes[index].nombre},`)
        console.log(replyText)
        console.log('--------------------------------------------------')
        console.log('Cordialmente,')
        console.log('Equipo Saguaro Chile')
        console.log('==================================================')
      }

      safeRevalidatePath('/admin/mensajes')
      return { success: true }
    }
    return { success: false, error: 'Mensaje no encontrado' }
  } catch (error: any) {
    console.error("Error al responder mensaje:", error)
    return { success: false, error: error.message }
  }
}

export async function getUserContactMessages(userId: string, email: string) {
  try {
    const msgs = await getContactMessages()
    const userMsgs = msgs.filter((m: any) => m.usuarioId === userId || m.email === email)
    return { success: true, messages: userMsgs }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
