const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // 1. Crear una promoción general si no existe
  let promo = await prisma.promocion.findFirst({
    where: { nombre: 'Ofertas de Verano' }
  })

  if (!promo) {
    promo = await prisma.promocion.create({
      data: {
        nombre: 'Ofertas de Verano',
        porcentaje_descuento: 20,
        fecha_ini: new Date(),
        fecha_fin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 días
      }
    })
  }

  // 2. Obtener algunos productos
  const productos = await prisma.producto.findMany({ take: 8 })

  // 3. Asignar la promoción a esos productos
  for (const prod of productos) {
    await prisma.producto_promocion.upsert({
      where: { id_producto_promocion: prod.id_producto }, // Usando id_producto como id_producto_promocion para simplificar en este script (aunque no sea lo ideal en producción)
      update: { activo: true, id_promocion: promo.id_promocion },
      create: {
        id_producto: prod.id_producto,
        id_promocion: promo.id_promocion,
        activo: true,
        descuento_especifico: Math.floor(Math.random() * 20) + 10 // Entre 10% y 30%
      }
    }).catch(e => {
        // Si el upsert falla por el ID, intentamos create simple
        return prisma.producto_promocion.create({
            data: {
                id_producto: prod.id_producto,
                id_promocion: promo.id_promocion,
                activo: true,
                descuento_especifico: Math.floor(Math.random() * 20) + 10
            }
        })
    })
  }

  console.log('Promociones creadas con éxito para 8 productos.')
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
