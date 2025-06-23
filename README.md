# 📦 GraphQL API with NestJS, Prisma & MongoDB

A robust GraphQL API built with **NestJS**, **Apollo Server**, **Prisma ORM**, and **MongoDB**, tailored for managing social media-style posts with media uploads. The project includes a modular structure, real-time GraphQL subscriptions, media upload via Cloudinary, and REST support with Swagger docs.

---

## 🛠 Features

- 📡 GraphQL API with `@nestjs/graphql` & Apollo Server
- 🔔 Real-time subscriptions using `graphql-subscriptions`
- ⚙️ Code-first GraphQL schema generation
- 🟢 MongoDB with Prisma ORM
- ✅ Input validation via `class-validator`
- 📁 Modular and scalable architecture
- 🧾 Error formatting for cleaner GraphQL responses
- ☁️ Cloudinary integration for media handling
- 🖼️ Image & video optimization
- 📊 Swagger documentation for REST endpoints
- 🔄 Cursor-based pagination for posts

---

## 🚀 Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/phastboy/graphql.git
cd graphql
```

---

### 2. Set up Environment

Create a `.env` file in the root:

```env
DATABASE_URL="mongodb+srv://<user>:<password>@cluster.mongodb.net/mydb?retryWrites=true&w=majority"
PORT=3000

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Media Limits (optional)
MAX_FILE_SIZE=10485760 # 10MB
MAX_FILES=10
```

### 3. Database Setup

```bash
# Generate Prisma client & push schema to database
pnpm install
```

---

## 🥪 Running the App

```bash
# Dev mode
pnpm dev

# Production mode
pnpm build && pnpm start:prod
```

Access GraphQL Playground at: `http://localhost:3000/graphql`

---

## 🔍 Sample Operations

### Create Post with Subscription

```graphql
mutation {
  createPost(input: { textContent: "Hello World!" }) {
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
  posts(take: 10) {
    data {
      id
      textContent
      createdAt
    }
    nextCursor
  }
}
```

### Upload Media (REST)

```curl
curl -X POST \
  -H "Content-Type: multipart/form-data" \
  -F "files=@photo.jpg" \
  -F "files=@video.mp4" \
  http://localhost:3000/media/upload
```

---

## 🧰 Development Commands

| Command                  | Description                          |
| ------------------------ | ------------------------------------ |
| `pnpm run dev`           | Run in dev mode with file watching   |
| `pnpm run lint`          | Run ESLint with auto-fix             |
| `pnpm run test`          | Run unit tests                       |
| `pnpm run prisma:studio` | Open Prisma Studio for data browsing |

---

🛠 Technical Highlights

- Cloudinary Integration: For efficient media storage & delivery
- REST Upload Endpoint: With size/type validation
- Real-time GraphQL: Subscriptions push new post updates instantly
- Robust Validation: Including custom validators
- Cursor Pagination: For optimal post loading
- API Documentation: Accessible Swagger UI for REST

---

📚 Documentation

- Auto-generated GraphQL schema: `src/@generated/schema.gql`
- Prisma-generated types: `src/@generated`
- REST API Docs: `http://localhost:3000/api/docs`

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
