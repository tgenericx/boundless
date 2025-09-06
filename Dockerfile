FROM node:24 AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm i -g pnpm
RUN pnpm install

RUN pnpm run prisma:generate

COPY . .

RUN pnpm run build

# ---- Production image ----
FROM node:lts-alpine

WORKDIR /app
RUN npm i -g pnpm

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["sh", "-c", "pnpm run prisma:migrate:prod && pnpm run start:prod"]
