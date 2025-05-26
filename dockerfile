# Etapa 1: Construcción de la aplicación
FROM node:22-alpine as builder

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

# Eliminar la configuración por defecto de Nginx (opcional pero recomendable para evitar conflictos)
RUN rm /etc/nginx/conf.d/default.conf

# Copiar tu archivo de configuración personalizado de Nginx
# Asegúrate de que 'nginx.conf' está en el mismo directorio que tu Dockerfile
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Eliminar el contenido por defecto de Nginx (esto ya lo tenías y está bien)
RUN rm -rf /usr/share/nginx/html/*

# Copiar los archivos generados en la etapa de construcción al directorio de Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Exponer el puerto 80 (Nginx dentro del contenedor escucha en este puerto)
EXPOSE 80

# Iniciar Nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]
