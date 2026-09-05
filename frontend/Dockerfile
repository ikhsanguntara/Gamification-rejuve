# ==============================================================================
# Dockerfile: Rejuve Gamification Frontend (Nuxt 3 SPA via Nginx)
# ==============================================================================

# Stage 1: Build static assets
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifests
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Set API Base URL argument during build
ARG NUXT_PUBLIC_API_BASE=http://103.168.147.133:3005/api
ENV NUXT_PUBLIC_API_BASE=${NUXT_PUBLIC_API_BASE}
ENV NUXT_PUBLIC_APP_ENV=production

# Generate static SPA output
RUN npm run generate

# Stage 2: Production web server (Nginx Alpine)
FROM nginx:alpine

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy built static files
COPY --from=builder /app/.output/public /usr/share/nginx/html

# Copy custom nginx configuration for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
