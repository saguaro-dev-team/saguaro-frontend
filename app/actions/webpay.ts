'use server'

import { WebpayPlus, Options, IntegrationApiKeys, Environment, IntegrationCommerceCodes } from 'transbank-sdk'

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
    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/webpay/commit`
    const finalAmount = Math.round(amount)

    const response = await tx.create(buyOrder, sessionId, finalAmount, returnUrl)

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
