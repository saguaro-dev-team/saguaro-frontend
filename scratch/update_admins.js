const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Updating Admin Roles...')

  const roleAdmin = await prisma.rol.findUnique({ where: { nombre_rol: 'admin' } })

  // 1. Marcelo y Yassmin a Admin
  await prisma.usuario.updateMany({
    where: { 
      direccion_email: { in: ['marcj.morales@duocuc.cl', 'ya.bazan@duocuc.cl'] } 
    },
    data: { id_rol: roleAdmin.id_rol }
  })

  // 2. Buscar cuenta admin@saguaro (probablemente admin@saguaro.cl)
  const adminAccount = await prisma.usuario.findFirst({
    where: { direccion_email: { startsWith: 'admin@saguaro' } }
  })

  if (adminAccount) {
    await prisma.usuario.update({
      where: { id_usuario: adminAccount.id_usuario },
      data: { id_rol: roleAdmin.id_rol }
    })
    console.log(`Cuenta ${adminAccount.direccion_email} actualizada a Admin.`)
  } else {
    // Si no existe, la creamos
    await prisma.usuario.create({
      data: {
        nombres: 'Administrador',
        primer_apellido: 'Saguaro',
        segundo_apellido: 'Sistema',
        rut: '9.999.999-9',
        telefono: '+56900000000',
        direccion_email: 'admin@saguaro.cl',
        genero: 'Otro',
        fecha_nacimiento: new Date('1990-01-01'),
        id_rol: roleAdmin.id_rol,
        estado: true
      }
    })
    console.log('Cuenta admin@saguaro.cl creada como Admin.')
  }

  console.log('Marcelo y Yassmin ahora son Admins.')
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
