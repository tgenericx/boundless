# 🧱 @boundless/db-prisma

A modular Prisma integration library for the Boundless monorepo.
This package wraps the Prisma ORM with NestJS lifecycle support, clean service injection, and schema modularization via prebuild merging.

---

## 📦 What This Library Does

- ✅ Provides a `PrismaService` class for clean database access in NestJS
- 🧩 Supports Prisma Accelerate extension
- 🧾 Organizes Prisma schema into modular `.prisma` files
- 🔄 Generates the final `schema.prisma` via prebuild script
- 🎯 Exposes Prisma Client with fully typed access

---

## 🧪 Features

### 🔧 `PrismaService`

Injectable Prisma client with NestJS lifecycle hooks:

---

## 🛠️ Usage

### 🧩 Importing into a NestJS module:

```ts
import { PrismaService } from '@boundless/db-prisma';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class SomeAppModule {}
```

### 🧾 Accessing Prisma Types

```ts
import { Prisma } from '@boundless/db-prisma';

const where: Prisma.UserWhereInput = { email: 'admin@boundless.dev' };
```

---

## 🧬 Schema Composition

All Prisma models are split into individual files under `prisma/*.prisma`.
Run a prebuild script to merge them into `schema.prisma`.

---

## 🚀 Nx Commands

```bash
# Merge schema and generate Prisma client
nx generate db-prisma

# Apply database migrations
nx migrate db-prisma

# Launch Prisma Studio
nx studio db-prisma
```

---
