# Stage 1: Build
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app

COPY . .

RUN pnpm install --frozen-lockfile && \
    pnpm --filter @jsoft/shared build && \
    pnpm --filter @jsoft/admin-panel build

# Stage 2: Serve with nginx
FROM nginx:alpine

COPY --from=builder /app/admin-panel/dist /usr/share/nginx/html

RUN rm /etc/nginx/conf.d/default.conf
COPY admin-panel/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
