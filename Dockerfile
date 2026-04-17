# Этап 1: Сборка
FROM public.ecr.aws/docker/library/node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
# Локальная зависимость @vlasdobry/geo-checker — vendored как tgz.
# Копируем ДО npm ci, чтобы npm смог её найти.
COPY vendor/ ./vendor/
RUN npm ci
COPY . .
RUN npm run build

# Этап 2: Продакшен
FROM public.ecr.aws/docker/library/nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
