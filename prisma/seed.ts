import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function main() {
  console.log('Sembrando tallas básicas...')
  const tallasStr = ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];
  const tallas = [];
  for (const t of tallasStr) {
    let talla = await prisma.talla.findFirst({ where: { nombre_talla: t } });
    if (!talla) {
      talla = await prisma.talla.create({ data: { nombre_talla: t } });
    }
    tallas.push(talla);
  }

  console.log('Creando categorías...')
  let catHombre = await prisma.categoria.findFirst({ where: { nombre_categoria: 'Hombre' } });
  if (!catHombre) catHombre = await prisma.categoria.create({ data: { nombre_categoria: 'Hombre' } });

  let catMujer = await prisma.categoria.findFirst({ where: { nombre_categoria: 'Mujer' } });
  if (!catMujer) catMujer = await prisma.categoria.create({ data: { nombre_categoria: 'Mujer' } });

  let catNino = await prisma.categoria.findFirst({ where: { nombre_categoria: 'Niño' } });
  if (!catNino) catNino = await prisma.categoria.create({ data: { nombre_categoria: 'Niño' } });

  console.log('Borrando productos antiguos para evitar duplicados...')
  await prisma.producto.deleteMany({})
  await prisma.modelo.deleteMany({})

  console.log('Buscando colores...')
  const coloresDb = await prisma.color.findMany();
  if (coloresDb.length === 0) {
    console.error("⚠️  Advertencia: No hay colores. Ejecuta primero 'node prisma/seed-locations.js'");
    process.exit(1);
  }

  console.log('Buscando archivos de zapatillas...')
  const publicDir = path.join(process.cwd(), 'public', 'zapatillas')
  const folders = [
    { dir: 'hombre', cat: catHombre.id_categoria, nov: false },
    { dir: 'mujer', cat: catMujer.id_categoria, nov: false },
    { dir: 'nino', cat: catNino.id_categoria, nov: false },
    { dir: 'novedades', cat: null, nov: true }
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

      // 1. Crear el MODELO
      const modelo = await prisma.modelo.create({
        data: {
          id_categoria: finalCat,
          nombre_modelo: cleanName,
          descripcion: "Zapatillas Saguaro Barefoot originales. Diseño anatómico que respeta la forma natural del pie, ofreciendo flexibilidad y comodidad inigualable para tu día a día.",
          marca: "Saguaro",
          imagen_url: imgPath,
        }
      })

      // 2. Crear las VARIANTES (Productos/SKUs)
      // Seleccionamos un par de colores aleatorios y tallas para este modelo
      const coloresSelect = [coloresDb[Math.floor(Math.random()*coloresDb.length)], coloresDb[Math.floor(Math.random()*coloresDb.length)]];
      const tallasSelect = [tallas[2], tallas[3], tallas[4]]; // 38, 39, 40 (por ejemplo)

      let variantCount = 1;
      for (const color of coloresSelect) {
        for (const talla of tallasSelect) {
          const sku = `SAG-${modelo.id_modelo}-${color.id_color}-${talla.id_talla}-${variantCount}`;
          
          await prisma.producto.create({
            data: {
              id_modelo: modelo.id_modelo,
              id_color: color.id_color,
              id_talla: talla.id_talla,
              codigo_sku: sku,
              precio: precio,
              stock: Math.floor(Math.random() * 50) + 5,
            }
          });
          variantCount++;
        }
      }

      // Si era novedad, agregarlo a producto_novedad
      if (f.nov) {
        // Just pick the first variant to feature
        const variant = await prisma.producto.findFirst({ where: { id_modelo: modelo.id_modelo }});
        if(variant) {
          await prisma.producto_novedad.create({
            data: {
              id_producto: variant.id_producto,
              fecha_inicio: new Date(),
              fecha_fin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 días
            }
          })
        }
      }

      console.log(`Creado Modelo: ${cleanName} con sus variantes.`)
    }
  }

  console.log('¡Productos sembrados con éxito en el nuevo esquema!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
