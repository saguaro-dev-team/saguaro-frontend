import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRut(value: string) {
  // Limpiar caracteres no válidos
  let cleanValue = value.replace(/[^0-9kK]/g, '');
  if (cleanValue.length === 0) return '';
  
  // Limpiar para que las letras K solo puedan estar en la última posición
  const cleanBody = cleanValue.slice(0, -1).replace(/[kK]/g, '');
  const lastChar = cleanValue.slice(-1);
  cleanValue = cleanBody + lastChar;
  
  if (cleanValue.length === 1) return cleanValue;
  
  const dv = cleanValue.slice(-1);
  const body = cleanValue.slice(0, -1);
  
  let formatted = '';
  let count = 0;
  for (let i = body.length - 1; i >= 0; i--) {
    formatted = body[i] + formatted;
    count++;
    if (count === 3 && i !== 0) {
      formatted = '.' + formatted;
      count = 0;
    }
  }
  
  return formatted + '-' + dv;
}

export function validateRut(rut: string): boolean {
  if (!rut) return false;
  // Limpiar puntos y guion, dejando solo dígitos y k/K
  const clean = rut.replace(/[^0-9kK]/g, '');
  // RUTs chilenos válidos: mínimo 7 chars (ej: "1234567-K" → "1234567K")
  // máximo 9 chars (ej: "12.345.678-9" → "123456789")
  if (clean.length < 7 || clean.length > 9) return false;
  
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1).toUpperCase();
  
  // El cuerpo debe contener solo números
  if (!/^\d+$/.test(body)) return false;
  
  // Validar dígito verificador matemáticamente (Algoritmo Módulo 11)
  let sum = 0;
  let multiplier = 2;
  
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  
  const expectedDvVal = 11 - (sum % 11);
  let expectedDv = '';
  if (expectedDvVal === 11) {
    expectedDv = '0';
  } else if (expectedDvVal === 10) {
    expectedDv = 'K';
  } else {
    expectedDv = String(expectedDvVal);
  }
  
  return dv === expectedDv;
}
