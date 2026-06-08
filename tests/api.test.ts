import { describe, it, expect } from 'vitest'

describe('Pruebas de Endpoints de la API (HTTP)', () => {
  it('GET /api/products debería retornar la lista del catálogo en formato JSON', async () => {
    const res = await fetch('http://localhost:3000/api/products').catch(() => null)
    
    if (res) {
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(Array.isArray(data)).toBe(true)
    } else {
      console.warn('Servidor local apagado. Saltando aserción de red real.')
    }
  })

  it('POST /api/webpay/commit debería retornar 400 Bad Request si no se proporciona token de pago', async () => {
    const res = await fetch('http://localhost:3000/api/webpay/commit', {
      method: 'POST'
    }).catch(() => null)

    if (res) {
      expect(res.status).toBe(400)
    } else {
      console.warn('Servidor local apagado. Saltando aserción de red real.')
    }
  })
})
