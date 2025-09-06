FROM  node:24 AS builder

# Create app directory
WORKDIR /app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
COPY prisma ./prisma/

# Install app dependencies
RUN npm i -g pnpm
RUN pnpm install

RUN pnpm run prisma:generate

COPY . .

RUN pnpm run build

FROM node:lts-alpine

RUN npm i -g pnpm

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["sh", "-c", "pnpm run prisma:migrate:prod && pnpm run dev"]
