FROM node:20-alpine

# 0. Activamos pnpm (viene incluido en las nuevas versiones de Node, solo hay que habilitarlo)
RUN corepack enable pnpm

# 1. Establecemos el directorio de trabajo dentro del contenedor
WORKDIR /app

# 2. Copiamos los archivos de dependencias (ahora usando pnpm-lock.yaml)
COPY package.json pnpm-lock.yaml ./

# 3. Instalamos las dependencias usando pnpm
RUN pnpm install --frozen-lockfile

# 4. Copiamos el resto del código del proyecto
COPY . .

# 5. Generamos el cliente de Prisma para conectarnos a la BD
RUN pnpm dlx prisma generate

# 6. Construimos la aplicación de Next.js para producción
RUN pnpm run build

# 7. Le decimos a Docker que nuestra app usa el puerto 3000
EXPOSE 3000

# 8. Comando final para iniciar el servidor web con pnpm
CMD ["pnpm", "start"]
