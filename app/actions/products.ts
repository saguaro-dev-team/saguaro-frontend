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
    imagenes: [p.imagen_url || '/placeholder.jpg'],
    tallas: parseTallas(p.talla, p.stock),
    colores: p.color ? p.color.split(',').map((c: string) => c.trim()) : [],
    caracteristicas: ['Suela Flexible 5mm', 'Zero Drop', 'Puntera ancha (Wide Toe Box)'],
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

  if (!catName) {
    console.log(`[getProductsByCategoryStr] No matching category found for "${categoria}"`)
    return []
  }

  try {
    const products = await prisma.productos.findMany({
      where: { categorias: { nombre: catName } },
      include: { categorias: true }
    })
    console.log(`[getProductsByCategoryStr] Found ${products.length} products for ${catName}`)
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
