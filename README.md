# Boundless

A comprehensive GraphQL-powered platform for event management, venue booking, and social engagement with integrated marketplace features.

## Overview

Boundless is a full-stack NestJS application that combines event management, social networking, and e-commerce functionality. Built with modern technologies and best practices, it provides a scalable foundation for event-driven communities with real-time updates, intelligent feed distribution, and secure authentication.

## Key Features

### 🎯 Event Management

- **Event Creation & Management** - Create, update, and manage events with detailed information
- **Venue Integration** - Board-based venue system for organizing events by location
- **Draft Events** - Privacy controls with creator-only draft visibility
- **Event Discovery** - Advanced filtering and search capabilities
- **Organizer Permissions** - Role-based access control for event management

### 🏢 Marketplace & Business

- **Business Profiles** - Comprehensive business management with verification
- **Product Listings** - Create and manage marketplace listings with media support
- **Inventory Management** - Track stock levels with flexible unit support
- **Category System** - Hierarchical categorization for better organization

### 👥 Social Features

- **User Profiles** - Rich user profiles with bio, avatar, and campus information
- **Follow System** - Follow users and subscribe to boards for personalized content
- **Post Threading** - Nested replies and discussions on posts
- **Real-time Feed** - Intelligent feed distribution with Redis-backed caching
- **Social Engagement** - Like, comment, and interact with content

### 🔐 Authentication & Security

- **JWT Authentication** - RSA-256 signed tokens with secure key management
- **Refresh Token Rotation** - Automatic token rotation with revocation support
- **Email Verification** - Account verification with secure token system
- **Role-based Authorization** - Granular permissions (USER, ADMIN, SUPERADMIN)
- **Multi-factor Login** - Support for email, username, or phone authentication
- **Owner Guards** - Advanced resource ownership verification with nested chains

### 📡 Real-time Features

- **GraphQL Subscriptions** - Live updates for posts, events, boards, and more
- **Redis PubSub** - Scalable real-time messaging with Redis backend
- **WebSocket Support** - Persistent connections for instant updates

### 📊 Feed System

- **Intelligent Distribution** - Fan-out on write architecture with Redis
- **BullMQ Job Queues** - Async processing for feed delivery
- **Feed Repair Service** - Automated recovery for failed deliveries
- **Cursor Pagination** - Efficient bidirectional pagination
- **Cache Warming** - Automatic cache population with TTL management
- **Batch Processing** - Micro-batching for optimized Redis operations

### 📸 Media Management

- **Cloudinary Integration** - Secure cloud-based media storage
- **File Upload API** - REST endpoint with validation (10 files, 10MB each)
- **Media Relations** - Flexible attachment system for posts, listings, and inventory
- **Automatic Cleanup** - Media deletion on resource removal

### 🎓 Campus Features

- **Faculty Management** - Organize by academic faculties
- **Department System** - Hierarchical department structure
- **Campus Profiles** - Link users to their academic departments

## Tech Stack

### Backend

- **NestJS** - Progressive Node.js framework
- **GraphQL** - API with Apollo Server v5
- **Prisma** - Type-safe ORM with PostgreSQL
- **Redis** - Caching, PubSub, and job queues
- **BullMQ** - Distributed job queue system

### Authentication

- **JWT** - JSON Web Tokens with RS256 algorithm
- **Passport** - Authentication middleware
- **Argon2** - Secure password hashing

### Real-time

- **GraphQL Subscriptions** - Live data updates
- **graphql-redis-subscriptions** - Scalable subscriptions
- **graphql-ws** - WebSocket protocol

### DevOps

- **Docker** - Containerization with multi-stage builds
- **GitHub Actions** - CI/CD with automated builds and deployments
- **Swagger** - OpenAPI documentation

### Utilities

- **@paljs/plugins** - GraphQL field selection optimization
- **Cloudinary** - Media storage and transformation
- **Nodemailer** - Email service integration
- **class-validator** - Input validation

## Architecture

### Database Schema Highlights

```prisma
- User (authentication, profiles, roles)
- Post (social posts with threading)
- Event (event management with organizers)
- Venue (venue system)
- Business (marketplace vendor profiles)
- Listing (marketplace products)
- Inventory (stock management)
- Media (centralized media storage)
- Category (hierarchical categorization)
- Faculty/Department (campus organization)
- UserFollow (social graph)
- RefreshToken (secure token management)
- FeedDelivery (delivery tracking with retry)
```

### Key Design Patterns

**Fan-out on Write**

- Posts are distributed to follower feeds asynchronously
- Redis sorted sets maintain chronological order
- BullMQ handles background processing with retry logic

**Authorization Layers**

- Abstract owner guards with inheritance
- Dynamic guard generation for nested resources
- Role-based bypasses for admin operations

**Optimistic Caching**

- Redis cache with DB fallback
- Cache warming on miss
- Configurable TTL per resource type

**Error Handling**

- Standardized transport response format
- Type-safe error propagation across layers
- Comprehensive logging with structured output

## Getting Started

### Prerequisites

```bash
- Node.js 22+
- pnpm 9+
- PostgreSQL
- Redis
- Cloudinary account (for media uploads)
```

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/tgenericx/boundless.git
cd boundless
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Set up environment variables**

```bash
cp .env.example .env
# Configure your database, Redis, and Cloudinary credentials
```

4. **Generate Prisma client and run migrations**

```bash
pnpm prisma:generate
pnpm prisma:migrate:dev
```

5. **Generate JWT keys**

```bash
pnpm generate:keys
```

### Running the Application

**Development**

```bash
pnpm start:dev
```

**Production**

```bash
pnpm build
pnpm start:prod
```

The GraphQL playground will be available at `http://localhost:3000/api/graphql`

### Docker Deployment

```bash
docker build -t boundless .
docker run -p 3000:3000 boundless
```

## API Documentation

- **GraphQL Playground**: `/api/graphql`
- **Swagger Documentation**: `/api/docs`

## Key Modules

### Authentication

- JWT with RSA-256 signing
- Refresh token rotation
- Email verification
- Multi-identifier login (email/username/phone)

### Feed System

- Redis-backed timeline
- Async fan-out with BullMQ
- Delivery tracking and repair
- Cursor-based pagination

### Authorization

- JWT guards for GraphQL and REST
- Owner-or-admin guards
- Role-based access control
- Nested resource authorization

### Real-time

- GraphQL subscriptions via WebSocket
- Redis PubSub for scalability
- Event-driven updates

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/boundless

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT
JWT_ACCESS_TOKEN_EXPIRATION=15m
JWT_REFRESH_TOKEN_EXPIRATION=7d

# Email
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USER=
MAIL_PASSWORD=
MAIL_FROM=noreply@boundless.app

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Application
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
APP_URL=http://localhost:3000
```

## Development

### Running Tests

```bash
pnpm test
pnpm test:e2e
pnpm test:cov
```

### Code Quality

```bash
pnpm lint
pnpm format
```

### Database Operations

```bash
# Generate Prisma client
pnpm prisma:generate

# Create migration
pnpm prisma:migrate:dev

# Deploy migrations
pnpm prisma:migrate:prod

# Open Prisma Studio
pnpm prisma:studio
```

## Performance Features

- **Field Selection**: PrismaSelect for query optimization
- **Connection Pooling**: Prisma connection management
- **Caching**: Redis-backed caching with TTL
- **Batch Processing**: Micro-batching for feed updates
- **Pagination**: Cursor-based for efficient data fetching
- **Indexing**: Strategic database indexes on foreign keys

## Security Features

- **Password Hashing**: Argon2 algorithm
- **JWT Signing**: RSA-256 asymmetric encryption
- **Token Rotation**: Automatic refresh token rotation
- **Rate Limiting**: Redis-backed throttling
- **Input Validation**: class-validator decorators
- **CORS**: Configurable origin restrictions
- **Owner Verification**: Resource-level authorization

## Contributing

Contributions are welcome! This project demonstrates:

- Modern NestJS architecture
- GraphQL best practices
- Real-time systems design
- Microservices patterns (evolved to monolith)
- Type-safe development
- Production-ready DevOps

## Contact

- GitHub: [@tgenericx](https://github.com/tgenericx)
- Project: [Boundless](https://github.com/tgenericx/boundless)

---

Built with ❤️ using NestJS, GraphQL, and modern web technologies
