# 🛡️ Auth Service

The **Auth Service** is responsible for authentication and user creation in the Boundless platform. It supports both REST and GraphQL, communicates via RabbitMQ, and integrates with Prisma and JWT for secure credential management.

---

## 📦 Features

- 🔐 User creation with password hashing (`argon2`)
    
- 📨 RPC-based communication via RabbitMQ
    
- 🧠 Custom exception handling (RPC → GraphQL/REST)
    
- 📊 Health checks for DB, RMQ, disk usage
    
- ⚙️ Prisma + Accelerate extension
    
- 📄 REST + GraphQL ready
    

---

## ✨ Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Run the Service

```bash
nx serve auth
```

or with Docker:

```bash
nx run auth:docker-build
```

---

## ⚙️ Environment Variables

|Name|Default|Description|
|---|---|---|
|`PORT`|`3001`|HTTP server port|
|`NODE_ENV`|`development`|Environment mode|
|`RABBITMQ_URL`|`amqps://guest:guest@localhost:5672`|RabbitMQ broker URL|
|`AUTH_QUEUE`|`auth_queue`|RabbitMQ queue name|
|`JWT_SECRET`|`super-secret-key`|JWT secret key|
|`HEALTH_CHECK_TIMEOUT`|`2000`|Timeout (ms) for health checks|

---

## 🥪 Health Check

```http
GET /api/health
```

Returns the status of:

- ✅ Disk usage
    
- ✅ Prisma DB connection
    
- ✅ RabbitMQ microservice
    

---

## 🧬 Architecture Overview

``` mermaid
graph TD
  subgraph API Gateway
    GQL[GraphQL Resolver]
    REST[REST Controller]
  end

  subgraph Auth Service
    APPC[App Controller]
    APPS[App Service]
    HEALTH[Health Module]
    Prisma[(PrismaService)]
  end

  subgraph Infrastructure
    DB[(PostgreSQL)]
    RMQ[(RabbitMQ)]
  end

  GQL -->|createUser| APPC
  REST -->|POST /users| APPC
  APPC --> APPS
  APPS --> Prisma
  Prisma --> DB
  HEALTH --> DB
  HEALTH --> RMQ
  APPC -->|MessagePattern: create_user| RMQ
  GQL -->|Handles RpcException| GQL
```

---

## 📚 Docs

- Health check module: `apps/auth/src/app/health`
    
- Exception filter utilities: `libs/prisma-service/src/lib/`
    
- Prisma schema + generated client: `libs/prisma-service/src/lib/@generated`
    

📋 Consider placing OpenAPI specs, GraphQL schema samples, or flow diagrams in a `docs/` directory.

---

## 🤝 Contributing

We're glad to have you! To contribute:

1. Clone the repo
    
2. Create a new branch
    
3. Push and PR
    

_Note: This service uses [Nx](https://nx.dev/) and `pnpm`._

---

## 🧠 Future Enhancements

-  Add login & JWT refresh flow
    
-  OTP or 2FA integration
    
-  OAuth2 support
    
-  Rate-limiting + audit logs
    

---

## 📢 Maintainer

**Boundless Team** — drop a message or raise an issue for help!

---
