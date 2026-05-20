import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

// Load .env manually
try {
  const envPath = path.join(process.cwd(), '.env')
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8')
    for (const line of envConfig.split('\n')) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/)
      if (match) {
        const key = match[1]
        let val = match[2] || ''
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.substring(1, val.length - 1)
        } else if (val.startsWith("'") && val.endsWith("'")) {
          val = val.substring(1, val.length - 1)
        }
        process.env[key] = val.trim()
      }
    }
  }
} catch (e) {
  console.error('Error loading .env', e)
}

const prisma = new PrismaClient()

async function main() {
  const modelsCount = await prisma.modelo.count()
  const categoriesCount = await prisma.categoria.count()
  const productsCount = await prisma.producto.count()
  const categories = await prisma.categoria.findMany()
  
  console.log('--- DB STATUS ---')
  console.log('Models Count:', modelsCount)
  console.log('Categories Count:', categoriesCount)
  console.log('Products Count:', productsCount)
  console.log('Categories list:', categories)
}

main().catch(console.error).finally(() => prisma.$disconnect())
