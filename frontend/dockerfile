# Etapa 1: Build Angular en Node
FROM node:20 AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npx ng build frontend --configuration production

# Etapa 2: Servir con Nginx
FROM nginx:alpine

# Copiar build de Angular
COPY --from=build /app/dist/frontend /usr/share/nginx/html

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
