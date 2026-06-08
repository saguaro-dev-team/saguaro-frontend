import http from 'k6/http';
import { sleep, check } from 'k6';

// Opciones de configuración de la simulación de carga para k6 (Grafana)
export const options = {
  stages: [
    { duration: '10s', target: 20 },  // Rampa de subida: de 0 a 20 usuarios virtuales (VUs) en 10 segundos
    { duration: '20s', target: 50 },  // Carga constante: 50 usuarios durante 20 segundos
    { duration: '30s', target: 100 }, // Pico de estrés: Subir a 100 usuarios en 30 segundos
    { duration: '10s', target: 0 },   // Rampa de bajada: enfriamiento del servidor en 10 segundos
  ],
  thresholds: {
    // Criterios de Aceptación Académica y Profesional (SLAs)
    http_req_duration: ['p(95)<150'], // El 95% de las peticiones HTTP debe completarse en menos de 150ms
    http_req_failed: ['rate<0.01'],    // La tasa de error del servidor debe ser menor al 1%
  },
};

// Escenario principal de prueba
export default function () {
  // Dirección del servidor local
  const url = 'http://localhost:3000/';
  const res = http.get(url);
  
  // Validaciones lógicas
  check(res, {
    'Código de estado es 200 (Éxito)': (r) => r.status === 200,
    'El sitio web contiene "Saguaro"': (r) => r.body.includes('Saguaro'),
  });

  // Tiempo de espera aleatorio entre interacciones de usuario para imitar conducta humana
  sleep(Math.random() * 1.5 + 0.5);
}
