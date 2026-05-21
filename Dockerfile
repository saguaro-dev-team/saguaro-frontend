FROM node:22-alpine

# 1. Agregamos herramientas de sistema
RUN apk add --no-cache openssl libc6-compat python3 make g++

# 2. Habilitamos pnpm
RUN corepack enable pnpm

WORKDIR /app

# 3. Copiamos archivos de dependencias
COPY package.json pnpm-lock.yaml ./

# 4. La clave está aquí: --ignore-scripts apaga el bloqueo de seguridad
RUN pnpm install --ignore-scripts

# 5. Copiamos el resto del código
COPY . .

# 5. Generamos el cliente de Prisma para conectarnos a la BD
RUN pnpm exec prisma generate

# Pasamos la variable de entorno para que Next.js pueda prerenderizar la página
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

# 6. Construimos la aplicación de Next.js para producción
RUN pnpm run build

EXPOSE 3000

CMD ["pnpm", "start"]