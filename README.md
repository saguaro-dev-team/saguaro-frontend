# Saguaro Barefoot - Tienda Online de Calzado Respetuoso

Saguaro Barefoot es una aplicación web e-commerce de calzado ergonómico y minimalista desarrollada sobre **Next.js (App Router)** utilizando **Prisma ORM** para la base de datos PostgreSQL hospedada en la nube de **Supabase**, y estilizada con **CSS Vanilla** y componentes accesibles de Radix UI.

---

## Arquitectura General del Sistema

Saguaro Barefoot está diseñado bajo una arquitectura de software moderna, desacoplada y altamente escalable, utilizando un stack tecnológico moderno de nivel empresarial:

```mermaid
graph TD
    Client[Cliente / Navegador] -->|Next.js Router / React 19| AppRouter[Next.js App Router]
    AppRouter -->|Server Actions / Middleware| API[Capa Lógica del Servidor]
    API -->|Prisma ORM| DB[(Base de Datos PostgreSQL - Supabase)]
    API -->|Supabase Storage API| CloudStorage[Almacenamiento en la Nube - Supabase Storage]
    API -->|Local File System API| LocalStorage[Disco Local - public/zapatillas/]
```

### Componentes Clave de la Arquitectura:

1. **Frontend y Lógica de Cliente (React & Next.js App Router)**:
   - Diseñado con **Next.js (App Router)** y **React 19** para optimizar el rendimiento de la aplicación mediante la combinación eficiente de Server Components (SSR) para carga rápida e indexación SEO, y Client Components (CSR) para interactividad fluida.
   - Modularización de componentes mediante un sistema de diseño visual responsivo desarrollado en CSS Vanilla y componentes accesibles de Radix UI.
   - Sincronización en tiempo real de estados de sesión (login/logout) a través de múltiples pestañas activas del navegador utilizando escuchadores de eventos nativos del DOM (`storage`).

2. **Capa de Negocio y Lógica del Servidor (Server Actions)**:
   - Centralización de la lógica crítica de negocio en **Server Actions**, ejecutando de forma segura validaciones de datos sensibles del lado del servidor (como el formateo y la validación matemática de RUT chileno con el Algoritmo Módulo 11).
   - Capa de seguridad que restringe el volumen de datos en los inputs del usuario (correos electrónicos a 100 caracteres y contraseñas a 50 caracteres) para blindar el backend contra inyecciones maliciosas o desbordamiento de memoria.
   - Control transaccional a nivel de base de datos para compras, garantizando la consistencia exacta de inventario por variante (color y talla específicos) antes de autorizar las transacciones.

3. **Persistencia e Integridad Relacional (PostgreSQL & Prisma ORM)**:
   - Base de datos relacional robusta en **PostgreSQL**, alojada de forma administrada en la nube de **Supabase**.
   - Capa de abstracción de datos implementada mediante **Prisma ORM**, controlando de forma declarativa el modelado relacional, las consultas optimizadas y la ejecución de migraciones en producción.
   - Jerarquía relacional robusta e indexada para productos, modelos, variantes de color, tallas, usuarios, direcciones de despacho y pedidos de Webpay.

4. **Infraestructura, Contenedores y CI/CD**:
   - **Dockerización Completa**: Entorno de desarrollo reproducible, ágil y autocontenido mediante contenedores Docker basados en imágenes Linux Alpine de peso mínimo.
   - **Despliegue Continuo**: Integrado nativamente con **Vercel** para automatizar el ciclo de vida del software, desplegando actualizaciones inmediatas con cada integración de código.

---

## Arquitectura de Almacenamiento Híbrido

Para garantizar que el proyecto funcione de forma óptima tanto en el entorno de desarrollo local como en una plataforma *serverless* con sistema de archivos efímero (como **Vercel**), se implementó una **Arquitectura de Almacenamiento de Imágenes Híbrida**:

* **Entorno de Desarrollo Local:** El panel de administración almacena los archivos cargados físicamente en la ruta `/public/zapatillas/` del disco duro local, facilitando un desarrollo rápido y sin consumo de ancho de banda de red externo.
* **Entorno de Producción en Vivo (Vercel):** Al detectar la existencia de las variables de entorno de Supabase en el archivo `.env`, la aplicación desvía dinámicamente todas las cargas de imágenes directamente hacia un **Bucket público de Supabase Storage**. Esto soluciona la restricción de almacenamiento persistente de Vercel, permitiendo al administrador cargar imágenes de forma persistente y en tiempo real desde el sitio en producción.

---

## Instrucciones de Instalación y Uso (Docker)

El proyecto cuenta con dockerización para facilitar su despliegue reproducible sin necesidad de tener Node.js instalado localmente.

### Prerrequisitos
* Tener instalado **Docker** y **Docker Compose** en tu sistema.
* Contar con el archivo `.env` configurado en la raíz del proyecto.

### Pasos para iniciar la aplicación:

1. **Clonar el repositorio:**
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd saguaro-frontend
   ```

2. **Configurar las variables de entorno:**
   Crea o verifica el archivo `.env` en la raíz del proyecto con tus credenciales de Supabase:
   ```env
   # Conexión a Base de Datos en Supabase (Pooler)
   DATABASE_URL="postgresql://postgres.[ID_PROYECTO]:[PASSWORD]@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

   # Conexión Directa para Migraciones
   DIRECT_URL="postgresql://postgres.[ID_PROYECTO]:[PASSWORD]@aws-1-sa-east-1.pooler.supabase.com:5432/postgres"

   # (Opcional) Para subida de fotos en la nube en Vercel/Producción:
   SUPABASE_URL="https://[ID_PROYECTO].supabase.co"
   SUPABASE_SERVICE_ROLE_KEY="[TU_SERVICE_ROLE_KEY]"
   ```

3. **Construir y levantar los contenedores con Docker Compose:**
   Ejecuta el siguiente comando para compilar el proyecto y arrancar el contenedor en segundo plano:
   ```bash
   docker compose up --build -d
   ```

4. **Acceder a la aplicación:**
   Una vez que termine de compilar y levantar, abre tu navegador e ingresa a:
   * **Tienda:** [http://localhost:3000](http://localhost:3000)
   * **Panel de Administrador:** [http://localhost:3000/admin](http://localhost:3000/admin)

5. **Detener la aplicación:**
   Si deseas detener el contenedor, simplemente ejecuta:
   ```bash
   docker compose down
   ```

---

## Contenedores y Servicios Utilizados (`docker-compose.yml`)

El proyecto está diseñado bajo una arquitectura modular y ligera utilizando los siguientes elementos en su composición:

| Servicio | Contenedor | Imagen Base | Puerto Expuesto | Propósito |
| :--- | :--- | :--- | :--- | :--- |
| **web** | `saguaro-frontend-main-web` | `node:22-alpine` | `3000:3000` | Servidor Next.js (App, API, Prisma ORM). |

---

## Despliegue de Imágenes en la Nube (Supabase Storage)

Para que las subidas de imágenes del panel de administrador sean 100% permanentes e independientes del servidor efímero en entornos productivos:

1. Ingresa a tu consola web de **Supabase**.
2. Dirígete a la sección **Storage** y crea un bucket público llamado `zapatillas`.
3. Configura las políticas del bucket (Policies) para permitir la lectura y escritura pública de archivos desde clientes externos autorizados.
4. Vincula las variables de entorno `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` en tu archivo `.env` o en el panel de variables de entorno de tu proveedor de hosting (como Vercel).
5. **¡Listo!** El sistema detectará automáticamente las credenciales, redirigirá todas las cargas de archivos a la nube y garantizará la disponibilidad y visualización persistente de las imágenes de forma global en producción.
