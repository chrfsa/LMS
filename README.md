# Vibeenengineer LMS (Learning Management System)

> A modern, scalable Learning Management System built with React, Node.js, TypeScript, and PostgreSQL.

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Database Schema](#-database-schema)
- [API Documentation](#-api-documentation)
- [Frontend Structure](#-frontend-structure)
- [Environment Variables](#-environment-variables)
- [Development](#-development)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

---

## 🎯 Overview

Vibeenengineer LMS is a mini learning platform featuring:
- ✅ **User Authentication** with JWT
- ✅ **Progressive Course Structure** with gated modules
- ✅ **Video Integration** (YouTube embeds)
- ✅ **Interactive Quizzes** with validation
- ✅ **Progress Tracking** stored in PostgreSQL
- ✅ **Certificate Generation** (PDF download)
- ✅ **Responsive Design** optimized for mobile and desktop
- ✅ **Real-time Logs** for debugging ([AUTH], [PROGRESS], [QUIZ], [NAV], [DB])

---

## ✨ Features

### Authentication System
- **Registration**: Email validation + password strength (min 5 chars)
- **Login**: JWT-based session management
- **Password Security**: bcrypt hashing (10 rounds)
- **Token Storage**: localStorage + memory state

### Course Management
- **Dynamic Courses**: Stored in database, not hardcoded
- **Progressive Unlocking**: Complete Module 1 → Unlock Module 2 → Unlock Module 3
- **Video Learning**: Embedded YouTube videos
- **Quiz Validation**: 3/3 correct answers required to pass

### Progress Tracking
- **Real-time Progress**: Updates after each quiz
- **Module Status**: "In Progress" or "Done"
- **Quiz Scores**: Stored per module
- **Reset Capability**: Restart progress anytime

### Certification
- **PDF Certificate**: Automatically generated upon course completion
- **Personalized**: Includes user email and completion date
- **Professional Design**: Branded Vibeenengineer certificate

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js 20** | Runtime environment |
| **Express** | Web framework |
| **TypeScript** | Type safety |
| **Prisma** | ORM for database |
| **PostgreSQL 16** | Database |
| **JWT** | Authentication |
| **bcryptjs** | Password hashing |
| **Zod** | Schema validation |
| **PDFKit** | Certificate generation |

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework |
| **Vite** | Build tool |
| **TypeScript** | Type safety |
| **React Router v6** | Routing |
| **Tailwind CSS** | Styling |
| **Axios** | HTTP client |

### DevOps
| Technology | Purpose |
|------------|---------|
| **Docker** | Containerization |
| **Docker Compose** | Orchestration |
| **PostgreSQL** | Database persistence |

---

## 🏗️ Architecture

### Monorepo Structure
```
LMS/
├── api/                      # Backend (Express + TypeScript)
│   ├── src/
│   │   ├── routes/           # API endpoints
│   │   │   ├── auth.ts       # Authentication routes
│   │   │   ├── progress.ts   # Progress tracking
│   │   │   ├── quiz.ts       # Quiz management
│   │   │   ├── certificate.ts # PDF generation
│   │   │   └── modules.ts    # Module metadata
│   │   ├── middleware/
│   │   │   └── auth.ts       # JWT middleware
│   │   ├── prisma.ts         # Prisma client
│   │   ├── validation.ts     # Zod schemas
│   │   └── index.ts          # Express app
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   ├── seed.ts           # Database seeding
│   │   └── migrations/       # Migration history
│   ├── Dockerfile
│   └── package.json
│
├── web/                      # Frontend (React + Vite)
│   ├── src/
│   │   ├── routes/           # Page components
│   │   │   ├── Login.tsx     # Auth page
│   │   │   ├── Dashboard.tsx # Course overview
│   │   │   ├── Module.tsx    # Module detail
│   │   │   └── Final.tsx     # Certification page
│   │   ├── components/       # Reusable components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── state/            # State management
│   │   ├── api.ts            # Axios instance
│   │   └── types.ts          # TypeScript types
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml        # Service orchestration
└── README.md                 # This file
```

### Service Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Compose                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────┐      ┌──────────┐      ┌──────────┐    │
│  │   web    │─────▶│   api    │─────▶│    db    │    │
│  │          │      │          │      │          │    │
│  │ Vite     │      │ Express  │      │ Postgres │    │
│  │ :5173    │      │ :4000    │      │ :5432    │    │
│  └──────────┘      └──────────┘      └──────────┘    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites
- **Docker** (v20.10+)
- **Docker Compose** (v2.0+)
- **Git**

### Installation

#### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd LMS
```

#### 2. Launch All Services
```bash
# Start all containers (web, api, db)
docker compose up -d --build

# Check logs
docker compose logs -f

# Check status
docker compose ps
```

#### 3. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000/health
- **Prisma Studio**: http://localhost:5555 (if running)
- **Database**: `postgres://app:app@localhost:5433/vibeen`

#### 4. Create Your First Account
1. Navigate to http://localhost:5173
2. Click "Créer un compte" (Create Account)
3. Enter email and password (min 5 chars)
4. You're ready to start learning! 🎓

### Stopping Services
```bash
# Stop all containers
docker compose down

# Stop and remove volumes (reset database)
docker compose down -v
```

---

## 📊 Database Schema

### Entity-Relationship Diagram

```
┌─────────────┐         ┌──────────────┐
│   Course    │────────▶│   Module     │
│             │  1:N    │              │
│ id          │         │ id           │
│ name        │         │ courseId     │
│ slug        │         │ order        │
└─────────────┘         │ title        │
                        │ youtubeId    │
                        └──────┬───────┘
                               │ 1:N
                               ▼
                        ┌──────────────┐
                        │   Question   │
                        │              │
                        │ id           │
                        │ moduleId     │
                        │ order        │
                        │ text         │
                        └──────┬───────┘
                               │ 1:N
                               ▼
                        ┌──────────────┐
                        │    Option    │
                        │              │
                        │ id           │
                        │ questionId   │
                        │ text         │
                        │ isCorrect    │
                        └──────────────┘

┌─────────────┐         ┌──────────────┐
│    User     │────────▶│   Progress   │
│             │  1:N    │              │
│ id          │         │ userId       │
│ email       │         │ moduleId     │
│ password    │         │ status       │
└─────────────┘         │ validated    │
                        │ quizScore    │
                        └──────────────┘
```

### Prisma Schema

```prisma
model User {
  id        Int        @id @default(autoincrement())
  email     String     @unique
  password  String     // bcrypt hashed
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
  progress  Progress[]
}

model Course {
  id          Int      @id @default(autoincrement())
  name        String
  description String?
  slug        String   @unique
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  modules     Module[]
}

model Module {
  id          Int        @id @default(autoincrement())
  courseId    Int
  order       Int
  title       String
  youtubeId   String
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  
  course      Course     @relation(fields: [courseId], references: [id])
  questions   Question[]
  progress    Progress[]
  
  @@unique([courseId, order])
}

model Question {
  id          Int      @id @default(autoincrement())
  moduleId    Int
  order       Int
  text        String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  module      Module   @relation(fields: [moduleId], references: [id])
  options     Option[]
  
  @@unique([moduleId, order])
}

model Option {
  id          Int      @id @default(autoincrement())
  questionId  Int
  order       Int
  text        String
  isCorrect   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  question    Question @relation(fields: [questionId], references: [id])
}

model Progress {
  id        Int            @id @default(autoincrement())
  userId    Int
  moduleId  Int
  status    ProgressStatus @default(in_progress)
  quizScore Int?
  validated Boolean        @default(false)
  createdAt DateTime       @default(now())
  updatedAt DateTime       @updatedAt

  user   User   @relation(fields: [userId], references: [id])
  module Module @relation(fields: [moduleId], references: [id])

  @@unique([userId, moduleId])
}

enum ProgressStatus {
  in_progress
  done
}
```

### Database Seeding

The database is automatically seeded with the **Cursor course** when you run migrations:

```bash
# Reset database and run seed
docker compose exec api npx prisma migrate reset --force

# Or manually run seed
docker compose exec api npm run prisma:seed
```

**Seeded Data:**
- ✅ 1 Course: "Parcours Cursor"
- ✅ 3 Modules: Introduction, LLM Hallucinations, Tools
- ✅ 9 Questions (3 per module)
- ✅ 27 Options (3 per question)

---

## 📡 API Documentation

### Base URL
```
http://localhost:4000
```

### Authentication Endpoints

#### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "12345"
}
```

**Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "12345"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": 1,
  "email": "user@example.com"
}
```

### Progress Endpoints

#### Get Progress
```http
GET /progress
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "moduleId": 1,
    "status": "done",
    "validated": true,
    "quizScore": 3,
    "unlocked": true
  },
  {
    "moduleId": 2,
    "status": "in_progress",
    "validated": false,
    "quizScore": null,
    "unlocked": true
  },
  {
    "moduleId": 3,
    "status": "in_progress",
    "validated": false,
    "quizScore": null,
    "unlocked": false
  }
]
```

#### Reset Progress
```http
POST /progress/reset
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Progress reset successfully"
}
```

### Quiz Endpoints

#### Get Quiz Questions
```http
GET /quiz/:moduleId
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "question": "What is Cursor?",
    "options": [
      "A simple text editor",
      "An AI-powered IDE",
      "An advanced terminal"
    ]
  },
  ...
]
```

#### Submit Quiz Answers
```http
POST /quiz/:moduleId/submit
Authorization: Bearer <token>
Content-Type: application/json

{
  "answers": [1, 1, 1]  // Index of selected option for each question
}
```

**Response (200):**
```json
{
  "score": 3,
  "validated": true,
  "total": 3
}
```

### Module Endpoints

#### Get All Modules
```http
GET /modules
```

**Response (200):**
```json
[
  {
    "id": 1,
    "order": 1,
    "title": "Module 1 — Introduction à Cursor",
    "youtubeId": "IccjZDV93lw"
  },
  ...
]
```

#### Get Single Module
```http
GET /modules/:id
```

**Response (200):**
```json
{
  "id": 1,
  "order": 1,
  "title": "Module 1 — Introduction à Cursor",
  "youtubeId": "IccjZDV93lw"
}
```

### Certificate Endpoint

#### Download Certificate
```http
GET /certificate
Authorization: Bearer <token>
```

**Response (200):**
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename=Vibenengineer_Certificate_<email>.pdf`

---

## 🎨 Frontend Structure

### State Management

**Authentication State** (`web/src/state/auth.ts`):
- In-memory state + localStorage persistence
- JWT token management
- Auto-restore session on reload

**Hooks** (`web/src/hooks/`):
- `useModules()`: Fetch all modules
- `useModule(id)`: Fetch single module

### Routing

```tsx
<Routes>
  <Route path="/login" element={<Login />} />
  <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
  <Route path="/module/:id" element={<ProtectedRoute><Module /></ProtectedRoute>} />
  <Route path="/final" element={<ProtectedRoute><Final /></ProtectedRoute>} />
</Routes>
```

### Components

**Reusable Components:**
- `Button`: Primary/secondary variants
- `Input`: Form inputs with labels
- `Card`: Container with borders
- `Header`: App header with logout
- `YouTubeEmbed`: Responsive video player
- `Quiz`: Interactive quiz component
- `ProtectedRoute`: Authentication guard

### Styling

**Tailwind Theme:**
- Background: `#0a0e1a`
- Accent (Cyan): `#00d9ff`
- Purple: `#a855f7`
- Cards: `#1a1f2e`

**Responsive Breakpoints:**
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

---

## 🔐 Environment Variables

### Docker Compose (Primary Configuration)

All environment variables are **defined directly in `docker-compose.yml`**:

```yaml
services:
  db:
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: app
      POSTGRES_DB: vibeen
    ports:
      - "5433:5432"  # Host:Container

  api:
    environment:
      NODE_ENV: development
      PORT: 4000
      DATABASE_URL: postgres://app:app@db:5432/vibeen
      JWT_SECRET: change-me  # ⚠️ Change in production!

  web:
    environment:
      NODE_ENV: development
      VITE_API_URL: http://localhost:4000
```

### Local Development (Optional)

If you want to run services **outside Docker**, create `.env` files:

**`api/.env`:**
```env
DATABASE_URL=postgres://app:app@localhost:5433/vibeen
JWT_SECRET=change-me
PORT=4000
```

**`web/.env`:**
```env
VITE_API_URL=http://localhost:4000
```

⚠️ **Note:** These `.env` files are **NOT used by Docker Compose**. They're only for local development outside containers.

---

## 💻 Development

### Running Without Docker (Local Development)

#### Backend
```bash
cd api
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

#### Frontend
```bash
cd web
npm install
npm run dev
```

### Database Management

#### Prisma Studio (Visual DB Browser)
```bash
# Inside container
docker compose exec api npx prisma studio

# Access at http://localhost:5555
```

#### Create New Migration
```bash
# After editing schema.prisma
docker compose exec api npx prisma migrate dev --name <migration_name>
```

#### Reset Database
```bash
# ⚠️ This will DELETE all data!
docker compose exec api npx prisma migrate reset --force
```

#### Seed Database
```bash
docker compose exec api npm run prisma:seed
```

### Viewing Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f api
docker compose logs -f web
docker compose logs -f db

# Last 50 lines
docker compose logs --tail 50 api
```

### Hot Reload

Both `api` and `web` services support **hot reload** in development:
- **API**: Uses `tsx watch` to restart on file changes
- **Web**: Uses Vite HMR for instant updates
- **Volumes**: Code is mounted from host → changes reflect immediately

---

## 🚢 Deployment

### Production Checklist

- [ ] Change `JWT_SECRET` to a strong random value
- [ ] Update `DATABASE_URL` with production credentials
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS origins
- [ ] Set up database backups
- [ ] Configure logging (Winston/Pino)
- [ ] Set up monitoring (Sentry, DataDog)
- [ ] Use environment secrets (AWS Secrets Manager, etc.)

### Docker Production Build

```bash
# Build production images
docker compose -f docker-compose.prod.yml build

# Run in production mode
docker compose -f docker-compose.prod.yml up -d
```

### Environment Variables (Production)

```yaml
api:
  environment:
    NODE_ENV: production
    DATABASE_URL: ${DATABASE_URL}  # From secrets
    JWT_SECRET: ${JWT_SECRET}      # From secrets
    
web:
  environment:
    NODE_ENV: production
    VITE_API_URL: https://api.yourdomain.com
```

---

## 🧪 Testing

### Manual API Testing

#### Health Check
```bash
curl http://localhost:4000/health
# Expected: {"ok":true}
```

#### Complete Flow
```bash
# 1. Register
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"12345"}'

# Save the token from response
TOKEN="eyJhbGc..."

# 2. Get Progress
curl http://localhost:4000/progress \
  -H "Authorization: Bearer $TOKEN"

# 3. Get Quiz
curl http://localhost:4000/quiz/1 \
  -H "Authorization: Bearer $TOKEN"

# 4. Submit Quiz (correct answers: index 1 for all)
curl -X POST http://localhost:4000/quiz/1/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"answers":[1,1,1]}'

# 5. Download Certificate (after completing all modules)
curl http://localhost:4000/certificate \
  -H "Authorization: Bearer $TOKEN" \
  --output certificate.pdf
```

---

## 📚 Course Content

### Module 1: Introduction à Cursor
**Video:** `IccjZDV93lw`

**Quiz:**
1. What is Cursor?
   - A simple text editor
   - ✅ An AI-powered IDE for development
   - An advanced terminal

2. What is Cursor's main advantage?
   - It's free
   - ✅ It integrates AI models to assist development
   - It uses less RAM

3. Cursor is based on which code editor?
   - Sublime Text
   - ✅ Visual Studio Code (VS Code)
   - Atom

### Module 2: Hallucinations des LLM dans Cursor
**Video:** `IccjZDV93lw`

**Quiz:**
1. What is an LLM hallucination in Cursor?
   - A visual bug in the interface
   - ✅ When the AI generates incorrect code or invents information
   - A network connection problem

2. How to reduce hallucinations in Cursor?
   - Disable AI completely
   - ✅ Provide clear context and verify AI suggestions
   - Only use offline mode

3. What to do if Cursor generates erroneous code?
   - Use it anyway without checking
   - ✅ Verify, correct, and provide feedback to improve context
   - Restart the computer

### Module 3: Les Tools dans Cursor
**Video:** `byR5YVesMeg`

**Quiz:**
1. What are "tools" in Cursor?
   - Only visual extensions
   - ✅ AI features that can read/edit files and execute commands
   - Custom keyboard shortcuts

2. What is the advantage of tools in Cursor?
   - They make the interface prettier
   - ✅ They allow AI to interact with the project autonomously
   - They only speed up compilation

3. What can a tool do in Cursor?
   - Only display text
   - ✅ Read files, execute commands, modify code
   - Only change theme colors

---

## 🎓 Learning Flow

```
1. Registration/Login
   ↓
2. Dashboard (Course Overview)
   ↓
3. Module 1 (Unlocked)
   → Watch Video
   → Take Quiz (3/3 required)
   → ✅ Module 1 Validated
   ↓
4. Module 2 (Now Unlocked)
   → Watch Video
   → Take Quiz (3/3 required)
   → ✅ Module 2 Validated
   ↓
5. Module 3 (Now Unlocked)
   → Watch Video
   → Take Quiz (3/3 required)
   → ✅ Module 3 Validated
   ↓
6. Final Screen
   → 🎉 Certificate Available
   → Download PDF
   → Option to Reset Progress
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Check what's using port 4000
lsof -i :4000

# Kill the process
kill -9 <PID>

# Or change port in docker-compose.yml
```

### Database Connection Error
```bash
# Check if db container is healthy
docker compose ps

# Restart db container
docker compose restart db

# Check logs
docker compose logs db
```

### Prisma Client Not Generated
```bash
# Regenerate Prisma Client
docker compose exec api npx prisma generate

# Restart API
docker compose restart api
```

### CORS Errors
- Ensure `VITE_API_URL` is set correctly
- Check API CORS configuration in `api/src/index.ts`
- Verify frontend is accessing correct API URL

### Module Not Loading
- Check browser console for errors
- Verify JWT token is valid (not expired)
- Check API logs: `docker compose logs api`
- Ensure database is seeded: `docker compose exec api npm run prisma:seed`

---

## 🤝 Contributing

### Development Workflow

1. **Create a branch**
   ```bash
   git checkout -b feature/your-feature
   ```

2. **Make changes**
   - Follow TypeScript best practices
   - Add proper type definitions
   - Include console logs for debugging

3. **Test locally**
   ```bash
   docker compose up --build
   ```

4. **Commit with clear messages**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature
   ```

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Follow React/TypeScript recommended rules
- **Prettier**: Auto-format on save
- **Naming**: camelCase for variables, PascalCase for components
- **Logs**: Use tags `[AUTH]`, `[PROGRESS]`, `[QUIZ]`, `[NAV]`, `[DB]`

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments

- **Prisma**: For amazing database tooling
- **Tailwind CSS**: For rapid UI development
- **Docker**: For consistent development environments
- **React**: For building interactive UIs
- **Express**: For robust backend APIs

---

## 📞 Support

For issues, questions, or suggestions:
- 📧 Email: support@vibeenengineer.com
- 🐛 GitHub Issues: [Create an issue](https://github.com/your-repo/issues)
- 💬 Discord: [Join our community](#)

---

**Built with ❤️ for Vibeenengineers**

*Learn. Build. Certify.* 🚀
