const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const rCount = await prisma.region.count();
  const cCount = await prisma.comuna.count();
  const colCount = await prisma.colores.count();
  console.log('--- DB STATUS ---');
  console.log('Regions:', rCount);
  console.log('Comunas:', cCount);
  console.log('Colors:', colCount);
}

check().catch(console.error).finally(() => prisma.$disconnect());
