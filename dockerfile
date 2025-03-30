# Etapa 1: Construcción de la aplicación
FROM node:16-alpine as builder

# Directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias para aprovechar el cacheo
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código de la aplicación
COPY . .

# Construir la aplicación (asegúrate de que 'npm run build' genere los archivos en la carpeta 'dist')
RUN npm run build

# Etapa 2: Servir la aplicación con Nginx
FROM nginx:alpine

# Eliminar el contenido por defecto de Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copiar los archivos generados en la etapa de construcción al directorio de Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Exponer el puerto 80
EXPOSE 80

# Iniciar Nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]
