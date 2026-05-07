const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Seeding 5 sample users...')

  // 1. Asegurar que los roles existan
  const roles = ['admin', 'cliente']
  for (const rName of roles) {
    await prisma.rol.upsert({
      where: { nombre_rol: rName },
      update: {},
      create: { nombre_rol: rName, descripcion: `Rol de ${rName}` }
    })
  }

  const roleCliente = await prisma.rol.findUnique({ where: { nombre_rol: 'cliente' } })
  
  const sampleUsers = [
    {
      nombres: 'Marcelo',
      primer_apellido: 'Morales',
      segundo_apellido: 'Mellado',
      rut: '12.345.678-9',
      telefono: '+56911112222',
      direccion_email: 'marcj.morales@duocuc.cl',
      genero: 'Masculino',
      fecha_nacimiento: new Date('1995-05-20'),
    },
    {
      nombres: 'Yassmin',
      primer_apellido: 'Bazan',
      segundo_apellido: 'Gomez',
      rut: '23.456.789-0',
      telefono: '+56933334444',
      direccion_email: 'ya.bazan@duocuc.cl',
      genero: 'Femenino',
      fecha_nacimiento: new Date('1998-10-15'),
    },
    {
      nombres: 'Camila',
      primer_apellido: 'Rojas',
      segundo_apellido: 'Perez',
      rut: '18.999.888-7',
      telefono: '+56955556666',
      direccion_email: 'cami.rojas@gmail.com',
      genero: 'Femenino',
      fecha_nacimiento: new Date('1992-03-22'),
    },
    {
      nombres: 'Diego',
      primer_apellido: 'Soto',
      segundo_apellido: 'Torres',
      rut: '20.111.222-3',
      telefono: '+56977778888',
      direccion_email: 'diego.soto@outlook.com',
      genero: 'Masculino',
      fecha_nacimiento: new Date('2000-01-10'),
    },
    {
      nombres: 'Francisca',
      primer_apellido: 'Leiva',
      segundo_apellido: 'Castro',
      rut: '15.444.333-2',
      telefono: '+56999990000',
      direccion_email: 'fran.leiva@gmail.com',
      genero: 'Femenino',
      fecha_nacimiento: new Date('1988-12-05'),
    }
  ]

  for (const u of sampleUsers) {
    const usuario = await prisma.usuario.upsert({
      where: { direccion_email: u.direccion_email },
      update: { id_rol: roleCliente.id_rol },
      create: {
        ...u,
        id_rol: roleCliente.id_rol,
        estado: true
      }
    })

    // Crear login si no existe
    await prisma.usuario_login.upsert({
      where: { id_usuario: usuario.id_usuario },
      update: {},
      create: {
        id_usuario: usuario.id_usuario,
        hash_contrasena: '$2b$10$SampleHashForTestingPurposesOnly', // Password genérico
        bloqueado: false
      }
    })

    console.log(`Usuario creado: ${u.nombres} ${u.primer_apellido}`)
  }

  console.log('Seeding finished successfully.')
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
