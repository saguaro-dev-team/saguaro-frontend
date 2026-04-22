const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Sembrando estados de pedido...');
  const estados = [
    { id_estado: 1, nombre: 'Pendiente', color_hex: '#f59e0b' },
    { id_estado: 2, nombre: 'Pagado', color_hex: '#10b981' },
    { id_estado: 3, nombre: 'Preparando', color_hex: '#3b82f6' },
    { id_estado: 4, nombre: 'Enviado', color_hex: '#8b5cf6' },
    { id_estado: 5, nombre: 'Entregado', color_hex: '#059669' },
    { id_estado: 6, nombre: 'Cancelado', color_hex: '#ef4444' }
  ];

  for (const e of estados) {
    await prisma.estados_pedido.upsert({
      where: { id_estado: e.id_estado },
      update: { nombre: e.nombre, color_hex: e.color_hex },
      create: e
    });
  }

  console.log('Sembrando métodos de pago...');
  const metodos = [
    { id_metodo: 1, nombre: 'Webpay Plus' },
    { id_metodo: 2, nombre: 'Transferencia Bancaria' },
    { id_metodo: 3, nombre: 'Mercado Pago' }
  ];

  for (const m of metodos) {
    await prisma.metodos_pago.upsert({
      where: { id_metodo: m.id_metodo },
      update: { nombre: m.nombre },
      create: m
    });
  }

  // Opcional: Crear una compra de prueba
  const user = await prisma.usuarios.findFirst();
  const product = await prisma.productos.findFirst();

  if (user && product) {
    console.log(`Creando pedido y pago de prueba para ${user.nombre_completo}...`);
    
    const pedido = await prisma.pedidos.create({
      data: {
        id_usuario: user.id_usuario,
        total_pagado: product.precio_normal,
        id_estado: 2, // Pagado
        detalle_pedidos: {
          create: {
            id_producto: product.id_producto,
            cantidad: 1,
            precio_unitario: product.precio_normal,
            color: 'Negro',
            talla: '42'
          }
        },
        pagos: {
          create: {
            id_metodo: 1, // Webpay
            monto: product.precio_normal,
            estado_pago: 'Aprobado',
            token_transaccion: 'test_token_' + Date.now(),
            codigo_autorizacion: '123456'
          }
        },
        seguimiento_envio: {
          create: {
            empresa_transporte: 'Starken',
            numero_guia: 'STK123456789',
            estado_logistico: 'En Tránsito'
          }
        }
      }
    });
    console.log('Pedido, Pago y Seguimiento de prueba creados!');
  }

  console.log('¡Sembrado completo con éxito!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
