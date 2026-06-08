import { describe, it, expect } from 'vitest'
import { cleanChileanPhone } from '../lib/utils'

describe('Sanitización de Teléfono Chileno (cleanChileanPhone)', () => {
  it('debería eliminar el prefijo internacional +569', () => {
    expect(cleanChileanPhone('+56912345678')).toBe('912345678')
  })

  it('debería eliminar el prefijo 569 sin símbolo +', () => {
    expect(cleanChileanPhone('56987654321')).toBe('987654321')
  })

  it('debería mantener el número si ya tiene formato estándar de 9 dígitos', () => {
    expect(cleanChileanPhone('999999999')).toBe('999999999')
  })

  it('debería sanitizar espacios, guiones y caracteres alfanuméricos', () => {
    expect(cleanChileanPhone(' +56-9-1234 5678 ')).toBe('912345678')
    expect(cleanChileanPhone('teléfono: 912345678')).toBe('912345678')
  })
})
