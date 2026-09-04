# ==============================================================================
# Dockerfile: Rejuve Gamification Backend API
# ==============================================================================
FROM node:20-alpine

WORKDIR /app

# Install openssl untuk Prisma engine dan curl untuk healthcheck
RUN apk add --no-cache openssl curl

# Copy file package dependencies dan konfigurasi prisma
COPY package*.json ./
COPY prisma.config.js ./
COPY prisma ./prisma/

# Install dependencies (termasuk prisma CLI untuk migrasi & generate)
RUN npm install

# Generate Prisma Client v7
RUN npx prisma generate

# Copy seluruh source code backend
COPY . .

# Buat direktori uploads lokal untuk fallback evidence MinIO
RUN mkdir -p uploads/evidence

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

# Saat container start: jalankan prisma db push otomatis lalu start server Express
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node src/server.js"]
