# 1) Compila el frontend
FROM node:24-alpine AS compilacion

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite fija estos valores al compilar: si cambian, hay que reconstruir la imagen
ARG VITE_USAR_MOCKS=true
ARG VITE_API_URL=http://localhost:8000/api
ENV VITE_USAR_MOCKS=$VITE_USAR_MOCKS \
    VITE_API_URL=$VITE_API_URL

RUN npm run build

# 2) Sirve los archivos ya compilados
FROM nginx:1.29-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=compilacion /app/dist /usr/share/nginx/html

EXPOSE 80