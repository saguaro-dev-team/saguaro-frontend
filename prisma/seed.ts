import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function main() {
  console.log('Creando categorías...')
  const catHombre = await prisma.categorias.upsert({ where: { nombre: 'Hombre' }, update: {}, create: { nombre: 'Hombre' } })
  const catMujer = await prisma.categorias.upsert({ where: { nombre: 'Mujer' }, update: {}, create: { nombre: 'Mujer' } })
  const catNino = await prisma.categorias.upsert({ where: { nombre: 'Niño' }, update: {}, create: { nombre: 'Niño' } })

  console.log('Borrando productos antiguos para evitar duplicados...')
  await prisma.productos.deleteMany({})

  console.log('Buscando archivos de zapatillas...')
  const publicDir = path.join(process.cwd(), 'public', 'zapatillas')
  const folders = [
    { dir: 'hombre', cat: catHombre.id_categoria, nov: false },
    { dir: 'mujer', cat: catMujer.id_categoria, nov: false },
    { dir: 'nino', cat: catNino.id_categoria, nov: false },
    { dir: 'novedades', cat: null, nov: true } // We will assign cat dynamically based on name
  ]

  for (const f of folders) {
    const dirPath = path.join(publicDir, f.dir)
    if (!fs.existsSync(dirPath)) continue

    const files = fs.readdirSync(dirPath)
    for (const file of files) {
      if (file.startsWith('.')) continue
      
      const imgPath = `/zapatillas/${f.dir}/${file}`
      
      // Clean name for display: "kids-brisk-ii-barefoot-rain-boots.jpg" -> "Kids Brisk Ii Barefoot Rain Boots"
      let cleanName = path.parse(file).name
        .replace(/-/g, ' ')
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')

      const precio = Math.floor(Math.random() * (6 - 3) + 3) * 10000 + 990

      let finalCat = f.cat
      if (f.dir === 'novedades') {
        const ln = cleanName.toLowerCase()
        if (ln.includes('kid')) finalCat = catNino.id_categoria
        else if (ln.includes('rise') || ln.includes('nudo') || ln.includes('ambition')) finalCat = catMujer.id_categoria
        else finalCat = catHombre.id_categoria
      }

      await prisma.productos.create({
        data: {
          id_categoria: finalCat,
          nombre: cleanName,
          descripcion: "Zapatillas Saguaro Barefoot originales. Diseño anatómico que respeta la forma natural del pie, ofreciendo flexibilidad y comodidad inigualable para tu día a día.",
          precio_normal: precio,
          stock: 50,
          imagen_url: imgPath,
          talla: "38-42",
          color: "Negro,Gris,Azul",
          is_novedad: f.nov,
          is_active: true,
          is_recomendado: Math.random() > 0.7 // Randomly feature some
        }
      })
      console.log(`Creado: ${cleanName}`)
    }
  }

  console.log('¡Productos sembrados con éxito!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
