# Stage 1: Build
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app

# Copy dependency files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.root.json ./
COPY packages/shared/package.json ./packages/shared/
COPY api/package.json api/tsconfig.json ./api/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/shared/ ./packages/shared/
COPY api/ ./api/

# Build shared package
RUN pnpm --filter @jsoft/shared build

# Generate Prisma client
RUN pnpm --filter @jsoft/api exec prisma generate

# Build API
RUN pnpm --filter @jsoft/api build

# Stage 2: Runtime
FROM node:20-alpine AS runner

WORKDIR /app

# Copy node_modules (needed for Prisma client and shared package)
COPY --from=builder /app/node_modules ./node_modules

# Copy built artifacts
COPY --from=builder /app/api/dist ./api/dist
COPY --from=builder /app/api/prisma ./api/prisma
COPY --from=builder /app/api/package.json ./api/

# Copy shared package
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/

# Create uploads directory
RUN mkdir -p api/uploads

EXPOSE 3000

WORKDIR /app/api

CMD ["node", "dist/index.js"]
