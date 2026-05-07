const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Seeding 2 sample blog posts...')

  const posts = [
    {
      titulo: 'Los beneficios de caminar descalzo',
      slug: 'beneficios-caminar-descalzo',
      contenido: '<p>Caminar descalzo, también conocido como "earthing" o "grounding", ofrece numerosos beneficios para la salud de tus pies y tu postura corporal...</p>',
      resumen: 'Descubre por qué liberar tus pies puede mejorar tu salud general.',
      imagen_url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=1000',
      autor: 'Alberto Quiroz',
      is_active: true
    },
    {
      titulo: 'Cómo elegir tu primer par de Saguaro',
      slug: 'como-elegir-saguaro',
      contenido: '<p>Si eres nuevo en el mundo barefoot, elegir tu primer par puede parecer abrumador. Aquí te damos los mejores consejos para una transición exitosa...</p>',
      resumen: 'Una guía completa para principiantes en el calzado barefoot.',
      imagen_url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=1000',
      autor: 'Marcelo Morales',
      is_active: true
    }
  ]

  for (const post of posts) {
    await prisma.blog_posts.upsert({
      where: { slug: post.slug },
      update: {},
      create: post
    })
    console.log(`Post creado: ${post.titulo}`)
  }

  console.log('Blog seeding finished successfully.')
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
