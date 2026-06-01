'use server'

import { WebpayPlus, Options, IntegrationApiKeys, Environment, IntegrationCommerceCodes } from 'transbank-sdk'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'

const tx = new WebpayPlus.Transaction(
  new Options(
    IntegrationCommerceCodes.WEBPAY_PLUS,
    IntegrationApiKeys.WEBPAY,
    Environment.Integration
  )
)

export async function initWebpayTransaction(orderId: number, amount: number) {
  try {
    const buyOrder = `O-${orderId}`
    const sessionId = `S-${Date.now()}`
    
    // Dynamically detect the application URL from headers so it works correctly on Vercel and local
    const headersList = await headers()
    const host = headersList.get('host') || 'localhost:3000'
    const proto = headersList.get('x-forwarded-proto') || 'http'
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || `${proto}://${host}`
    
    const returnUrl = `${appUrl}/api/webpay/commit`
    const finalAmount = Math.round(amount)

    const response = await tx.create(buyOrder, sessionId, finalAmount, returnUrl)

    // Save token in the transaction record for future reference (like cancellation or status checks)
    await prisma.transaccion_pago.updateMany({
      where: { id_pedido: orderId },
      data: { token_ws: response.token }
    })

    return {
      success: true,
      url: response.url,
      token: response.token
    }
  } catch (error: any) {
    console.error('Error init Webpay:', error)
    return { success: false, error: 'Error al inicializar el pago con Transbank' }
  }
}

