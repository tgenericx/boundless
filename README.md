# 📦 GraphQL API with NestJS, Prisma & MongoDB

A robust GraphQL API built using **NestJS**, **Apollo Server**, **Prisma ORM**, and **MongoDB** for managing social media-style posts. The project features a modular architecture, real-time subscriptions, and a generic base service pattern for efficient CRUD operations.

---

## 🛠 Features

* 📡 GraphQL API with `@nestjs/graphql` & `Apollo Server`
* 🔔 Real-time subscriptions with `graphql-subscriptions`
* ⚙️ Code-first development with auto-generated schema
* 🟔 MongoDB database with Prisma ORM
* ✅ Class-validator for input validation
* ♻️ Generic `BaseService` for reusable CRUD operations
* 📁 Modular structure for scalability
* 🧪 Jest testing setup
* 📄 Error handling with formatted GraphQL errors

---

## 📁 Project Structure

```
src/
├── app.module.ts           # Root application module
├── common/
│   └── base.service.ts     # Generic CRUD service
├── gql/
│   └── gql.module.ts       # GraphQL configuration
├── main.ts                 # Application entry point
├── posts/                  # Post module
│   ├── dto/                # Data transfer objects
│   ├── entities/           # GraphQL entity definitions
│   ├── posts.module.ts     # Post feature module
│   ├── posts.resolver.ts   # GraphQL resolvers
│   └── posts.service.ts    # Business logic
└── pub-sub/                # PubSub module for subscriptions
    └── pub-sub.module.ts   # PubSub configuration
```

---

## 🚀 Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/phastboy/graphql.git
cd graphql-nestjs-api
```

### 2. Set up Environment

Create a `.env` file in the root:

```env
DATABASE_URL="mongodb+srv://<user>:<password>@cluster.mongodb.net/mydb?retryWrites=true&w=majority"
PORT=3000
```

### 3. Database Setup

```bash
# Generate Prisma client & push schema to database
npm install
```

---

## 🥪 Running the App

```bash
# Development mode with hot reload
npm run dev

# Production build
npm run build && npm start
```

Access GraphQL Playground at: `http://localhost:3000/graphql`

---

## 🔍 Sample Operations

### Create Post with Subscription

```graphql
mutation {
  createPost(input: {
    textContent: "Hello World!"
  }) {
    id
    textContent
  }
}

subscription {
  postCreated {
    id
    textContent
  }
}
```

### Query Posts

```graphql
query {
  posts {
    id
    textContent
    createdAt
  }
  
  post(id: "some-id") {
    textContent
  }
}
```

### Update Post

```graphql
mutation {
  updatePost(input: {
    id: "some-id",
    textContent: "Updated content"
  }) {
    id
    textContent
  }
}
```

---

## 🧰 Development Commands

| Command                 | Description                          |
|-------------------------|--------------------------------------|
| `npm run dev`           | Run in dev mode with file watching   |
| `npm run lint`          | Run ESLint with auto-fix             |
| `npm run test`          | Run unit tests                       |
| `npm run prisma:studio` | Open Prisma Studio for data browsing |
| `npm run migrate:dev`   | Create and apply database migration  |

---

## 🛠 Technical Highlights

- **Generic Base Service**: The `BaseService` provides reusable CRUD operations that can be extended by specific entity services.
- **Real-time Updates**: GraphQL subscriptions notify clients when new posts are created.
- **Error Handling**: Custom error formatting for consistent API responses.
- **Validation**: Input validation using `class-validator` decorators.

---

## Planned Features

- [ ] User authentication & authorization
- [ ] Pagination for posts
- [ ] File upload support
- [ ] Advanced filtering and sorting

---

## 📚 Documentation

- Auto-generated GraphQL schema: `src/@generated/schema.gql`
- Prisma-generated types: `src/@generated`

---

## 🐳 Docker Deployment

```bash
docker build -t graphql .
docker run -p 3000:3000 --env-file .env graphql
```

---

## Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [GraphQL Subscriptions](https://www.apollographql.com/docs/graphql-subscriptions/)

---

## 📄 License

UNLICENSED

---
