'use server'

import { prisma } from '@/lib/prisma'
import type { Product, ProductCategory, ProductType, ProductSize } from '@/lib/store-types'
import fs from 'fs'
import path from 'path'

let manifestCache: Record<string, Record<string, string[]>> | null = null;
function getManifest() {
  if (manifestCache) return manifestCache;
  try {
    const p = path.join(process.cwd(), 'public', 'images-manifest.json');
    if (fs.existsSync(p)) {
      manifestCache = JSON.parse(fs.readFileSync(p, 'utf-8'));
    } else {
      manifestCache = {};
    }
  } catch(e) {
    manifestCache = {};
  }
  return manifestCache;
}

function mapProduct(m: any): Product {
  const isNino = m.categoria?.nombre_categoria === 'Niño'
  const isHombre = m.categoria?.nombre_categoria === 'Hombre'
  
  let cat: ProductCategory = 'mujer'
  if (isNino) cat = 'nino'
  if (isHombre) cat = 'hombre'

  // El modelo tiene productos (variantes). Sacaremos la información de ahí.
  const variantes = m.productos || []
  
  // Extraer tallas únicas con stock sumado
  const tallasMap = new Map<number, number>()
  const coloresSet = new Set<string>()
  let precioOriginal = 0;
  let precioOferta: number | undefined = undefined;
  
  variantes.forEach((v: any) => {
     const tName = parseInt(v.talla?.nombre_talla) || 0
     tallasMap.set(tName, (tallasMap.get(tName) || 0) + v.stock)
     if (v.color?.nombre_color) coloresSet.add(v.color.nombre_color)
     if (precioOriginal === 0) precioOriginal = v.precio
     
     // Si tiene promoción activa
     if (v.promociones && v.promociones.length > 0) {
        const promo = v.promociones[0]
        if (promo.activo) {
           const pDescuento = promo.descuento_especifico || promo.promocion?.porcentaje_descuento || 0
           const calculado = Math.round(v.precio * (1 - pDescuento/100))
           if (!precioOferta || calculado < precioOferta) precioOferta = calculado
        }
     }
  })

  const tallasArray = Array.from(tallasMap.entries()).map(([talla, stock]) => ({ talla, stock }))

  const isNuevo = variantes.some((v:any) => v.novedades && v.novedades.length > 0)

  const manifest = getManifest();
  const cleanModelName = m.nombre_modelo.replace(/-/g, ' ').split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const modelImages = manifest[cleanModelName] || manifest[m.nombre_modelo] || {};
  const imagenesPorColor: Record<string, string[]> = {};
  
  Array.from(coloresSet).forEach(c => {
     const cleanColorName = c.charAt(0).toUpperCase() + c.slice(1).toLowerCase();
     imagenesPorColor[c] = modelImages[cleanColorName] || [];
  });

  const firstColor = Array.from(coloresSet)[0];
  const firstColorClean = firstColor ? firstColor.charAt(0).toUpperCase() + firstColor.slice(1).toLowerCase() : '';
  const fallbackImages = (firstColorClean && modelImages[firstColorClean] && modelImages[firstColorClean].length > 0) 
      ? modelImages[firstColorClean] 
      : (m.imagen_url ? [m.imagen_url] : ['/placeholder.jpg']);

  return {
    id: String(m.id_modelo),
    nombre: m.nombre_modelo,
    descripcion: m.descripcion || '',
    precio: precioOferta || precioOriginal || 0,
    precioOriginal: precioOferta ? precioOriginal : undefined,
    categoria: cat,
    tipo: (m.tipo || 'casual') as ProductType,
    genero: isHombre ? 'hombre' : isNino ? 'nino' : 'mujer',
    uso: m.uso || 'walking',
    estilo: m.estilo || 'casual',
    imagenes: fallbackImages,
    imagenesPorColor,
    tallas: tallasArray,
    colores: Array.from(coloresSet),
    caracteristicas: ['Suela Flexible 5mm', 'Zero Drop', 'Puntera ancha'],
    destacado: isNuevo,
    nuevo: isNuevo,
    descuento: precioOferta && precioOriginal ? Math.round((1 - precioOferta / precioOriginal) * 100) : undefined,
    activo: m.activo ?? true,
  }
}

const includeVariantes = {
  categoria: true,
  productos: {
    include: {
      color: true,
      talla: true,
      promociones: { include: { promocion: true } },
      novedades: true
    }
  }
}

export async function getAllProducts(showInactive = false) {
  const where = showInactive ? {} : { activo: true }
  const modelos = await prisma.modelo.findMany({ 
    where,
    include: includeVariantes 
  })
  return modelos.map(mapProduct)
}

export async function getFeaturedProducts() {
  const modelos = await prisma.modelo.findMany({
    where: { activo: true },
    include: includeVariantes,
    take: 8
  })
  return modelos.map(mapProduct)
}

export async function getNewProducts() {
  const modelos = await prisma.modelo.findMany({
    where: { activo: true },
    include: includeVariantes,
    take: 4
  })
  return modelos.map(mapProduct)
}

export async function getDiscountedProducts() {
  const modelos = await prisma.modelo.findMany({
    where: { 
      activo: true,
      productos: {
        some: {
          promociones: {
            some: {
              activo: true
            }
          }
        }
      }
    },
    include: includeVariantes,
    take: 12
  })
  return modelos.map(mapProduct)
}


export async function getProductsByCategoryStr(categoria: string) {
  const cleanCat = (categoria || '').trim().toLowerCase()
  let catName = ''
  if (cleanCat === 'hombre') catName = 'Hombre'
  if (cleanCat === 'mujer') catName = 'Mujer'
  if (cleanCat === 'nino' || cleanCat === 'niño' || cleanCat === 'ninos') catName = 'Niño'

  if (!catName && cleanCat !== 'todos') return []

  try {
    const where: any = { activo: true }
    if (catName) where.categoria = { nombre_categoria: catName }
    
    const modelos = await prisma.modelo.findMany({
      where,
      include: includeVariantes
    })
    return modelos.map(mapProduct)
  } catch (error) {
    console.error("[getProductsByCategoryStr] Error:", error)
    return []
  }
}

export async function getProductById(id: string) {
  const modelo = await prisma.modelo.findUnique({
    where: { id_modelo: parseInt(id) },
    include: includeVariantes
  })
  if (!modelo) return null
  return mapProduct(modelo)
}

export async function searchProducts(query: string) {
  if (!query || query.trim().length === 0) return []
  const lowerQuery = query.toLowerCase()
  
  const modelos = await prisma.modelo.findMany({ include: includeVariantes })
  
  const filtered = modelos.filter(m => {
    if (m.nombre_modelo.toLowerCase().includes(lowerQuery)) return true
    if (m.descripcion?.toLowerCase().includes(lowerQuery)) return true
    if (m.categoria?.nombre_categoria.toLowerCase().includes(lowerQuery)) return true
    return false
  })
  
  return filtered.map(mapProduct)
}
