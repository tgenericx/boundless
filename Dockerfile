FROM node:24 AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm i -g pnpm && pnpm install && pnpm run prisma:generate

COPY . .

RUN pnpm run build

# ---- Production image ----
FROM node:lts-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

RUN npm i -g pnpm && pnpm run prisma:migrate:prod

EXPOSE 3000

CMD ["pnpm", "run", "start:prod"]
