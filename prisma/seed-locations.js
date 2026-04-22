const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Sembrando colores...');
  const colores = [
    { nombre: 'Negro', codigo_hex: '#000000' },
    { nombre: 'Blanco', codigo_hex: '#ffffff' },
    { nombre: 'Rojo', codigo_hex: '#ef4444' },
    { nombre: 'Azul', codigo_hex: '#3b82f6' },
    { nombre: 'Verde', codigo_hex: '#1B7B4E' },
    { nombre: 'Amarillo', codigo_hex: '#eab308' },
    { nombre: 'Gris', codigo_hex: '#6b7280' },
    { nombre: 'Naranja', codigo_hex: '#f97316' },
    { nombre: 'Morado', codigo_hex: '#a855f7' },
    { nombre: 'Rosa', codigo_hex: '#ec4899' },
    { nombre: 'Café', codigo_hex: '#78350f' },
    { nombre: 'Beige', codigo_hex: '#f5f5dc' },
    { nombre: 'Celeste', codigo_hex: '#0ea5e9' },
    { nombre: 'Turquesa', codigo_hex: '#14b8a6' },
    { nombre: 'Mostaza', codigo_hex: '#e1ad01' },
    { nombre: 'Coral', codigo_hex: '#ff7f50' },
    { nombre: 'Nude', codigo_hex: '#e3bc9a' },
    { nombre: 'Verde Militar', codigo_hex: '#4d5d53' },
    { nombre: 'Menta', codigo_hex: '#98ff98' },
    { nombre: 'Crema', codigo_hex: '#fffdd0' },
    { nombre: 'Oro', codigo_hex: '#ffd700' },
    { nombre: 'Plata', codigo_hex: '#c0c0c0' },
    { nombre: 'Terracota', codigo_hex: '#e2725b' },
    { nombre: 'Ocre', codigo_hex: '#cc7722' },
    { nombre: 'Oliva', codigo_hex: '#808000' }
  ];

  for (const c of colores) {
    await prisma.colores.upsert({
      where: { nombre: c.nombre },
      update: { codigo_hex: c.codigo_hex },
      create: c
    });
  }

  console.log('Sembrando Regiones y Comunas de Chile...');
  const data = [
    {
      region: 'Arica y Parinacota',
      comunas: ['Arica', 'Camarones', 'Putre', 'General Lagos']
    },
    {
      region: 'Tarapacá',
      comunas: ['Iquique', 'Alto Hospicio', 'Pozo Almonte', 'Camiña', 'Colchane', 'Huara', 'Pica']
    },
    {
      region: 'Antofagasta',
      comunas: ['Antofagasta', 'Mejillones', 'Sierra Gorda', 'Taltal', 'Calama', 'Ollagüe', 'San Pedro de Atacama', 'Tocopilla', 'María Elena']
    },
    {
      region: 'Atacama',
      comunas: ['Copiapó', 'Caldera', 'Tierra Amarilla', 'Chañaral', 'Diego de Almagro', 'Vallenar', 'Alto del Carmen', 'Freirina', 'Huasco']
    },
    {
      region: 'Coquimbo',
      comunas: ['La Serena', 'Coquimbo', 'Andacollo', 'La Higuera', 'Paiguano', 'Vicuña', 'Illapel', 'Canela', 'Los Vilos', 'Salamanca', 'Ovalle', 'Combarbalá', 'Monte Patria', 'Punitaqui', 'Río Hurtado']
    },
    {
      region: 'Valparaíso',
      comunas: ['Valparaíso', 'Casablanca', 'Concón', 'Juan Fernández', 'Puchuncaví', 'Quintero', 'Viña del Mar', 'Isla de Pascua', 'Los Andes', 'Calle Larga', 'Rinconada', 'San Esteban', 'La Ligua', 'Cabildo', 'Papudo', 'Petorca', 'Zapallar', 'Quillota', 'Calera', 'Hijuelas', 'La Cruz', 'Nogales', 'San Antonio', 'Algarrobo', 'Cartagena', 'El Quisco', 'El Tabo', 'Santo Domingo', 'San Felipe', 'Catemu', 'Llaillay', 'Panquehue', 'Putaendo', 'Santa María', 'Quilpué', 'Limache', 'Olmué', 'Villa Alemana']
    },
    {
      region: 'Metropolitana de Santiago',
      comunas: ['Santiago', 'Cerrillos', 'Cerro Navia', 'Conchalí', 'El Bosque', 'Estación Central', 'Huechuraba', 'Independencia', 'La Cisterna', 'La Florida', 'La Granja', 'La Pintana', 'La Reina', 'Las Condes', 'Lo Barnechea', 'Lo Espejo', 'Lo Prado', 'Macul', 'Maipú', 'Ñuñoa', 'Pedro Aguirre Cerda', 'Peñalolén', 'Providencia', 'Pudahuel', 'Quilicura', 'Quinta Normal', 'Recoleta', 'Renca', 'San Joaquín', 'San Miguel', 'San Ramón', 'Vitacura', 'Puente Alto', 'Pirque', 'San José de Maipo', 'San Bernardo', 'Buin', 'Calera de Tango', 'Paine', 'Melipilla', 'Alhué', 'Curacaví', 'María Pinto', 'San Pedro', 'Talagante', 'El Monte', 'Isla de Maipo', 'Padre Hurtado', 'Peñaflor', 'Colina', 'Lampa', 'Tiltil']
    },
    {
      region: 'Libertador Gral. Bernardo O\'Higgins',
      comunas: ['Rancagua', 'Codegua', 'Coinco', 'Coltauco', 'Doñihue', 'Graneros', 'Las Cabras', 'Machalí', 'Malloa', 'Mostazal', 'Olivar', 'Peumo', 'Pichidegua', 'Quinta de Tilcoco', 'Rengo', 'Requínoa', 'San Vicente', 'Pichilemu', 'La Estrella', 'Litueche', 'Marchihue', 'Navidad', 'Paredones', 'San Fernando', 'Chépica', 'Chimbarongo', 'Lolol', 'Nancagua', 'Palmilla', 'Peralillo', 'Placilla', 'Pumanque', 'Santa Cruz']
    },
    {
      region: 'Maule',
      comunas: ['Talca', 'Constitución', 'Curepto', 'Empedrado', 'Maule', 'Pelarco', 'Pencahue', 'Río Claro', 'San Clemente', 'San Rafael', 'Cauquenes', 'Chanco', 'Pelluhue', 'Curicó', 'Hualañé', 'Licantén', 'Molina', 'Rauco', 'Romeral', 'Sagrada Familia', 'Teno', 'Vichuquén', 'Linares', 'Colbún', 'Longaví', 'Parral', 'Retiro', 'San Javier', 'Villa Alegre', 'Yerbas Buenas']
    },
    {
      region: 'Ñuble',
      comunas: ['Chillán', 'Bulnes', 'Chillán Viejo', 'El Carmen', 'Pemuco', 'Pinto', 'Quillón', 'San Ignacio', 'Yungay', 'Quirihue', 'Cobquecura', 'Coelemu', 'Ninhue', 'Portezuelo', 'Ránquil', 'Trehuaco', 'San Carlos', 'Coihueco', 'Ñiquén', 'San Fabián', 'San Nicolás']
    },
    {
      region: 'Biobío',
      comunas: ['Concepción', 'Coronel', 'Chiguayante', 'Florida', 'Hualqui', 'Lota', 'Penco', 'San Pedro de la Paz', 'Santa Juana', 'Talcahuano', 'Tomé', 'Hualpén', 'Lebu', 'Arauco', 'Cañete', 'Contulmo', 'Curanilahue', 'Los Álamos', 'Tirúa', 'Los Ángeles', 'Antuco', 'Cabrero', 'Laja', 'Mulchén', 'Nacimiento', 'Negrete', 'Quilaco', 'Quilleco', 'San Rosendo', 'Santa Bárbara', 'Tucapel', 'Yumbel', 'Alto Biobío']
    },
    {
      region: 'La Araucanía',
      comunas: ['Temuco', 'Carahue', 'Cunco', 'Curarrehue', 'Freire', 'Galvarino', 'Gorbea', 'Lautaro', 'Loncoche', 'Melipeuco', 'Nueva Imperial', 'Padre las Casas', 'Perquenco', 'Pitrufquén', 'Pucón', 'Saavedra', 'Teodoro Schmidt', 'Toltén', 'Vilcún', 'Villarrica', 'Cholchol', 'Angol', 'Collipulli', 'Curacautín', 'Ercilla', 'Lonquimay', 'Los Sauces', 'Lumaco', 'Purén', 'Renaico', 'Traiguén', 'Victoria']
    },
    {
      region: 'Los Ríos',
      comunas: ['Valdivia', 'Corral', 'Lanco', 'Los Lagos', 'Máfil', 'Mariquina', 'Paillaco', 'Panguipulli', 'La Unión', 'Futrono', 'Lago Ranco', 'Río Bueno']
    },
    {
      region: 'Los Lagos',
      comunas: ['Puerto Montt', 'Calbuco', 'Cochamó', 'Fresia', 'Frutillar', 'Los Muermos', 'Llanquihue', 'Maullín', 'Puerto Varas', 'Castro', 'Ancud', 'Chonchi', 'Curaco de Vélez', 'Dalcahue', 'Puqueldón', 'Queilén', 'Quellón', 'Quemchi', 'Quinchao', 'Osorno', 'Puerto Octay', 'Purranque', 'Puyehue', 'Río Negro', 'San Juan de la Costa', 'San Pablo', 'Chaitén', 'Futaleufú', 'Hualaihué', 'Palena']
    },
    {
      region: 'Aisén del Gral. Carlos Ibáñez del Campo',
      comunas: ['Coyhaique', 'Lago Verde', 'Aisén', 'Cisnes', 'Guaitecas', 'Cochrane', "O'Higgins", 'Tortel', 'Chile Chico', 'Río Ibáñez']
    },
    {
      region: 'Magallanes y de la Antártica Chilena',
      comunas: ['Punta Arenas', 'Laguna Blanca', 'Río Verde', 'San Gregorio', 'Cabo de Hornos', 'Antártica', 'Porvenir', 'Primavera', 'Timaukel', 'Natales', 'Torres del Paine']
    }
  ];

  for (const r of data) {
    const region = await prisma.region.create({
      data: {
        nombre_region: r.region
      }
    });

    for (const c of r.comunas) {
      await prisma.comuna.create({
        data: {
          nombre_comuna: c,
          id_region: region.id_region
        }
      });
    }
  }

  console.log('Sembrado completo de Colores, Regiones y Comunas!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
