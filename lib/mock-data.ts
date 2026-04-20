import type { 
  KPIData, 
  VentasMensuales, 
  ProductoVendido, 
  StockCritico,
  Pedido
} from './types'

// Mock KPI Data for Saguaro Barefoot Chile
export const kpiData: KPIData = {
  ticketPromedio: 67890,
  totalVentas: 12458760,
  totalPedidos: 183,
  clientesRegistrados: 342,
  tasaConversion: 3.8,
  productosConStockCritico: 5
}

// Mock Monthly Sales Data
export const ventasMensuales: VentasMensuales[] = [
  { mes: 'Ene', ventas: 856000, pedidos: 12 },
  { mes: 'Feb', ventas: 945000, pedidos: 14 },
  { mes: 'Mar', ventas: 1125000, pedidos: 17 },
  { mes: 'Abr', ventas: 1340000, pedidos: 20 },
  { mes: 'May', ventas: 1180000, pedidos: 18 },
  { mes: 'Jun', ventas: 1420000, pedidos: 22 },
  { mes: 'Jul', ventas: 1560000, pedidos: 24 },
  { mes: 'Ago', ventas: 1380000, pedidos: 21 },
  { mes: 'Sep', ventas: 1290000, pedidos: 19 },
  { mes: 'Oct', ventas: 1450000, pedidos: 22 },
  { mes: 'Nov', ventas: 1680000, pedidos: 26 },
  { mes: 'Dic', ventas: 1890000, pedidos: 29 }
]

// Mock Top Products
export const productosVendidos: ProductoVendido[] = [
  { nombre: 'Saguaro Trail Runner Pro', cantidad: 45, ingresos: 3150000, categoria: 'Running' },
  { nombre: 'Saguaro Urban Walker', cantidad: 38, ingresos: 2280000, categoria: 'Casual' },
  { nombre: 'Saguaro Aqua Grip', cantidad: 32, ingresos: 1920000, categoria: 'Acuático' },
  { nombre: 'Saguaro Kids Active', cantidad: 28, ingresos: 1120000, categoria: 'Niños' },
  { nombre: 'Saguaro Mountain Hiker', cantidad: 24, ingresos: 1920000, categoria: 'Trekking' }
]

// Mock Critical Stock Products
export const stockCritico: StockCritico[] = [
  { id_producto: 1, nombre: 'Saguaro Trail Runner Pro - 42 Negro', stock: 3, velocidadVenta: 1.2, diasRestantes: 3 },
  { id_producto: 2, nombre: 'Saguaro Urban Walker - 38 Gris', stock: 5, velocidadVenta: 0.8, diasRestantes: 6 },
  { id_producto: 3, nombre: 'Saguaro Aqua Grip - 40 Azul', stock: 4, velocidadVenta: 0.7, diasRestantes: 6 },
  { id_producto: 4, nombre: 'Saguaro Kids Active - 32 Rojo', stock: 2, velocidadVenta: 0.5, diasRestantes: 4 },
  { id_producto: 5, nombre: 'Saguaro Trail Runner Pro - 44 Verde', stock: 4, velocidadVenta: 0.6, diasRestantes: 7 }
]

// Mock Recent Orders
export const pedidosRecientes: (Pedido & { cliente: string })[] = [
  { 
    id_pedido: 183, 
    id_usuario: 45, 
    fecha_pedido: '2026-04-18T10:30:00', 
    total_pagado: 89990, 
    estado_pedido: 'En Preparación',
    token_webpay: 'TBK_123456',
    authorization_code: 'AUTH_001',
    is_active: true,
    cliente: 'María González'
  },
  { 
    id_pedido: 182, 
    id_usuario: 78, 
    fecha_pedido: '2026-04-17T16:45:00', 
    total_pagado: 149980, 
    estado_pedido: 'Enviado',
    token_webpay: 'TBK_123455',
    authorization_code: 'AUTH_002',
    is_active: true,
    cliente: 'Carlos Rodríguez'
  },
  { 
    id_pedido: 181, 
    id_usuario: 92, 
    fecha_pedido: '2026-04-17T11:20:00', 
    total_pagado: 59990, 
    estado_pedido: 'Entregado',
    token_webpay: 'TBK_123454',
    authorization_code: 'AUTH_003',
    is_active: true,
    cliente: 'Ana Martínez'
  },
  { 
    id_pedido: 180, 
    id_usuario: 34, 
    fecha_pedido: '2026-04-16T09:15:00', 
    total_pagado: 119980, 
    estado_pedido: 'Entregado',
    token_webpay: 'TBK_123453',
    authorization_code: 'AUTH_004',
    is_active: true,
    cliente: 'Pedro Sánchez'
  },
  { 
    id_pedido: 179, 
    id_usuario: 56, 
    fecha_pedido: '2026-04-15T14:30:00', 
    total_pagado: 79990, 
    estado_pedido: 'Entregado',
    token_webpay: 'TBK_123452',
    authorization_code: 'AUTH_005',
    is_active: true,
    cliente: 'Laura Fernández'
  }
]

// Sales by Category
export const ventasPorCategoria = [
  { categoria: 'Running', ventas: 4850000, porcentaje: 38.9 },
  { categoria: 'Casual', ventas: 3120000, porcentaje: 25.0 },
  { categoria: 'Trekking', ventas: 2340000, porcentaje: 18.8 },
  { categoria: 'Acuático', ventas: 1456000, porcentaje: 11.7 },
  { categoria: 'Niños', ventas: 692760, porcentaje: 5.6 }
]

// Hourly sales distribution
export const ventasPorHora = [
  { hora: '08:00', ventas: 3 },
  { hora: '09:00', ventas: 5 },
  { hora: '10:00', ventas: 8 },
  { hora: '11:00', ventas: 12 },
  { hora: '12:00', ventas: 15 },
  { hora: '13:00', ventas: 10 },
  { hora: '14:00', ventas: 8 },
  { hora: '15:00', ventas: 11 },
  { hora: '16:00', ventas: 14 },
  { hora: '17:00', ventas: 18 },
  { hora: '18:00', ventas: 22 },
  { hora: '19:00', ventas: 25 },
  { hora: '20:00', ventas: 20 },
  { hora: '21:00', ventas: 12 }
]
