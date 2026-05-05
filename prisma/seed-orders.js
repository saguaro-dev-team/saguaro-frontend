const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Sembrando métodos de pago...');
  
  await prisma.metodo_pago.deleteMany({});
  const metodos = [
    { nombre: 'Webpay Plus', descripcion: 'Pago con tarjetas de crédito/débito' },
    { nombre: 'Transferencia Bancaria', descripcion: 'Pago directo a cuenta Rut' },
    { nombre: 'Mercado Pago', descripcion: 'Billetera digital' }
  ];

  for (const m of metodos) {
    await prisma.metodo_pago.create({
      data: m
    });
  }

  console.log('Sembrando empresas de envío externas...');
  await prisma.empresa_externa.deleteMany({});
  const empresas = [
    { nombre_empresa: 'Starken', email_contacto: 'contacto@starken.cl', telefono_empresa: 600200020, direccion_empresa: 'Santiago Centro' },
    { nombre_empresa: 'Chilexpress', email_contacto: 'ayuda@chilexpress.cl', telefono_empresa: 600200010, direccion_empresa: 'Providencia' },
    { nombre_empresa: 'BlueExpress', email_contacto: 'ayuda@blue.cl', telefono_empresa: 600200030, direccion_empresa: 'Pudahuel' }
  ];

  for (const e of empresas) {
    await prisma.empresa_externa.create({ data: e });
  }

  // Opcional: Crear una compra de prueba
  const user = await prisma.usuario.findFirst();
  const product = await prisma.producto.findFirst();

  if (user && product) {
    console.log(`Creando pedido y pago de prueba para el usuario...`);
    
    // Check si el usuario tiene direccion
    let direccion = await prisma.direccion.findFirst({ where: { id_usuario: user.id_usuario } });
    
    if (!direccion) {
      const comuna = await prisma.comuna.findFirst();
      direccion = await prisma.direccion.create({
        data: {
          id_usuario: user.id_usuario,
          id_comuna: comuna.id_comuna,
          calle: 'Avenida Falsa',
          numero: '123',
          activa: true,
          es_principal: true
        }
      });
    }

    const metodoPago = await prisma.metodo_pago.findFirst();
    const empresaEnvio = await prisma.empresa_externa.findFirst();

    const pedido = await prisma.pedido.create({
      data: {
        id_usuario: user.id_usuario,
        fk_usuario_direccion: direccion.id_usuario,
        id_comuna_direccion: direccion.id_comuna,
        fk_numero_correlativo_direccion: direccion.id_direccion,
        total: product.precio,
        estado: 'confirmado',
        articulos: {
          create: {
            id_producto: product.id_producto,
            cantidad: 1,
            precio: product.precio
          }
        },
        pagos: {
          create: {
            id_metodo_pago: metodoPago.id_metodo_pago,
            monto: product.precio,
            estado_pago: 'Aprobado',
            token_ws: 'test_token_' + Date.now(),
            cod_autorizacion: '123456'
          }
        },
        envios: {
          create: {
            id_usuario_dir: direccion.id_usuario,
            id_comuna_dir: direccion.id_comuna,
            id_direccion: direccion.id_direccion,
            id_empresa_t: empresaEnvio.id_empresa_t,
            numero_seguimiento: 'STK123456789',
            fecha_envio: new Date()
          }
        }
      }
    });
    console.log('Pedido, Pago y Envío de prueba creados!');
  }

  console.log('¡Sembrado de órdenes completo con éxito!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
