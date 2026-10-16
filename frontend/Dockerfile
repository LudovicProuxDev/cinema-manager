# syntax=docker/dockerfile:1

# ---------- Build stage ----------
FROM node:22-alpine AS build
WORKDIR /app

# Install dependencies first to benefit from layer caching
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---------- Runtime stage ----------
FROM nginx:1.28-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
