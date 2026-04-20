'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function updateProductType(id: string, nuevoTipo: string) {
  try {
    await prisma.productos.update({
      where: { id_producto: parseInt(id) },
      data: { tipo: nuevoTipo }
    })
    
    // Revalidar las paginas afectadas para que se refresquen los datos
    revalidatePath('/')
    revalidatePath('/categoria/hombre')
    revalidatePath('/categoria/mujer')
    revalidatePath('/categoria/nino')
    revalidatePath('/admin/productos')
    
    return { success: true }
  } catch (error) {
    console.error("Error actualizando tipo:", error)
    return { success: false, error: "Error de base de datos" }
  }
}
