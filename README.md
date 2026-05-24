# Saguaro Barefoot - Tienda Online de Calzado Respetuoso

Saguaro Barefoot es una aplicación web e-commerce de calzado ergonómico y minimalista desarrollada sobre **Next.js (App Router)** utilizando **Prisma ORM** para la base de datos PostgreSQL hospedada en la nube de **Supabase**, y estilizada con **CSS Vanilla** y componentes accesibles de Radix UI.

---

## Arquitectura de Almacenamiento Híbrido

Para garantizar que el proyecto funcione perfectamente tanto en el entorno de desarrollo local como en una plataforma *serverless* (como **Vercel**), se diseñó e implementó un **Sistema de Almacenamiento de Imágenes Híbrido**:

* **Entorno Local (Desarrollo):** El panel de administrador guarda las imágenes físicamente en la carpeta `/public/zapatillas/` del disco de tu computadora. Estas imágenes se empaquetan al realizar el despliegue a producción.
* **Entorno Live en la Nube (Vercel):** Si agregas las credenciales de Supabase Storage en el archivo `.env`, la aplicación subirá las fotos directamente a la nube en un **Bucket público de Supabase Storage**. Esto soluciona la restricción del disco temporal de Vercel, permitiendo al administrador o al profesor subir imágenes en cualquier momento desde el sitio en vivo de forma persistentemente.

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
   cd saguaro-frontend-main
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

Para que las subidas de imágenes del panel de administrador sean 100% permanentes e independientes de la computadora local (es decir, visibles en vivo por cualquier persona desde Vercel):

1. Ingresa a tu consola web de **Supabase**.
2. Ve a la sección **Storage** y crea un bucket llamado `zapatillas`.
3. Edita las políticas del bucket (Policies) y hazlo **Público** para permitir la lectura y subida de archivos de forma externa.
4. Añade tus variables `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` en tu `.env` o en el panel de variables de entorno en Vercel.
5. **¡Listo!** El sistema detectará automáticamente la llave, redirigirá todas las subidas de archivos a la nube y tu profesor verá las fotos permanentemente desde su casa.
