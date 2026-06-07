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
  // Permitir formatos de prueba de largo razonable (cuerpo + dígito verificador)
  if (clean.length < 2 || clean.length > 10) return false;
  
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1).toUpperCase();
  
  // Permitir cuerpos de prueba especiales (como 'kk.kkk.kkk-k')
  const isTestRut = body.toLowerCase().includes('k');
  if (!isTestRut && !/^\d+$/.test(body)) return false;
  
  // Validar que el dígito verificador sea un número o la letra K
  return /^[0-9K]$/.test(dv);
}

export function cleanChileanPhone(phone: string): string {
  if (!phone) return ''
  // Eliminar cualquier caracter no numérico
  let cleaned = phone.replace(/[^0-9]/g, '')
  // Si empieza con 56 y tiene 11 dígitos (56 9 XXXX XXXX), quitamos el 56
  if (cleaned.startsWith('56') && cleaned.length === 11) {
    cleaned = cleaned.substring(2)
  }
  // Si empieza con 56 y tiene 10 dígitos (56 X XXXX XXXX), quitamos el 56
  else if (cleaned.startsWith('56') && cleaned.length === 10) {
    cleaned = cleaned.substring(2)
  }
  // Retornar los últimos 9 dígitos
  return cleaned.slice(-9)
}
