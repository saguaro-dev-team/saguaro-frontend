'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { User, UserRole } from './store-types'
import { registerUser, loginUser } from '@/app/actions/auth'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isAdmin: boolean
  login: (email: string, password: string) => Promise<{success: boolean, error?: string}>
  register: (data: RegisterData) => Promise<{success: boolean, error?: string}>
  logout: () => void
  updateUser: (data: Partial<User>) => void
}

interface RegisterData {
  email: string
  password: string
  nombre: string
  apellido: string
  rut: string
  telefono: string
  genero: string
  fecha_nacimiento: string
}

const AuthContext = createContext<AuthContextType | null>(null)

// Mock users for demonstration
const mockUsers: (User & { password: string })[] = [
  {
    id: '1',
    email: 'admin@saguaro.cl',
    password: 'admin123',
    nombre: 'Admin',
    apellido: 'Saguaro',
    role: 'administrador',
    fechaRegistro: new Date('2024-01-01'),
  },
  {
    id: '2',
    email: 'cliente@example.com',
    password: 'cliente123',
    nombre: 'Juan',
    apellido: 'Perez',
    role: 'cliente',
    fechaRegistro: new Date('2024-06-15'),
  },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const saved = localStorage.getItem('saguaro_user')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.fechaRegistro) parsed.fechaRegistro = new Date(parsed.fechaRegistro)
        setUser(parsed)
      } catch (e) {
        console.error("Error parsing user from localstorage", e)
      }
    }
  }, [])

  const isAuthenticated = user !== null
  const isAdmin = user?.role === 'administrador'

  const login = useCallback(async (email: string, password: string): Promise<{success: boolean, error?: string}> => {
    try {
      const result = await loginUser(email, password)
      
      if (result.success && result.user) {
        const newUser = {
          id: String(result.user.id),
          email: result.user.email,
          nombre: result.user.nombre,
          apellido: result.user.apellido,
          role: result.user.role as UserRole,
          fechaRegistro: result.user.fechaRegistro as Date,
        }
        setUser(newUser)
        if (typeof window !== 'undefined') localStorage.setItem('saguaro_user', JSON.stringify(newUser))
        return { success: true }
      }
      return { success: false, error: result.error }
    } catch (error) {
      console.error(error)
      return { success: false, error: 'Error de conexión' }
    }
  }, [])

  const register = useCallback(async (data: RegisterData): Promise<{success: boolean, error?: string}> => {
    try {
      const result = await registerUser(data)
      
      if (result.success && result.user) {
        const newUser = {
          id: String(result.user.id),
          email: result.user.email,
          nombre: result.user.nombre,
          apellido: result.user.apellido,
          role: 'cliente' as UserRole,
          fechaRegistro: new Date(),
        }
        setUser(newUser)
        if (typeof window !== 'undefined') localStorage.setItem('saguaro_user', JSON.stringify(newUser))
        return { success: true }
      }
      return { success: false, error: result.error }
    } catch (error) {
      console.error(error)
      return { success: false, error: 'Error de conexión' }
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    if (typeof window !== 'undefined') localStorage.removeItem('saguaro_user')
  }, [])

  const updateUser = useCallback((data: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null
      const next = { ...prev, ...data }
      if (typeof window !== 'undefined') localStorage.setItem('saguaro_user', JSON.stringify(next))
      return next
    })
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
