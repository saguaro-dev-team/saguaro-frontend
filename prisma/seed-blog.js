const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Seeding blog posts...')
  
  const posts = [
    {
      titulo: 'Los 5 beneficios de caminar descalzo (Barefoot)',
      slug: 'beneficios-caminar-descalzo-barefoot',
      resumen: 'Descubre cómo liberar tus pies puede mejorar tu postura, equilibrio y fuerza muscular de forma natural.',
      contenido: `Caminar descalzo, o usar calzado barefoot, es mucho más que una tendencia; es volver a nuestros orígenes. El pie humano es una obra maestra de la ingeniería con 26 huesos y miles de terminaciones nerviosas.\n\n1. Fortalecimiento muscular: Al no tener soporte artificial, los músculos del pie trabajan activamente.\n2. Mejor equilibrio: La conexión directa con el suelo mejora la propiocepción.\n3. Postura correcta: El diseño plano (Zero Drop) alinea la columna de forma natural.\n4. Alivio del dolor: Muchos problemas de espalda y rodilla provienen de calzado inadecuado.\n5. Puntera ancha: Permite que los dedos se expandan, evitando juanetes y malformaciones.\n\nEn Saguaro, diseñamos calzado que respeta esta anatomía para que camines como la naturaleza quiso.`,
      imagen_url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=2000&auto=format&fit=crop',
      autor: 'Dr. Diego Pies',
    },
    {
      titulo: 'Guía definitiva para transicionar al calzado minimalista',
      slug: 'guia-transicion-calzado-minimalista',
      resumen: 'No lo hagas de golpe. Te enseñamos cómo acostumbrar a tus pies al calzado barefoot paso a paso.',
      contenido: `Si has usado zapatillas con mucha amortiguación toda tu vida, tus pies necesitan un tiempo de adaptación. No intentes correr 10km el primer día con tus Saguaro.\n\nFase 1: Uso doméstico. Empieza usando tus barefoot en casa o para caminatas cortas de 15 minutos.\nFase 2: Fortalecimiento. Realiza ejercicios de movilidad de dedos y estiramientos de pantorrilla.\nFase 3: Incremento gradual. Aumenta el tiempo de uso cada semana un 10%.\n\nEscucha a tu cuerpo. Es normal sentir agujetas en zonas que no sabías que tenías músculos. ¡Esa es la señal de que tus pies están despertando!`,
      imagen_url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=2000&auto=format&fit=crop',
      autor: 'Coach María Running',
    }
  ]

  for (const post of posts) {
    await prisma.blog_posts.upsert({
      where: { slug: post.slug },
      update: {},
      create: post
    })
  }

  console.log('Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
