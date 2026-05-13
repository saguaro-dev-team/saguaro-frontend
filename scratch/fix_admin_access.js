const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
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
