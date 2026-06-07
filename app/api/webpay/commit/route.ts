import { NextRequest, NextResponse } from 'next/server'
import { WebpayPlus, Options, IntegrationApiKeys, Environment, IntegrationCommerceCodes } from 'transbank-sdk'
import { prisma } from '@/lib/prisma'

const tx = new WebpayPlus.Transaction(
  new Options(
    IntegrationCommerceCodes.WEBPAY_PLUS,
    IntegrationApiKeys.WEBPAY,
    Environment.Integration
  )
)

async function processWebpayReturn(req: NextRequest) {
  try {
    let token_ws = req.nextUrl.searchParams.get('token_ws')
    let tbk_token = req.nextUrl.searchParams.get('TBK_TOKEN')
    let tbk_orden_compra = req.nextUrl.searchParams.get('TBK_ORDEN_COMPRA')

    if (req.method === 'POST') {
      try {
        const formData = await req.formData()
        token_ws = token_ws || (formData.get('token_ws') as string)
        tbk_token = tbk_token || (formData.get('TBK_TOKEN') as string)
        tbk_orden_compra = tbk_orden_compra || (formData.get('TBK_ORDEN_COMPRA') as string)
      } catch (e) {
        console.warn('Could not parse form data:', e)
      }
    }

    if (!token_ws && !tbk_token) {
       if (tbk_orden_compra) {
         const orderId = parseInt(tbk_orden_compra.replace('O-', ''))
         await cancelOrderAndRestoreStock(orderId)
       }
       return NextResponse.redirect(new URL('/checkout/failure?reason=timeout', req.url), { status: 303 })
    }

    // User aborted payment in Transbank
    if (tbk_token && !token_ws) {
       let orderId: number | null = null
       if (tbk_orden_compra) {
         orderId = parseInt(tbk_orden_compra.replace('O-', ''))
       } else {
         // Fallback: look up the order using the Transbank token
         const payment = await prisma.transaccion_pago.findFirst({
           where: { token_ws: tbk_token }
         })
         if (payment) {
           orderId = payment.id_pedido
         }
       }

       if (orderId) {
         await cancelOrderAndRestoreStock(orderId)
       }
       return NextResponse.redirect(new URL(`/checkout/failure?reason=aborted`, req.url), { status: 303 })
    }

    // Normal flow
    const response = await tx.commit(token_ws as string)
    const orderId = parseInt(response.buy_order.replace('O-', ''))

    if (response.status === 'AUTHORIZED') {
      await prisma.$transaction(async (prismaTx) => {
        await prismaTx.pedido.update({
          where: { id_pedido: orderId },
          data: { estado: 'pagado' }
        })

        await prismaTx.transaccion_pago.updateMany({
          where: { id_pedido: orderId },
          data: {
            estado_pago: 'Aprobado',
            cod_autorizacion: response.authorization_code
          }
        })
      })

      return NextResponse.redirect(new URL(`/checkout/success?order=${orderId}`, req.url), { status: 303 })
    } else {
      // Payment rejected by bank
      await cancelOrderAndRestoreStock(orderId)
      return NextResponse.redirect(new URL(`/checkout/failure?reason=rejected`, req.url), { status: 303 })
    }

  } catch (error: any) {
    console.error('Webpay Commit Error:', error)
    // If commit fails due to timeout or other Transbank API error, the user gets reason=error
    return NextResponse.redirect(new URL('/checkout/failure?reason=error', req.url), { status: 303 })
  }
}

export async function POST(req: NextRequest) {
  return processWebpayReturn(req)
}

export async function GET(req: NextRequest) {
  return processWebpayReturn(req)
}

async function cancelOrderAndRestoreStock(orderId: number) {
  if (!orderId || isNaN(orderId)) return

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Fetch the order details
      const order = await tx.pedido.findUnique({
        where: { id_pedido: orderId },
        include: { articulos: true }
      })

      if (!order) return

      // Only cancel if it's not already canceled
      if (order.estado !== 'cancelado') {
        // Update order status to 'cancelado'
        await tx.pedido.update({
          where: { id_pedido: orderId },
          data: { estado: 'cancelado' }
        })

        // Update payment transaction status to 'Rechazado'
        await tx.transaccion_pago.updateMany({
          where: { id_pedido: orderId },
          data: { estado_pago: 'Rechazado' }
        })

        // Restore stock for all articles in the order
        for (const art of order.articulos) {
          await tx.producto.update({
            where: { id_producto: art.id_producto },
            data: { stock: { increment: art.cantidad } }
          })
        }
        console.log(`[Webpay Return] Order ${orderId} was cancelled and stock restored immediately because the user aborted or transaction failed.`)
      }
    })
  } catch (e) {
    console.error('Failed to cancel order and restore stock:', e)
  }
}
