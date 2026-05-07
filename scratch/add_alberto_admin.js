const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Ensuring Alberto Quiroz is an Admin...')

  // 1. Asegurar que el rol admin exista
  const roleAdmin = await prisma.rol.upsert({
    where: { nombre_rol: 'admin' },
    update: {},
    create: { nombre_rol: 'admin', descripcion: 'Rol de administrador' }
  })

  // 2. Crear o actualizar a Alberto como Admin
  const alberto = await prisma.usuario.upsert({
    where: { direccion_email: 'albe.quiroz@duocuc.cl' },
    update: { id_rol: roleAdmin.id_rol },
    create: {
      nombres: 'Alberto',
      primer_apellido: 'Quiroz',
      segundo_apellido: 'Admin',
      rut: '1-9',
      telefono: '+56900000000',
      direccion_email: 'albe.quiroz@duocuc.cl',
      genero: 'Masculino',
      fecha_nacimiento: new Date('1990-01-01'),
      id_rol: roleAdmin.id_rol,
      estado: true
    }
  })

  // 3. Asegurar que tenga login
  await prisma.usuario_login.upsert({
    where: { id_usuario: alberto.id_usuario },
    update: {},
    create: {
      id_usuario: alberto.id_usuario,
      hash_contrasena: '$2b$10$SampleHashForTestingPurposesOnly', // Password genérico para pruebas
      bloqueado: false
    }
  })

  console.log(`Alberto Quiroz ahora es Admin (ID: ${alberto.id_usuario})`)
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
