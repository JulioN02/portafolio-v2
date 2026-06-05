# Build & Runtime — Express API with Prisma
FROM node:20-alpine

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app

COPY . .

RUN pnpm install --frozen-lockfile && \
    pnpm --filter @jsoft/shared build && \
    cd api && pnpm exec prisma generate && \
    pnpm --filter @jsoft/api build

RUN mkdir -p api/uploads

EXPOSE 3000

WORKDIR /app/api

CMD ["node", "dist/index.js"]
