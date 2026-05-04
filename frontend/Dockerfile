# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build -- --configuration production

# Serve stage
FROM nginx:alpine AS final
COPY --from=build /app/dist/tancura-ui/browser /usr/share/nginx/html
COPY nginx-spa.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=10s CMD wget -qO- http://localhost/ || exit 1
