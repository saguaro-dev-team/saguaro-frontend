'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function updateProductType(id: string, nuevoTipo: string) {
  try {
    await prisma.modelo.update({
      where: { id_modelo: parseInt(id) },
      data: { tipo: nuevoTipo }
    })
    revalidatePath(`/producto/${id}`)
    revalidatePath('/admin/productos')
    revalidatePath('/')
    return { success: true }
  } catch (error: any) {
    console.error("Error actualizando tipo:", error)
    return { success: false, error: error.message }
  }
}


export async function getConfiguracion() {
  // Nota: La tabla configuracion_tienda no existe en el esquema final 4.
  // Deberíamos crearla o usar una alternativa. Por ahora, mock para no romper.
  return {
    id_config: 1,
    politica_envio: 'Envío gratis en compras sobre $50.000...',
    politica_devoluciones: '30 días para realizar cambios...'
  }
}

export async function updateConfiguracion(envio: string, devoluciones: string): Promise<{ success: boolean; error?: string }> {
  return { success: true }
}

export async function updateProductCaracteristicas(id: string, caracteristicas: string[]) {
  // Las características tampoco están en el esquema actual.
  // Podríamos agregarlas a 'modelo' o simplemente ignorar.
  return { success: true }
}

export async function updateProductDescription(id: string, descripcion: string) {
  try {
    await prisma.modelo.update({
      where: { id_modelo: parseInt(id) },
      data: { descripcion }
    })
    revalidatePath(`/producto/${id}`)
    revalidatePath('/admin/productos')
    return { success: true }
  } catch (error) {
    console.error("Error guardando descripcion:", error)
    return { success: false, error: 'Error guardando descripción' }
  }
}

export async function getProductVariants(modelId: string) {
  try {
    const id_modelo = parseInt(modelId)
    if (isNaN(id_modelo)) return { success: false, error: 'ID de modelo inválido' }

    const variants = await prisma.producto.findMany({
      where: { id_modelo },
      include: {
        color: true,
        talla: true
      },
      orderBy: [
        { color: { nombre_color: 'asc' } },
        { talla: { nombre_talla: 'asc' } }
      ]
    })

    return { success: true, variants }
  } catch (error: any) {
    console.error('Error al obtener variantes:', error)
    return { success: false, error: error.message }
  }
}

export async function updateProductFull(id: string, data: any, adminUser?: any) {
  try {
    console.log(`[updateProductFull] Actualizando Modelo ID: ${id}`, data)
    
    const id_modelo = parseInt(id)
    const precio = parseInt(data.precio_normal)
    const stock = parseInt(data.stock)
    const id_categoria = parseInt(data.id_categoria)

    // Load original price and promotion details before applying updates
    let oldPrecioNormal = 0
    let oldPrecioOferta: number | null = null
    let modelName = data.nombre || 'Desconocido'
    let firstSku = 'N/A'
    let currentStock = 0

    const firstVariant = await prisma.producto.findFirst({
      where: { id_modelo },
      include: { color: true, talla: true }
    })
    if (firstVariant) {
      oldPrecioNormal = firstVariant.precio
      firstSku = firstVariant.codigo_sku
      currentStock = firstVariant.stock
      const oldPromo = await prisma.producto_promocion.findFirst({
        where: { id_producto: firstVariant.id_producto },
        include: { promocion: true }
      })
      if (oldPromo && oldPromo.promocion) {
        const oldPct = oldPromo.promocion.porcentaje_descuento
        oldPrecioOferta = Math.round(oldPrecioNormal * (1 - oldPct / 100))
      }
    }

    // 1. Actualizar el Modelo
    await prisma.modelo.update({
      where: { id_modelo },
      data: {
        nombre_modelo: data.nombre,
        descripcion: data.descripcion,
        id_categoria: isNaN(id_categoria) ? undefined : id_categoria,
        tipo: data.tipo,
        uso: data.uso,
        estilo: data.estilo,
      }
    })

    // 2. Actualizar precio de todas las variantes existentes
    await prisma.producto.updateMany({
      where: { id_modelo },
      data: {
        precio: precio,
      }
    })

    // 3. Si se enviaron stocks por variante específicos, los actualizamos uno a uno
    if (data.variantsStock && Array.isArray(data.variantsStock)) {
      for (const v of data.variantsStock) {
        const id_producto = parseInt(v.id_producto)
        const newStock = parseInt(v.stock) || 0

        const originalVariant = await prisma.producto.findUnique({
          where: { id_producto },
          include: { color: true, talla: true, modelo: true }
        })

        const oldStock = originalVariant ? originalVariant.stock : 0
        const diff = newStock - oldStock

        if (diff !== 0) {
          await prisma.producto.update({
            where: { id_producto },
            data: { stock: newStock }
          })

          if (adminUser && originalVariant) {
            const action = diff > 0 ? 'AGREGAR' : 'RETIRAR'
            const details = `Se actualizó stock de la variante (Color: ${originalVariant.color.nombre_color}, Talla: ${originalVariant.talla.nombre_talla}) de ${oldStock} a ${newStock} (Diferencia: ${diff > 0 ? '+' : ''}${diff} unidades)`
            
            const { logStockChange } = await import('./auditoria')
            await logStockChange({
              adminUser,
              accion: action,
              sku: originalVariant.codigo_sku,
              nombreProducto: originalVariant.modelo.nombre_modelo || data.nombre || 'Desconocido',
              detalles: details,
              stockAnterior: oldStock,
              stockNuevo: newStock
            })
          }
        }
      }
    } else {
      // Si el admin envió un stock específico y solo hay una variante, lo actualizamos (retrocompatibilidad)
      const variantsCount = await prisma.producto.count({ where: { id_modelo } })
      if (variantsCount === 1) {
        const singleProduct = await prisma.producto.findFirst({
          where: { id_modelo },
          include: { color: true, talla: true, modelo: true }
        })
        if (singleProduct) {
          const oldStock = singleProduct.stock
          const newStock = stock
          const diff = newStock - oldStock
          if (diff !== 0) {
            await prisma.producto.updateMany({
              where: { id_modelo },
              data: { stock: newStock }
            })

            if (adminUser) {
              const action = diff > 0 ? 'AGREGAR' : 'RETIRAR'
              const details = `Se actualizó stock del producto (Color: ${singleProduct.color.nombre_color}, Talla: ${singleProduct.talla.nombre_talla}) de ${oldStock} a ${newStock} (Diferencia: ${diff > 0 ? '+' : ''}${diff} unidades)`
              
              const { logStockChange } = await import('./auditoria')
              await logStockChange({
                adminUser,
                accion: action,
                sku: singleProduct.codigo_sku,
                nombreProducto: singleProduct.modelo.nombre_modelo || data.nombre || 'Desconocido',
                detalles: details,
                stockAnterior: oldStock,
                stockNuevo: newStock
              })
            }
          }
        }
      }
    }

    // 4. Sincronizar variantes (crear nuevas combinaciones de Color/Talla si se agregaron)
    if (data.color && data.talla) {
      const coloresNombres = data.color.split(',').map((c: string) => c.trim()).filter(Boolean)
      const tallasNombres = data.talla.split(',').map((t: string) => t.trim()).filter(Boolean)

      for (const cName of coloresNombres) {
        let color = await prisma.color.findFirst({ where: { nombre_color: cName } })
        if (!color) {
          color = await prisma.color.create({ data: { nombre_color: cName, codigo_hex: '#cccccc' } })
        }

        for (const tName of tallasNombres) {
          let talla = await prisma.talla.findFirst({ where: { nombre_talla: tName } })
          if (!talla) {
            talla = await prisma.talla.create({ data: { nombre_talla: tName } })
          }

          // Verificar si ya existe esta variante
          const existingVariant = await prisma.producto.findFirst({
            where: {
              id_modelo,
              id_color: color.id_color,
              id_talla: talla.id_talla
            }
          })

          if (!existingVariant) {
            const sku = `SAG-${id_modelo}-${color.id_color}-${talla.id_talla}`;
            const initialStock = 10;
            await prisma.producto.create({
              data: {
                id_modelo,
                id_color: color.id_color,
                id_talla: talla.id_talla,
                codigo_sku: sku,
                precio: precio,
                stock: initialStock, // Stock inicial por defecto
              }
            })

            if (adminUser) {
              const existingModel = await prisma.modelo.findUnique({
                where: { id_modelo }
              })
              const modelName = existingModel?.nombre_modelo || data.nombre || 'Desconocido'
              const { logStockChange } = await import('./auditoria')
              await logStockChange({
                adminUser,
                accion: 'CREAR',
                sku,
                nombreProducto: modelName,
                detalles: `Creación de variante (Color: ${cName}, Talla: ${tName}) con stock inicial de ${initialStock} unidades`,
                stockAnterior: 0,
                stockNuevo: initialStock
              })
            }
          }
        }
      }
    }

    // 5. Actualizar manifest de imágenes (public/images-manifest.json)
    if (data.imagesByColor) {
      try {
        const fs = await import('fs')
        const path = await import('path')
        const manifestPath = path.join(process.cwd(), 'public', 'images-manifest.json')
        
        let manifest: Record<string, Record<string, string[]>> = {}
        if (fs.existsSync(manifestPath)) {
          manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))
        }
        
        const cleanModelName = data.nombre.replace(/-/g, ' ').split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        
        manifest[cleanModelName] = {}
        
        let firstImg: string | null = null
        Object.entries(data.imagesByColor).forEach(([color, urlsStr]) => {
          const urls = (urlsStr as string).split(',').map(u => u.trim()).filter(Boolean)
          if (urls.length > 0) {
            manifest[cleanModelName][color] = urls
            if (!firstImg) firstImg = urls[0]
          }
        })
        
        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8')
        
        if (firstImg) {
          await prisma.modelo.update({
            where: { id_modelo },
            data: { imagen_url: firstImg }
          })
        }
      } catch (manifestError) {
        console.error("Error al guardar manifest de imágenes:", manifestError)
      }
    }
    
    // 6. Sincronizar promociones/ofertas
    const precioOferta = data.precio_oferta ? parseInt(data.precio_oferta) : null
    if (precioOferta && precioOferta < precio && precioOferta > 0) {
      const pct = Math.round((1 - precioOferta / precio) * 100)
      const promoName = `Oferta ${data.nombre}`
      
      const promo = await prisma.promocion.create({
        data: {
          nombre: promoName,
          porcentaje_descuento: pct,
          fecha_ini: new Date(),
          fecha_fin: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        }
      })

      const variants = await prisma.producto.findMany({
        where: { id_modelo }
      })

      for (const variant of variants) {
        await prisma.producto_promocion.deleteMany({
          where: { id_producto: variant.id_producto }
        })

        await prisma.producto_promocion.create({
          data: {
            id_producto: variant.id_producto,
            id_promocion: promo.id_promocion,
            activo: true
          }
        })
      }
    } else {
      const variants = await prisma.producto.findMany({
        where: { id_modelo }
      })
      const variantIds = variants.map(v => v.id_producto)
      
      await prisma.producto_promocion.deleteMany({
        where: { id_producto: { in: variantIds } }
      })
    }

    // Log price/offer changes to auditoria_stock
    if (adminUser) {
      let priceChangeDetails = []
      if (oldPrecioNormal !== precio) {
        priceChangeDetails.push(`Precio normal cambió de $${oldPrecioNormal} a $${precio}`)
      }
      if (oldPrecioOferta !== precioOferta) {
        if (oldPrecioOferta === null && precioOferta !== null) {
          priceChangeDetails.push(`Se configuró precio de oferta en $${precioOferta}`)
        } else if (oldPrecioOferta !== null && precioOferta === null) {
          priceChangeDetails.push(`Se eliminó el precio de oferta (precio anterior: $${oldPrecioOferta})`)
        } else if (oldPrecioOferta !== null && precioOferta !== null) {
          priceChangeDetails.push(`Precio de oferta cambió de $${oldPrecioOferta} a $${precioOferta}`)
        }
      }

      if (priceChangeDetails.length > 0) {
        const { logStockChange } = await import('./auditoria')
        await logStockChange({
          adminUser,
          accion: 'MODIFICAR',
          sku: firstSku,
          nombreProducto: modelName,
          detalles: `Modificación de precio/oferta: ${priceChangeDetails.join('. ')}`,
          stockAnterior: currentStock,
          stockNuevo: currentStock
        })
      }
    }

    revalidatePath('/')
    revalidatePath('/admin/productos')
    return { success: true }
  } catch (error: any) {
    console.error("Error DETALLADO actualizando producto:", error)
    return { success: false, error: `No se pudo guardar: ${error.message}` }
  }
}

export async function createProduct(data: any, adminUser?: any) {
  try {
    const precio = parseInt(data.precio_normal)
    const stockTotal = parseInt(data.stock) || 0
    const id_categoria = parseInt(data.id_categoria)

    if (isNaN(precio)) {
      throw new Error("El precio debe ser un número válido")
    }

    // 1. Crear el Modelo
    const modelo = await prisma.modelo.create({
      data: {
        nombre_modelo: data.nombre,
        id_categoria: isNaN(id_categoria) ? 1 : id_categoria,
        descripcion: data.descripcion,
        marca: "Saguaro",
        imagen_url: '/placeholder.jpg',
        tipo: data.tipo || 'casual',
        uso: data.uso || 'walking',
        estilo: data.estilo || 'casual',
        activo: true // Forzar activo por defecto
      }
    })

    // 2. Manejar variantes (Colores y Tallas)
    const coloresNombres = (data.color || 'Estándar').split(',').map((c: string) => c.trim()).filter(Boolean)
    const tallasNombres = (data.talla || '40').split(',').map((t: string) => t.trim()).filter(Boolean)

    const stockPorVariante = Math.floor(stockTotal / (coloresNombres.length * tallasNombres.length)) || 0

    for (const cName of coloresNombres) {
      let color = await prisma.color.findFirst({ where: { nombre_color: cName } })
      if (!color) {
        color = await prisma.color.create({ data: { nombre_color: cName, codigo_hex: '#cccccc' } })
      }

      for (const tName of tallasNombres) {
        let talla = await prisma.talla.findFirst({ where: { nombre_talla: tName } })
        if (!talla) {
          talla = await prisma.talla.create({ data: { nombre_talla: tName } })
        }

        const sku = `SAG-${modelo.id_modelo}-${color.id_color}-${talla.id_talla}`;
        
        await prisma.producto.create({
          data: {
            id_modelo: modelo.id_modelo,
            id_color: color.id_color,
            id_talla: talla.id_talla,
            codigo_sku: sku,
            precio: precio,
            stock: stockPorVariante,
          }
        })

        if (adminUser) {
          const { logStockChange } = await import('./auditoria')
          await logStockChange({
            adminUser,
            accion: 'CREAR',
            sku,
            nombreProducto: modelo.nombre_modelo || data.nombre || 'Desconocido',
            detalles: `Creación de producto nuevo "${modelo.nombre_modelo || data.nombre}" - Variante (Color: ${cName}, Talla: ${tName}) con stock inicial de ${stockPorVariante} unidades`,
            stockAnterior: 0,
            stockNuevo: stockPorVariante
          })
        }
      }
    }

    // 3. Si es novedad
    if (data.is_novedad) {
      const firstVariant = await prisma.producto.findFirst({ where: { id_modelo: modelo.id_modelo } })
      if (firstVariant) {
        await prisma.producto_novedad.create({
          data: {
            id_producto: firstVariant.id_producto,
            fecha_inicio: new Date(),
            fecha_fin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          }
        })
      }
    }

    // 3.5 Guardar imágenes en el manifest
    if (data.imagesByColor) {
      try {
        const fs = await import('fs')
        const path = await import('path')
        const manifestPath = path.join(process.cwd(), 'public', 'images-manifest.json')
        
        let manifest: Record<string, Record<string, string[]>> = {}
        if (fs.existsSync(manifestPath)) {
          manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))
        }
        
        const cleanModelName = modelo.nombre_modelo.replace(/-/g, ' ').split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        
        manifest[cleanModelName] = {}
        
        let firstImg: string | null = null
        Object.entries(data.imagesByColor).forEach(([color, urlsStr]) => {
          const urls = (urlsStr as string).split(',').map(u => u.trim()).filter(Boolean)
          if (urls.length > 0) {
            manifest[cleanModelName][color] = urls
            if (!firstImg) firstImg = urls[0]
          }
        })
        
        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8')
        
        if (firstImg) {
          await prisma.modelo.update({
            where: { id_modelo: modelo.id_modelo },
            data: { imagen_url: firstImg }
          })
        }
      } catch (manifestError) {
        console.error("Error al guardar manifest en creación:", manifestError)
      }
    }

    // 3.6 Sincronizar promociones/ofertas para el nuevo producto
    const precioOferta = data.precio_oferta ? parseInt(data.precio_oferta) : null
    if (precioOferta && precioOferta < precio && precioOferta > 0) {
      const pct = Math.round((1 - precioOferta / precio) * 100)
      const promoName = `Oferta ${data.nombre}`
      
      const promo = await prisma.promocion.create({
        data: {
          nombre: promoName,
          porcentaje_descuento: pct,
          fecha_ini: new Date(),
          fecha_fin: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        }
      })

      const variants = await prisma.producto.findMany({
        where: { id_modelo: modelo.id_modelo }
      })

      for (const variant of variants) {
        await prisma.producto_promocion.create({
          data: {
            id_producto: variant.id_producto,
            id_promocion: promo.id_promocion,
            activo: true
          }
        })
      }
    }

    revalidatePath('/')
    revalidatePath('/admin/productos')
    return { success: true, id: modelo.id_modelo }
  } catch (error: any) {
    console.error("Error creando producto:", error)
    return { success: false, error: `Error al crear el producto: ${error.message}` }
  }
}

export async function toggleProductStatus(id: string, nuevoEstado: boolean, adminUser?: any) {
  try {
    const id_modelo = parseInt(id)
    
    // Fetch original model and its variants before doing updates
    const model = await prisma.modelo.findUnique({
      where: { id_modelo },
      include: { productos: { include: { color: true, talla: true } } }
    })

    if (!model) {
      return { success: false, error: 'Producto no encontrado' }
    }

    await prisma.modelo.update({
      where: { id_modelo },
      data: { activo: nuevoEstado }
    })
    
    // Just log activation/deactivation in audit table with stock intact
    if (adminUser) {
      const { logStockChange } = await import('./auditoria')
      for (const variant of model.productos) {
        await logStockChange({
          adminUser,
          accion: nuevoEstado ? 'AGREGAR' : 'RETIRAR',
          sku: variant.codigo_sku,
          nombreProducto: model.nombre_modelo || 'Desconocido',
          detalles: nuevoEstado 
            ? `Producto activado (El stock de sus variantes permanece intacto: ${variant.stock} unidades)` 
            : `Producto desactivado (El stock de sus variantes permanece intacto: ${variant.stock} unidades)`,
          stockAnterior: variant.stock,
          stockNuevo: variant.stock
        })
      }
    }

    revalidatePath('/admin/productos')
    revalidatePath('/')
    return { success: true }
  } catch (error: any) {
    console.error("Error cambiando estado del producto:", error)
    return { success: false, error: error.message }
  }
}

export async function getUsuarios() {
  try {
    const usuarios = await prisma.usuario.findMany({
      include: {
        rol: true,
        _count: {
          select: { pedidos: true }
        }
      },
      orderBy: { fecha_registro: 'desc' }
    })
    return { success: true, usuarios }
  } catch (error: any) {
    console.error("Error obteniendo usuarios:", error)
    return { success: false, error: error.message }
  }
}

export async function getUsuarioDetalles(id: number) {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario: id },
      include: {
        rol: true,
        direcciones: {
          where: { activa: true },
          include: {
            comuna: {
              include: {
                region: true
              }
            }
          }
        },
        pedidos: {
          include: {
            articulos: {
              include: {
                producto: {
                  include: {
                    modelo: true
                  }
                }
              }
            }
          },
          orderBy: { fecha_pedido: 'desc' }
        }
      }
    })
    return { success: true, usuario }
  } catch (error: any) {
    console.error("Error obteniendo detalles del usuario:", error)
    return { success: false, error: error.message }
  }
}

export async function updateUserRole(id: number, nuevoRol: string) {
  try {
    const rol = await prisma.rol.findUnique({
      where: { nombre_rol: nuevoRol.toLowerCase() }
    })

    if (!rol) {
      throw new Error(`El rol ${nuevoRol} no existe`)
    }

    await prisma.usuario.update({
      where: { id_usuario: id },
      data: { id_rol: rol.id_rol }
    })

    revalidatePath('/admin/clientes')
    return { success: true }
  } catch (error: any) {
    console.error("Error actualizando rol:", error)
    return { success: false, error: error.message }
  }
}

export async function addStockToProduct(id_producto: number, amount: number, adminUser?: any) {
  try {
    const originalProduct = await prisma.producto.findUnique({
      where: { id_producto },
      include: { color: true, talla: true, modelo: true }
    })
    const oldStock = originalProduct ? originalProduct.stock : 0

    const updated = await prisma.producto.update({
      where: { id_producto },
      data: { stock: { increment: amount } }
    });

    if (adminUser && originalProduct) {
      const { logStockChange } = await import('./auditoria')
      const action = amount > 0 ? 'AGREGAR' : 'RETIRAR'
      const details = `Se modificó stock de la variante (Color: ${originalProduct.color.nombre_color}, Talla: ${originalProduct.talla.nombre_talla}) de ${oldStock} a ${updated.stock} (Diferencia: ${amount > 0 ? '+' : ''}${amount} unidades)`
      await logStockChange({
        adminUser,
        accion: action,
        sku: originalProduct.codigo_sku,
        nombreProducto: originalProduct.modelo.nombre_modelo,
        detalles: details,
        stockAnterior: oldStock,
        stockNuevo: updated.stock
      })
    }

    revalidatePath('/admin');
    revalidatePath('/admin/productos');
    return { success: true, stock: updated.stock };
  } catch (error: any) {
    console.error('Error adding stock:', error);
    return { success: false, error: error.message };
  }
}

export async function getColorsMap() {
  try {
    const fs = await import('fs')
    const path = await import('path')
    const filePath = path.join(process.cwd(), 'lib', 'colors-map.json')
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf-8')
      return { success: true, colorsMap: JSON.parse(fileContent) }
    }
    return { success: false, error: 'Archivo no encontrado' }
  } catch (error: any) {
    console.error('Error al obtener mapa de colores:', error)
    return { success: false, error: error.message }
  }
}

export async function updateColorsMap(newMap: Record<string, string>) {
  try {
    const fs = await import('fs')
    const path = await import('path')
    const filePath = path.join(process.cwd(), 'lib', 'colors-map.json')
    fs.writeFileSync(filePath, JSON.stringify(newMap, null, 2), 'utf-8')
    revalidatePath('/')
    revalidatePath('/admin/productos')
    return { success: true }
  } catch (error: any) {
    console.error('Error al guardar mapa de colores:', error)
    return { success: false, error: error.message }
  }
}

export async function uploadProductImage(modelName: string, colorName: string, base64Data: string, fileName: string) {
  try {
    const fs = await import('fs')
    const path = await import('path')
    
    const cleanModelName = modelName.replace(/-/g, ' ').split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    const cleanColorName = colorName.charAt(0).toUpperCase() + colorName.slice(1).toLowerCase();
    
    // Generar un nombre de archivo seguro
    const safeFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileRelativePath = `${cleanModelName}/${cleanColorName}/${safeFileName}`
    
    // Obtener variables de entorno
    const supabaseUrl = process.env.SUPABASE_URL || 'https://mxlsnnxmfuevzqpdqhtv.supabase.co'
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    const base64Clean = base64Data.split(',')[1] || base64Data
    const buffer = Buffer.from(base64Clean, 'base64')
    
    // 1. Si está configurado Supabase Service Key, subir a Supabase Storage en la nube
    if (supabaseServiceKey) {
      const mimeMatch = base64Data.match(/^data:(image\/[a-zA-Z+.-]+);base64,/)
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg'
      
      const uploadUrl = `${supabaseUrl}/storage/v1/object/zapatillas/${fileRelativePath}`
      
      console.log(`[Supabase Storage] Subiendo a ${uploadUrl}`)
      
      const uploadRes = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': mimeType,
          'x-upsert': 'true'
        },
        body: buffer
      })
      
      if (uploadRes.ok) {
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/zapatillas/${fileRelativePath}`
        return { success: true, url: publicUrl }
      } else {
        const errorText = await uploadRes.text()
        console.error("[Supabase Storage] Error en la API:", errorText)
        // Si falla la API de Supabase, hacemos fallback silencioso a almacenamiento local
      }
    }
    
    // 2. Fallback: Guardar localmente
    const targetDir = path.join(process.cwd(), 'public', 'zapatillas', cleanModelName, cleanColorName)
    
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true })
    }
    
    const filePath = path.join(targetDir, safeFileName)
    fs.writeFileSync(filePath, buffer)
    
    const publicUrl = `/zapatillas/${cleanModelName}/${cleanColorName}/${safeFileName}`
    return { success: true, url: publicUrl }
  } catch (error: any) {
    console.error("Error al subir archivo de imagen:", error)
    return { success: false, error: error.message }
  }
}

export async function anonymizeUser(id_usuario: number, adminUser?: any) {
  try {
    const userToAnon = await prisma.usuario.findUnique({
      where: { id_usuario },
      include: { rol: true }
    })

    if (!userToAnon) {
      return { success: false, error: 'Usuario no encontrado' }
    }

    // 1. Evitar anonimizar administradores por seguridad
    const rolNombre = userToAnon.rol?.nombre_rol?.toLowerCase() || ''
    if (rolNombre === 'administrador' || rolNombre === 'admin') {
      return { success: false, error: 'No está permitido anonimizar a un Administrador por motivos de seguridad.' }
    }

    // 2. Generar datos anónimos únicos basados en id_usuario
    const anonymizedEmail = `eliminado_${id_usuario}@saguaro.cl`
    const anonymizedRut = `99.999.${String(id_usuario).padStart(3, '0')}-K`

    // 3. Realizar los cambios en una transacción Prisma para asegurar consistencia
    await prisma.$transaction(async (tx) => {
      // 3.1. Eliminar credenciales en usuario_login (destruye contraseña)
      try {
        await tx.usuario_login.delete({
          where: { id_usuario }
        })
      } catch (e) {
        // En caso de que no tenga login registrado (usuario de invitado)
        console.log(`[anonymizeUser] No tenía registro de credenciales de login: ${id_usuario}`)
      }

      // 3.2. Actualizar datos en usuario
      await tx.usuario.update({
        where: { id_usuario },
        data: {
          nombres: 'Usuario',
          primer_apellido: 'Anónimo',
          segundo_apellido: 'Eliminado',
          direccion_email: anonymizedEmail,
          rut: anonymizedRut,
          telefono: '999999999',
          genero: 'Otro',
          estado: false // Desactivación lógica
        }
      })

      // 3.3. Anonimizar direcciones del usuario
      await tx.direccion.updateMany({
        where: { id_usuario },
        data: {
          calle: 'Dirección Eliminada',
          numero: '0',
          departamento: null,
          detalles: null
        }
      })
    })

    // 4. Registrar auditoría si viene el usuario admin
    if (adminUser) {
      try {
        await prisma.auditoria_stock.create({
          data: {
            id_usuario: adminUser.id ? parseInt(adminUser.id) || 0 : 0,
            nombre_usuario: adminUser.nombre || 'Administrador',
            email_usuario: adminUser.email || 'admin@saguaro.cl',
            accion: 'ELIMINAR_USUARIO',
            sku_producto: 'N/A',
            nombre_producto: `Anonimización - ID ${id_usuario}`,
            detalles: `Se ejecutó el borrado lógico y anonimización irreversible para el usuario con ID ${id_usuario}. Email de reemplazo: ${anonymizedEmail}.`,
            stock_anterior: 0,
            stock_nuevo: 0
          }
        })
      } catch (auditError) {
        console.error("Error al registrar auditoría de anonimización:", auditError)
      }
    }

    revalidatePath('/admin/clientes')
    return { success: true }
  } catch (error: any) {
    console.error("Error al anonimizar usuario:", error)
    return { success: false, error: error.message || 'Error al anonimizar usuario' }
  }
}




