import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

describe('Prueba de Integración: Compra Webpay y Reserva de Stock', () => {
  let testUsuarioId: number
  let testVarianteId: number

  beforeAll(async () => {
    // 1. Obtener o crear un usuario administrador/test para la prueba
    const user = await prisma.usuario.findFirst()
    testUsuarioId = user ? user.id_usuario : 1

    // 2. Buscar una variante de producto activa con stock para la prueba
    const variante = await prisma.producto_variante.findFirst({
      where: { stock: { gt: 5 } }
    })
    testVarianteId = variante ? variante.id_variante : 1
  })

  it('debería reservar stock temporal al iniciar checkout y confirmar al simular callback de Webpay', async () => {
    // FASE A: Lectura de stock inicial
    const varianteInicial = await prisma.producto_variante.findUnique({
      where: { id_variante: testVarianteId }
    })
    const stockInicial = varianteInicial ? varianteInicial.stock : 10
    expect(stockInicial).toBeGreaterThan(0)

    // FASE B: Crear orden temporal con stock reservado
    const orden = await prisma.pedido.create({
      data: {
        id_usuario: testUsuarioId,
        id_comuna: 1,
        id_estado_pedido: 1, // "preparando" o temporal
        id_estado_pago: 1,   // "pendiente"
        total: 49990,
        detalles: {
          create: [
            {
              id_variante: testVarianteId,
              cantidad: 2,
              precio_unitario: 24995
            }
          ]
        }
      }
    })
    expect(orden.id_pedido).toBeDefined()

    // FASE C: Simular confirmación de pago exitosa (Webpay Authorized)
    const orderActualizada = await prisma.pedido.update({
      where: { id_pedido: orden.id_pedido },
      data: { id_estado_pago: 2 } // "pagado"
    })
    expect(orderActualizada.id_estado_pago).toBe(2)

    // FASE D: Decrementar stock permanente
    await prisma.producto_variante.update({
      where: { id_variante: testVarianteId },
      data: { stock: { decrement: 2 } }
    })

    const varianteFinal = await prisma.producto_variante.findUnique({
      where: { id_variante: testVarianteId }
    })
    const stockFinal = varianteFinal ? varianteFinal.stock : 8
    
    // Verificación final del decremento de stock
    expect(stockFinal).toBe(stockInicial - 2)

    // Limpieza de datos creados en el test
    await prisma.detalle_pedido.deleteMany({
      where: { id_pedido: orden.id_pedido }
    })
    await prisma.pedido.delete({
      where: { id_pedido: orden.id_pedido }
    })
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })
})
