# 阶段 1: 基础镜像
FROM node:20-alpine AS base
RUN npm install -g pnpm@10

# 阶段 2: 依赖安装
FROM base AS deps
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/server/package.json ./apps/server/
COPY apps/server/prisma ./apps/server/prisma

RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --filter @minimax-speed-test/server

# 阶段 3: 构建
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/server/node_modules ./apps/server/node_modules

# Prisma 7: generate 需要临时 .env
COPY apps/server/prisma ./apps/server/prisma
COPY apps/server/prisma.config.ts ./apps/server/
COPY apps/server/package.json ./apps/server/
RUN echo "DATABASE_URL=mysql://build:build@localhost:3306/build" > apps/server/.env && \
    cd apps/server && pnpm prisma generate && \
    rm .env

# 复制源码并构建
COPY apps/server/src ./apps/server/src
COPY apps/server/tsconfig.json ./apps/server/
COPY apps/server/tsup.config.ts ./apps/server/
RUN cd apps/server && pnpm build

# 阶段 4: 运行
FROM node:20-alpine AS runner
RUN npm install -g pnpm@10
WORKDIR /app/apps/server

ENV NODE_ENV=production

# 复制构建产物
COPY --from=builder /app/apps/server/dist ./dist
COPY --from=builder /app/apps/server/prisma ./prisma
COPY --from=builder /app/apps/server/src/generated ./src/generated
COPY --from=deps /app/apps/server/node_modules ./node_modules
COPY --from=deps /app/node_modules /app/node_modules

# Prisma 7 运行时需要 prisma.config.ts
COPY apps/server/prisma.config.ts ./
COPY apps/server/package.json ./

# 启动脚本
COPY apps/server/docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

EXPOSE 8010
CMD ["./docker-entrypoint.sh"]
