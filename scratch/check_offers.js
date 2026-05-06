const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const count = await prisma.producto_promocion.count({
    where: { activo: true }
  })
  console.log('Discounted products count:', count)
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
