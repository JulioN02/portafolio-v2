# Stage 1: Build
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app

# Copy dependency files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.root.json ./
COPY packages/shared/package.json ./packages/shared/
COPY admin-panel/package.json admin-panel/tsconfig.json admin-panel/vite.config.ts admin-panel/index.html ./admin-panel/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/shared/ ./packages/shared/
COPY admin-panel/ ./admin-panel/

# Build shared package
RUN pnpm --filter @jsoft/shared build

# Build admin-panel
RUN pnpm --filter @jsoft/admin-panel build

# Stage 2: Serve with nginx
FROM nginx:alpine AS runner

# Copy built assets
COPY --from=builder /app/admin-panel/dist /usr/share/nginx/html

# Nginx config for SPA with fallback
RUN rm /etc/nginx/conf.d/default.conf
COPY admin-panel/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
