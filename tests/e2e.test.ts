import { test, expect } from '@playwright/test'

test.describe('Flujo de Experiencia del Usuario (E2E) - Saguaro Barefoot', () => {
  test('debería navegar por la tienda, seleccionar zapatillas, agregar al carro y proceder a checkout', async ({ page }) => {
    // 1. Abrir tienda
    await page.goto('http://localhost:3000/')
    await expect(page).toHaveTitle(/Saguaro/)

    // 2. Seleccionar primer calzado de la lista
    const firstProduct = page.locator('.product-card').first()
    await firstProduct.click()

    // 3. Seleccionar talla y añadir al carro
    await page.click('button:has-text("40")')
    await page.click('button:has-text("Agregar al Carrito")')

    // 4. Abrir drawer y pulsar botón de Checkout
    await page.click('button:has-text("Ver Carrito")')
    await page.click('button:has-text("Proceder al Pago")')

    // 5. Verificar llegada al formulario de pago
    await expect(page).toHaveURL(/.*checkout/)
    await expect(page.locator('h1')).toContainText('Detalles del Envío')
  })
})
