# Guía de Aseguramiento de Calidad y Pruebas (QA) - Saguaro Chile
Este directorio contiene la suite completa de pruebas automáticas e informes de calidad para el proyecto Saguaro Chile. Las pruebas abarcan 7 categorías distintas que garantizan la seguridad, robustez y usabilidad de la plataforma.

---

## 🧪 Estructura de Pruebas y Archivos

1. **Pruebas de Inyección y Seguridad**:
   * **Archivo:** `tests/security-injection-test.ts`
   * **Objetivo:** Ejecuta ataques de inyección SQL (SQLi) y Cross-Site Scripting (XSS) en tiempo real contra los endpoints locales y base de datos.
2. **Pruebas Unitarias**:
   * **Archivo:** `tests/unit.test.ts`
   * **Objetivo:** Prueba unitaria aislada con **Vitest** para certificar la sanitización de teléfonos chilenos.
3. **Pruebas de Estrés y Carga (Load Testing)**:
   * **Archivo:** `tests/stress-k6.js`
   * **Objetivo:** Simulación de concurrencia con hasta 100 usuarios virtuales usando **k6 (Grafana)**.
4. **Pruebas de Integración (Webpay + Stock)**:
   * **Archivo:** `tests/integration.test.ts`
   * **Objetivo:** Prueba de flujo transaccional. Crea órdenes, decrementa stock en base de datos PostgreSQL y verifica la estabilidad relacional.
5. **Pruebas de APIs (Endpoints HTTP)**:
   * **Archivo:** `tests/api.test.ts`
   * **Objetivo:** Peticiones HTTP reales contra `/api/products` y `/api/webpay/commit` para validar códigos de respuesta (200, 400, 404).
6. **Pruebas de Extremo a Extremo (E2E - Playwright)**:
   * **Archivo:** `tests/e2e.test.ts`
   * **Objetivo:** Simulación de navegación en navegador real (Chromium headless) completando la compra.
7. **Pruebas de Accesibilidad (A11y - WCAG)**:
   * **Archivo:** `tests/accessibility.test.ts`
   * **Objetivo:** Auditoría de atributos aria, labels HTML y contraste bajo normas WCAG 2.1.

---

## 🚀 Cómo ejecutar las pruebas localmente

Asegúrate de estar posicionado en el directorio del proyecto (`saguaro-frontend-main`) y tener corriendo el servidor de desarrollo (`npm run dev`) antes de ejecutar pruebas de API o E2E.

### 1. Inyección y Seguridad (Ejecución Directa)
```bash
npx tsx tests/security-injection-test.ts
```

### 2. Pruebas Unitarias, Integración, API y Accesibilidad (Vitest)
```bash
# Correr todas las pruebas basadas en Vitest
npx vitest run

# Correr solo pruebas de Integración
npx vitest run tests/integration.test.ts
```

### 3. Pruebas de Estrés (k6)
*(Requiere tener instalado el binario de k6 en tu computador)*
```bash
k6 run tests/stress-k6.js
```

### 4. Pruebas de Extremo a Extremo (Playwright)
```bash
# Instalar Playwright si no se ha configurado antes
npx playwright install

# Ejecutar las pruebas E2E en segundo plano
npx playwright test tests/e2e.test.ts
```

---

## ☁️ Pipeline DevOps (GitHub Actions CI/CD)
Puedes automatizar esta validación copiando este archivo en tu repositorio en la ruta `.github/workflows/qa-pipeline.yml`:

```yaml
name: Pipeline de Calidad y Seguridad (QA)

on:
  push:
    branches: [ main, dev ]
  pull_request:
    branches: [ main ]

jobs:
  test_and_audit:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: testpassword
          POSTGRES_DB: saguarotest
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - name: Descargar Código
        uses: actions/checkout@v3

      - name: Configurar Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'

      - name: Instalar Dependencias
        run: npm ci

      - name: Generar Cliente de Prisma
        run: npx prisma generate
        env:
          DATABASE_URL: "postgresql://postgres:testpassword@localhost:5432/saguarotest"

      - name: Ejecutar Suite de Vitest (Unitarias, API, Integración y A11y)
        run: npx vitest run
        env:
          DATABASE_URL: "postgresql://postgres:testpassword@localhost:5432/saguarotest"

      - name: Auditoría de Seguridad e Inyección
        run: npx tsx tests/security-injection-test.ts
        env:
          DATABASE_URL: "postgresql://postgres:testpassword@localhost:5432/saguarotest"

      - name: Ejecutar Auditoría de Dependencias (SAST)
        run: npm audit --audit-level=high
```
