// Types based on the database schema for Saguaro Barefoot Chile

export interface Categoria {
  id_categoria: number
  nombre: string
  descripcion: string
  is_active: boolean
}

export interface Usuario {
  id_usuario: number
  nombre_completo: string
  rut: string
  email: string
  rol: 'admin' | 'cliente'
  is_active: boolean
  fecha_registro: string
}

export interface Producto {
  id_producto: number
  id_categoria: number
  nombre: string
  descripcion: string
  precio_normal: number
  precio_oferta: number
  stock: number
  imagen_url: string
  talla: string
  color: string
  is_novedad: boolean
  is_recomendado: boolean
  is_oferta: boolean
  is_active: boolean
  fecha_creacion: string
}

export interface Pedido {
  id_pedido: number
  id_usuario: number
  fecha_pedido: string
  total_pagado: number
  estado_pedido: 'Pagado' | 'En Preparación' | 'Enviado' | 'Entregado' | 'Cancelado'
  token_webpay: string
  authorization_code: string
  is_active: boolean
}

export interface DetallePedido {
  id_detalle: number
  id_pedido: number
  id_producto: number
  cantidad: number
  precio_unitario: number
  is_active: boolean
}

export interface AuditoriaStock {
  id_log: number
  id_producto: number
  cantidad_anterior: number
  cantidad_nueva: number
  motivo: string
  fecha: string
}

// KPIs for Business Intelligence
export interface KPIData {
  ticketPromedio: number
  totalVentas: number
  totalPedidos: number
  clientesRegistrados: number
  tasaConversion: number
  productosConStockCritico: number
  totalVariantes: number
}

export interface VentasMensuales {
  mes: string
  ventas: number
  pedidos: number
}

export interface ProductoVendido {
  nombre: string
  cantidad: number
  ingresos: number
  categoria: string
}

export interface StockCritico {
  id_producto: number
  nombre: string
  stock: number
  velocidadVenta: number
  diasRestantes: number
}
