'use server'

import { prisma } from '@/lib/prisma'

export async function getRegiones() {
  try {
    const regiones = await prisma.region.findMany({
      include: {
        comunas: true
      },
      orderBy: { id_region: 'asc' }
    })
    return { success: true, regiones }
  } catch (error) {
    console.error('Error al cargar regiones:', error)
    return { success: false, error: 'No se pudieron cargar las regiones' }
  }
}
export async function getColores() {
  try {
    const colores = await prisma.colores.findMany({
      orderBy: { nombre: 'asc' }
    })
    return { success: true, colores }
  } catch (error) {
    console.error('Error al cargar colores:', error)
    return { success: false, error: 'No se pudieron cargar los colores' }
  }
}
