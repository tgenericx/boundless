# ---- Base Build Stage ----
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY prisma ./prisma
RUN pnpm run prisma:generate

COPY tsconfig*.json ./
COPY src ./src

RUN pnpm run build

# ---- Runtime Stage ----
FROM node:22-alpine AS runner
WORKDIR /app

RUN npm install -g pnpm

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/generated ./generated

RUN pnpm install --prod --frozen-lockfile
RUN pnpm prune --prod

EXPOSE 3000
CMD ["pnpm", "run", "start:prod"]
