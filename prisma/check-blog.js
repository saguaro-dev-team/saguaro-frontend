const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const posts = await prisma.blog_posts.findMany();
  console.log('--- BLOG POSTS IN DB ---');
  console.log('Total:', posts.length);
  posts.forEach(p => console.log(`- [${p.id_post}] ${p.titulo} (Slug: ${p.slug}, Active: ${p.is_active})`));
  
  if (posts.length === 0) {
    console.log('Creating emergency test post...');
    await prisma.blog_posts.create({
      data: {
        titulo: 'Bienvenidos a Saguaro Blog',
        slug: 'bienvenidos-saguaro-blog',
        contenido: 'Este es nuestro primer post oficial. Aquí encontrarás todo sobre calzado barefoot.',
        resumen: '¡Hola! Bienvenidos a nuestra comunidad.',
        is_active: true
      }
    });
    console.log('Emergency post created!');
  }
}

check().catch(console.error).finally(() => prisma.$disconnect());
