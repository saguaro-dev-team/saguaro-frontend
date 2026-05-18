import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

// Hex color mapping for common names
const hexMap: Record<string, string> = {
  "negro": "#000000",
  "blanco": "#FFFFFF",
  "rojo": "#FF0000",
  "azul": "#0000FF",
  "verde": "#008000",
  "amarillo": "#FFFF00",
  "naranjo": "#FFA500",
  "gris": "#808080",
  "rosa": "#FFC0CB",
  "marron": "#8B4513",
  "celeste": "#87CEEB",
  "cian": "#00FFFF",
  "morado": "#800080",
  "beige": "#F5F5DC",
  "oro": "#FFD700",
  "plata": "#C0C0C0",
  "caqui": "#F0E68C",
  "turquesa": "#40E0D0",
  "gold": "#FFD700",
  "silver": "#C0C0C0"
}

function getHex(name: string) {
  return hexMap[name.toLowerCase()] || "#cccccc";
}

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

  const tallasNinosStr = ['25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35'];
  const tallasNinos = [];
  for (const t of tallasNinosStr) {
    let talla = await prisma.talla.findFirst({ where: { nombre_talla: t } });
    if (!talla) {
      talla = await prisma.talla.create({ data: { nombre_talla: t } });
    }
    tallasNinos.push(talla);
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

  console.log('Sembrando base de datos desde la jerarquía de carpetas...')
  const publicZapatillasDir = path.join(process.cwd(), 'public', 'zapatillas')
  
  if (!fs.existsSync(publicZapatillasDir)) {
      console.log('Directorio public/zapatillas no existe.');
      return;
  }

  const genders = fs.readdirSync(publicZapatillasDir).filter(f => !f.startsWith('.'));
  
  for (const gender of genders) {
    const genderDir = path.join(publicZapatillasDir, gender);
    if (!fs.statSync(genderDir).isDirectory()) continue;

    let catId = catHombre.id_categoria;
    if (gender.toLowerCase() === 'mujer') catId = catMujer.id_categoria;
    if (gender.toLowerCase() === 'niños' || gender.toLowerCase() === 'nino') catId = catNino.id_categoria;

    const currentTallas = catId === catNino.id_categoria ? tallasNinos : tallas;

    const types = fs.readdirSync(genderDir).filter(f => !f.startsWith('.'));
    for (const type of types) {
      const typeDir = path.join(genderDir, type);
      if (!fs.statSync(typeDir).isDirectory()) continue;

      const cleanType = type.toLowerCase();

      const models = fs.readdirSync(typeDir).filter(f => !f.startsWith('.'));
      for (const model of models) {
        const modelDir = path.join(typeDir, model);
        if (!fs.statSync(modelDir).isDirectory()) continue;

        const cleanModelName = model.replace(/-/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        
        let firstImageUrl = null;
        const colorDirs = fs.readdirSync(modelDir).filter(f => !f.startsWith('.'));
        
        // Find first image to attach to the model
        for (const color of colorDirs) {
           const imagesDir = path.join(modelDir, color);
           if (!fs.statSync(imagesDir).isDirectory()) continue;
           const images = fs.readdirSync(imagesDir).filter(f => !f.startsWith('.') && (f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png') || f.endsWith('.webp')));
           if (images.length > 0) {
              firstImageUrl = `/zapatillas/${gender}/${type}/${model}/${color}/${images[0]}`;
              break;
           }
        }

        const precio = Math.floor(Math.random() * (6 - 3) + 3) * 10000 + 990;

        // Create Model
        const modeloDb = await prisma.modelo.create({
          data: {
            id_categoria: catId,
            nombre_modelo: cleanModelName,
            descripcion: "Zapatillas Saguaro Barefoot originales. Diseño anatómico que respeta la forma natural del pie, ofreciendo flexibilidad y comodidad inigualable para tu día a día.",
            marca: "Saguaro",
            imagen_url: firstImageUrl || '/placeholder.jpg',
            tipo: cleanType
          }
        });

        // Parse colors and create variants
        for (const color of colorDirs) {
            const cleanColorName = color.charAt(0).toUpperCase() + color.slice(1).toLowerCase();
            
            // Get or create color
            let colorDb = await prisma.color.findFirst({ where: { nombre_color: cleanColorName }});
            if (!colorDb) {
                colorDb = await prisma.color.create({
                    data: {
                        nombre_color: cleanColorName,
                        codigo_hex: getHex(cleanColorName)
                    }
                });
            }

            // Create variants
            let variantCount = 1;
            for (const talla of currentTallas) {
                // Stock is random between 5 and 25
                const stock = Math.floor(Math.random() * 20) + 5;
                const sku = `SAG-${modeloDb.id_modelo}-${colorDb.id_color}-${talla.id_talla}-${variantCount}`;
                
                await prisma.producto.create({
                    data: {
                        id_modelo: modeloDb.id_modelo,
                        id_color: colorDb.id_color,
                        id_talla: talla.id_talla,
                        codigo_sku: sku,
                        precio: precio,
                        stock: stock,
                    }
                });
                variantCount++;
            }
        }
        console.log(`Creado Modelo: ${cleanModelName} (${type}) con sus colores y tallas.`);
      }
    }
  }

  console.log('¡Productos sembrados con éxito respetando tu nueva jerarquía!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
