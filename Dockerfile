# Builder Stage
FROM node:lts-alpine AS builder
WORKDIR /app

# Install pnpm globally
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install only what's needed to install dependencies
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/
RUN pnpm install --frozen-lockfile

# Copy the rest of the app and build
COPY . .
RUN pnpm run build

# Production Stage
FROM node:lts-alpine
WORKDIR /app
ENV NODE_ENV=production

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy app files and install production deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["pnpm", "run", "start:prod"]
