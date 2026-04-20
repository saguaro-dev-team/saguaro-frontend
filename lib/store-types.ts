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
export type ProductType = 'running' | 'casual' | 'trekking' | 'acuatico' | 'sandalias'

export interface ProductSize {
  talla: number
  stock: number
}

export interface Product {
  id: string
  nombre: string
  descripcion: string
  precio: number
  precioOriginal?: number
  categoria: ProductCategory
  tipo: ProductType
  imagenes: string[]
  tallas: ProductSize[]
  colores: string[]
  colorSeleccionado?: string
  caracteristicas: string[]
  destacado: boolean
  nuevo: boolean
  descuento?: number
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
  id: string
  userId: string
  calle: string
  numero: string
  departamento?: string
  comuna: string
  ciudad: string
  region: string
  codigoPostal: string
  principal: boolean
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
