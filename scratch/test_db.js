const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testUpdate() {
  try {
    const products = await prisma.productos.findMany({ take: 1 })
    if (products.length === 0) {
      console.log("No products found to test")
      return
    }
    const p = products[0]
    console.log("Testing update for product ID:", p.id_producto)
    
    await prisma.productos.update({
      where: { id_producto: p.id_producto },
      data: {
        color: "Amarillo Test",
        talla: "36, 37, 38",
        precio_normal: p.precio_normal,
        stock: p.stock
      }
    })
    console.log("Update successful!")
  } catch (err) {
    console.error("Update FAILED with error:", err)
  } finally {
    await prisma.$disconnect()
  }
}

testUpdate()
