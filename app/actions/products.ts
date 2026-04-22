'use server'

import { prisma } from '@/lib/prisma'
import type { Product, ProductCategory, ProductType, ProductSize } from '@/lib/store-types'

function parseTallas(tallaStr: string | null, stock: number): ProductSize[] {
  if (!tallaStr) return []
  if (tallaStr.includes('-')) {
    const [min, max] = tallaStr.split('-').map(Number)
    const tallas = []
    for(let i = min; i <= max; i++) {
      tallas.push({ talla: i, stock })
    }
    return tallas
  }
  return tallaStr.split(',').map(t => ({ talla: parseInt(t.trim()) || 0, stock }))
}

function mapProduct(p: any): Product {
  const isNino = p.categorias?.nombre === 'Niño'
  const isHombre = p.categorias?.nombre === 'Hombre'
  
  let cat: ProductCategory = 'mujer'
  if (isNino) cat = 'nino'
  if (isHombre) cat = 'hombre'

  return {
    id: String(p.id_producto),
    nombre: p.nombre,
    descripcion: p.descripcion || '',
    precio: p.precio_oferta || p.precio_normal,
    precioOriginal: p.precio_oferta ? p.precio_normal : undefined,
    categoria: cat,
    tipo: (p.tipo as ProductType) || 'casual',
    genero: p.genero || (isHombre ? 'hombre' : isNino ? 'nino' : 'mujer'),
    uso: p.uso || 'walking',
    estilo: p.estilo || 'casual',
    imagenes: [p.imagen_url || '/placeholder.jpg'],
    tallas: parseTallas(p.talla, p.stock),
    colores: p.color ? p.color.split(',').map((c: string) => c.trim()) : [],
    caracteristicas: p.caracteristicas && p.caracteristicas.length > 0 ? p.caracteristicas : ['Suela Flexible 5mm', 'Zero Drop', 'Puntera ancha (Wide Toe Box)'],
    destacado: p.is_recomendado || false,
    nuevo: p.is_novedad || false,
    descuento: p.precio_oferta ? Math.round((1 - p.precio_oferta / p.precio_normal) * 100) : undefined,
  }
}

export async function getAllProducts() {
  const products = await prisma.productos.findMany({ include: { categorias: true } })
  return products.map(mapProduct)
}

export async function getFeaturedProducts() {
  const products = await prisma.productos.findMany({
    where: { is_recomendado: true },
    include: { categorias: true },
    take: 8
  })
  if (products.length === 0) {
    const all = await prisma.productos.findMany({ take: 8, include: { categorias: true } })
    return all.map(mapProduct)
  }
  return products.map(mapProduct)
}

export async function getNewProducts() {
  const products = await prisma.productos.findMany({
    where: { is_novedad: true },
    include: { categorias: true },
    take: 4
  })
  return products.map(mapProduct)
}

export async function getDiscountedProducts() {
  const products = await prisma.productos.findMany({
    where: { precio_oferta: { not: null } },
    include: { categorias: true },
    take: 4
  })
  return products.map(mapProduct)
}

export async function getProductsByCategoryStr(categoria: string) {
  const cleanCat = (categoria || '').trim().toLowerCase()
  let catName = ''
  if (cleanCat === 'hombre') catName = 'Hombre'
  if (cleanCat === 'mujer') catName = 'Mujer'
  if (cleanCat === 'nino' || cleanCat === 'niño' || cleanCat === 'ninos') catName = 'Niño'

  console.log(`[getProductsByCategoryStr] Input: "${categoria}", Cleaned: "${cleanCat}", Target DB: "${catName}"`)

  if (!catName && cleanCat !== 'todos') {
    console.log(`[getProductsByCategoryStr] No matching category found for "${categoria}"`)
    return []
  }

  try {
    const where = catName ? { categorias: { nombre: catName } } : {}
    const products = await prisma.productos.findMany({
      where,
      include: { categorias: true }
    })
    console.log(`[getProductsByCategoryStr] Found ${products.length} products for ${catName || 'Todos'}`)
    return products.map(mapProduct)
  } catch (error) {
    console.error("[getProductsByCategoryStr] Database error:", error)
    throw error
  }
}

export async function getProductById(id: string) {
  const product = await prisma.productos.findUnique({
    where: { id_producto: parseInt(id) },
    include: { categorias: true }
  })
  if (!product) return null
  return mapProduct(product)
}

export async function searchProducts(query: string) {
  if (!query || query.trim().length === 0) return []
  const searchTerm = `%${query.trim()}%`
  
  // Note: we can't easily ILIKE on String[] arrays directly in Prisma without raw queries 
  // or using Has/HasSome if it's an array type.
  // Since caracteristicas is String[], we use array filters.
  // But searching inside string[] elements partially requires raw query or we just search exact.
  // Wait, Prisma has `hasSome` but it's for exact matches.
  // Alternatively, we just use a raw query or we fetch and filter in JS if it's a small store.
  // For a small store, JS filtering is fine, but let's try a raw query or just filter by nombre/descripcion.
  // Actually, we can fetch all and filter in JS to make it robust against typo/case in array.
  
  const products = await prisma.productos.findMany({
    include: { categorias: true }
  })
  
  const lowerQuery = query.toLowerCase()
  const filtered = products.filter(p => {
    if (p.nombre.toLowerCase().includes(lowerQuery)) return true
    if (p.descripcion?.toLowerCase().includes(lowerQuery)) return true
    if (p.caracteristicas && p.caracteristicas.some(c => c.toLowerCase().includes(lowerQuery))) return true
    if (p.categorias?.nombre.toLowerCase().includes(lowerQuery)) return true
    return false
  })
  
  return filtered.map(mapProduct)
}
