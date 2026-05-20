const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const fs = require('fs')
const path = require('path')

// Load .env manually
try {
  const envPath = path.join(process.cwd(), '.env')
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8')
    for (const line of envConfig.split('\n')) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/)
      if (match) {
        const key = match[1]
        let val = match[2] || ''
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.substring(1, val.length - 1)
        } else if (val.startsWith("'") && val.endsWith("'")) {
          val = val.substring(1, val.length - 1)
        }
        process.env[key] = val.trim()
      }
    }
  }
} catch (e) {
  console.error('Error loading .env', e)
}

const prisma = new PrismaClient()

async function main() {
  const email = 'admin@saguaro.cl'
  const password = 'admin123'
  
  console.log(`Fixing access for ${email}...`)

  // 1. Buscar el usuario
  const user = await prisma.usuario.findUnique({
    where: { direccion_email: email }
  })

  if (!user) {
    console.error('Usuario no encontrado. Ejecuta primero el script de seed.')
    return
  }

  // 2. Hashear la contraseña
  const hash = await bcrypt.hash(password, 10)

  // 3. Crear o actualizar el acceso web (usuario_login)
  await prisma.usuario_login.upsert({
    where: { id_usuario: user.id_usuario },
    update: {
      hash_contrasena: hash,
      bloqueado: false
    },
    create: {
      id_usuario: user.id_usuario,
      hash_contrasena: hash,
      bloqueado: false
    }
  })

  console.log(`Acceso web habilitado para ${email} con la contraseña: ${password}`)
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
