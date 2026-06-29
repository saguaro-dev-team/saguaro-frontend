export type UserRole = 'cliente' | 'administrador'

export interface User {
  id: string
  email: string
  nombre: string
  apellido: string
  telefono?: string
  role: UserRole
  fechaRegistro: Date
}

export type ProductCategory = 'hombre' | 'mujer' | 'nino'
export type ProductType = 'running' | 'casual' | 'trekking' | 'acuatico' | 'sandalias' | 'casuales' | 'deportivas' | 'botas'

export interface ProductSize {
  talla: number
  stock: number
  sku?: string
}

export interface Product {
  id: string
  nombre: string
  descripcion: string
  precio: number
  precioOriginal?: number
  categoria: ProductCategory
  tipo: ProductType
  genero?: string
  uso?: string
  estilo?: string
  imagenes: string[]
  imagenesPorColor?: Record<string, string[]>
  tallas: ProductSize[]
  colores: string[]
  colorSeleccionado?: string
  caracteristicas: string[]
  destacado: boolean
  nuevo: boolean
  descuento?: number
  activo?: boolean
  tallasPorColor?: Record<string, ProductSize[]>
}

export interface CartItem {
  producto: Product
  cantidad: number
  talla: number
  color: string
}

export interface Cart {
  items: CartItem[]
  total: number
}

export interface Address {
  id_direccion: number
  id_usuario: number
  calle: string
  numero: string
  detalles?: string
  id_comuna: number
  comuna?: {
    id_comuna: number
    nombre: string
    region: {
      id_region: number
      nombre: string
    }
  }
  is_active: boolean
  principal?: boolean
}

export interface OrderStatus {
  estado: 'pendiente' | 'pagado' | 'preparando' | 'enviado' | 'entregado' | 'cancelado'
  fecha: Date
  descripcion: string
}

export interface Order {
  id: string
  userId: string
  items: CartItem[]
  subtotal: number
  envio: number
  total: number
  direccionEnvio: Address
  estados: OrderStatus[]
  estadoActual: OrderStatus['estado']
  fechaCreacion: Date
  numeroSeguimiento?: string
}
