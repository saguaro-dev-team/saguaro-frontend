const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const regionsCount = await prisma.region.count();
  const comunasCount = await prisma.comuna.count();
  console.log('Regiones:', regionsCount);
  console.log('Comunas:', comunasCount);
  if (regionsCount > 0) {
    const r = await prisma.region.findFirst();
    console.log('Ejemplo Región:', r);
  }
}

check().catch(e => console.error(e)).finally(() => prisma.$disconnect());
