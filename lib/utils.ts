import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRut(value: string) {
  // Eliminar cualquier carácter que no sea número o k/K
  const cleanValue = value.replace(/[^0-9kK]/g, '');
  if (cleanValue.length === 0) return '';
  
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
