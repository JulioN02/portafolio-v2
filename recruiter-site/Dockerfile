# Stage 1: Build
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app

# Copy dependency files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.root.json ./
COPY packages/shared/package.json ./packages/shared/
COPY recruiter-site/package.json recruiter-site/tsconfig.json recruiter-site/vite.config.ts recruiter-site/index.html ./recruiter-site/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/shared/ ./packages/shared/
COPY recruiter-site/ ./recruiter-site/

# Build shared package
RUN pnpm --filter @jsoft/shared build

# Build recruiter-site
RUN pnpm --filter @jsoft/recruiter-site build

# Stage 2: Serve with nginx
FROM nginx:alpine AS runner

# Copy built assets
COPY --from=builder /app/recruiter-site/dist /usr/share/nginx/html

# Nginx config for SPA with fallback
RUN rm /etc/nginx/conf.d/default.conf
COPY recruiter-site/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
