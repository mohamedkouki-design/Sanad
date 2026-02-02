# LearnTn — Full-Stack Adaptive Learning Platform

**Project Name:** LearnTn  
**Date:** February 1, 2026  
**Country / Context:** Tunisia  
**Target Users:** Students (ages 6–18), Teachers, School Administrators

---

## 1. Project Description & Objectives

### The Problem
Tunisian students lack access to personalized, interactive digital learning tools. Schools rely on static PDFs and one-size-fits-all instruction. There is no progress tracking, no gamification to sustain engagement, and no multilingual support bridging the gap between French/Arabic instruction and native Tunisian Derja comprehension.

### The Solution
**LearnTn** is a full-stack adaptive learning platform where:
- **Students** sign up, browse courses, enroll, complete lessons, and earn XP to level up.
- **Teachers** create courses, add lessons with rich text content, publish them, and monitor enrolled students.
- **AI (OpenAI GPT)** automatically summarizes any lesson on demand — reducing cognitive load for struggling readers.
- **Gamification** (XP, levels, leaderboard) drives engagement and sustained learning habits.

### Key Objectives
1. Provide a free, accessible, scalable learning platform for Tunisian students.
2. Empower teachers to create and manage educational content without technical expertise.
3. Integrate AI-powered content summarization to support neurodivergent and struggling learners.
4. Implement a gamification system (XP, levels, leaderboard) to sustain motivation.
5. Use JWT-based authentication with token refresh for secure, stateless sessions.

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│                                                                 │
│   React (Vite) + Tailwind CSS                                   │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │
│   │  Pages   │ │Components│ │  Hooks   │ │  API Service Layer│  │
│   │Home      │ │Navbar    │ │AuthCtx   │ │  client.js (axios)│  │
│   │Login     │ │CourseCard│ │          │ │  services.js      │  │
│   │Courses   │ │Protected │ │          │ │                   │  │
│   │Dashboard │ │Route     │ │          │ │                   │  │
│   └──────────┘ └──────────┘ └──────────┘ └──────────────────┘  │
│                        │  HTTP (JSON + JWT Bearer)               │
└────────────────────────┼───────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                       API LAYER (Backend)                        │
│                                                                 │
│   Node.js + Express                                             │
│   ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐   │
│   │   Routes     │  │ Controllers  │  │    Middleware       │   │
│   │ /auth        │  │ authCtrl     │  │  verifyToken (JWT) │   │
│   │ /courses     │  │ courseCtrl    │  │  requireRole       │   │
│   │ /lessons     │  │ lessonCtrl   │  │  CORS, Logger      │   │
│   │ /enrollments │  │ enrollCtrl   │  └────────────────────┘   │
│   │ /progress    │  │ progressCtrl │                            │
│   └──────────────┘  └──────┬───────┘                            │
│                            │  Sequelize ORM                     │
│                            ▼                                    │
│   ┌──────────────────────────────────┐   ┌──────────────────┐  │
│   │        OpenAI API (GPT)          │   │   Models         │  │
│   │  Lesson summarization on demand  │   │  User            │  │
│   └──────────────────────────────────┘   │  Course          │  │
│                                          │  Lesson          │  │
└──────────────────────────────────────────│  Enrollment      │──┘
                                           │  Progress        │
┌──────────────────────────────────────────│                  │──┐
│                   DATABASE LAYER         └──────────────────┘  │
│                                                                 │
│   PostgreSQL 16                                                 │
│   ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌──────────┐ ┌────────┐ │
│   │  users  │ │ courses │ │ lessons │ │enrollments│ │progress│ │
│   └─────────┘ └─────────┘ └─────────┘ └──────────┘ └────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Database Schema

### Tables & Relations

```
┌─────────────────────┐         ┌──────────────────────┐
│       users         │         │       courses        │
├─────────────────────┤         ├──────────────────────┤
│ id         (UUID PK)│◄────────│ teacherId  (UUID FK) │
│ name       (VARCHAR)│         │ id         (UUID PK) │
│ email      (VARCHAR)│         │ title      (VARCHAR) │
│ passwordHash (TEXT) │         │ description (TEXT)   │
│ role       (ENUM)   │         │ subject    (VARCHAR) │
│ xp         (INT)    │         │ gradeLevel (INT)     │
│ level      (INT)    │         │ isPublished (BOOL)   │
│ language   (VARCHAR)│         │ createdAt  (DATE)    │
│ refreshToken (TEXT) │         └──────────┬───────────┘
│ createdAt  (DATE)   │                    │ 1:N
│ updatedAt  (DATE)   │                    ▼
└────────┬────────────┘         ┌──────────────────────┐
         │ 1:N                  │       lessons        │
         ▼                      ├──────────────────────┤
┌─────────────────────┐         │ id         (UUID PK) │
│    enrollments      │         │ courseId    (UUID FK) │
├─────────────────────┤         │ title      (VARCHAR) │
│ id         (UUID PK)│         │ content    (TEXT)    │
│ studentId  (UUID FK)│         │ aiSummary  (TEXT)    │
│ courseId    (UUID FK)│         │ order      (INT)     │
│ status     (ENUM)   │         │ xpReward   (INT)     │
│ enrolledAt (DATE)   │         │ estimatedMinutes(INT)│
│ UNIQUE(studentId,   │         └──────────┬───────────┘
│        courseId)     │                    │ 1:N
└─────────────────────┘                    ▼
                               ┌──────────────────────┐
                               │       progress       │
                               ├──────────────────────┤
                               │ id         (UUID PK) │
                               │ studentId  (UUID FK) │
                               │ lessonId   (UUID FK) │
                               │ isCompleted (BOOL)   │
                               │ xpEarned   (INT)     │
                               │ startedAt  (DATE)    │
                               │ completedAt(DATE)    │
                               │ UNIQUE(studentId,    │
                               │        lessonId)     │
                               └──────────────────────┘
```

### Enum Values
| Table | Column | Allowed Values |
|---|---|---|
| users | role | `student`, `teacher`, `admin` |
| enrollments | status | `active`, `completed`, `dropped` |

### Leveling Formula
```
Level N requires: N × 100 total XP
  Level 1:   0 XP (starting)
  Level 2: 200 XP
  Level 3: 300 XP
  Level 5: 500 XP
  ...and so on.
```

---

## 4. API Design

### Base URL
```
http://localhost:5000/api
```

### Authentication
Protected routes require a Bearer token in the header:
```
Authorization: Bearer <accessToken>
```

---

### 4.1 Auth Endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | No | Create account |
| POST | `/auth/login` | No | Sign in |
| POST | `/auth/refresh` | No | Refresh access token |
| GET | `/auth/profile` | Yes | Get current user |

#### POST `/auth/register`
```json
// Request Body
{
  "name": "Ahmed Ben Ali",
  "email": "ahmed@example.com",
  "password": "securePass123",
  "role": "student"
}

// Response 201
{
  "message": "Registration successful",
  "user": { "id": "uuid", "name": "Ahmed Ben Ali", "email": "...", "role": "student", "xp": 0, "level": 1 },
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

#### POST `/auth/login`
```json
// Request Body
{ "email": "ahmed@example.com", "password": "securePass123" }

// Response 200
{
  "message": "Login successful",
  "user": { "id": "uuid", "name": "Ahmed Ben Ali", "role": "student", "xp": 50, "level": 1 },
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

#### POST `/auth/refresh`
```json
// Request Body
{ "refreshToken": "eyJ..." }

// Response 200
{ "accessToken": "eyJ...", "refreshToken": "eyJ..." }
```

---

### 4.2 Course Endpoints

| Method | Route | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/courses` | No | — | List all published courses |
| GET | `/courses/:id` | No | — | Get course + lessons |
| POST | `/courses` | Yes | teacher | Create course |
| PUT | `/courses/:id` | Yes | teacher | Update course |
| DELETE | `/courses/:id` | Yes | teacher | Delete course |

#### POST `/courses`
```json
// Request Body
{
  "title": "Introduction to Algebra",
  "description": "Learn the basics of algebra step by step.",
  "subject": "Mathematics",
  "gradeLevel": 7
}

// Response 201
{
  "message": "Course created",
  "course": { "id": "uuid", "title": "Introduction to Algebra", "isPublished": false, ... }
}
```

---

### 4.3 Lesson Endpoints (nested under courses)

| Method | Route | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/courses/:courseId/lessons` | No | — | List lessons |
| GET | `/courses/:courseId/lessons/:id` | No | — | Get single lesson |
| POST | `/courses/:courseId/lessons` | Yes | teacher | Create lesson |
| PUT | `/courses/:courseId/lessons/:id` | Yes | teacher | Update lesson |
| DELETE | `/courses/:courseId/lessons/:id` | Yes | teacher | Delete lesson |
| POST | `/courses/:courseId/lessons/:id/summarize` | Yes | any | AI summarize |

#### POST `/courses/:courseId/lessons/:lessonId/summarize`
```json
// Response 200
{
  "summary": "This lesson covers the fundamentals of linear equations...",
  "cached": false   // true if previously generated and stored
}
```

---

### 4.4 Enrollment Endpoints

| Method | Route | Auth | Role | Description |
|---|---|---|---|---|
| POST | `/enrollments` | Yes | student | Enroll in a course |
| GET | `/enrollments/my` | Yes | student | My enrolled courses |
| DELETE | `/enrollments/:courseId` | Yes | student | Drop a course |
| GET | `/enrollments/course/:courseId` | Yes | teacher | View course roster |

---

### 4.5 Progress Endpoints

| Method | Route | Auth | Role | Description |
|---|---|---|---|---|
| POST | `/progress/start` | Yes | student | Mark lesson started |
| POST | `/progress/complete` | Yes | student | Complete lesson + earn XP |
| GET | `/progress/course/:courseId` | Yes | student | My progress in a course |
| GET | `/progress/leaderboard` | Yes | any | Top 20 students by XP |

#### POST `/progress/complete`
```json
// Request Body
{ "lessonId": "uuid" }

// Response 200
{
  "message": "Lesson completed!",
  "xpEarned": 10,
  "totalXP": 60,
  "level": 1,
  "leveledUp": false,
  "courseCompleted": false,
  "completedLessons": 3,
  "totalLessons": 5
}
```

---

## 5. Folder Structure

```
learntm/
├── docker-compose.yml
│
├── backend/
│   ├── package.json
│   ├── .env.example
│   ├── Dockerfile
│   └── src/
│       ├── server.js                  ← Entry point, Express setup
│       ├── models/
│       │   ├── index.js               ← Associations (FK definitions)
│       │   ├── User.js
│       │   ├── Course.js
│       │   ├── Lesson.js
│       │   ├── Enrollment.js
│       │   └── Progress.js
│       ├── controllers/
│       │   ├── authController.js      ← Register, login, refresh, profile
│       │   ├── courseController.js     ← CRUD courses
│       │   ├── lessonController.js    ← CRUD lessons + AI summarize
│       │   ├── enrollmentController.js← Enroll, drop, rosters
│       │   └── progressController.js  ← Complete, XP, leveling, leaderboard
│       ├── routes/
│       │   ├── authRoutes.js
│       │   ├── courseRoutes.js
│       │   ├── lessonRoutes.js
│       │   ├── enrollmentRoutes.js
│       │   └── progressRoutes.js
│       ├── middleware/
│       │   └── auth.js                ← verifyToken, requireRole
│       └── utils/
│           ├── database.js            ← Sequelize connection
│           ├── tokenHelper.js         ← JWT generate/verify helpers
│           └── syncDB.js              ← Manual DB sync script
│
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    ├── .env.example
    ├── Dockerfile
    └── src/
        ├── main.js                    ← React entry point
        ├── App.js                     ← Router + layout
        ├── styles/
        │   └── index.css              ← Tailwind import
        ├── api/
        │   ├── client.js              ← Axios instance + interceptors
        │   └── services.js            ← All API call functions
        ├── hooks/
        │   └── AuthContext.js         ← Auth state + provider
        ├── components/
        │   ├── Navbar.js              ← Top navigation bar
        │   ├── CourseCard.js          ← Reusable course card
        │   └── ProtectedRoute.js      ← Auth-guard wrapper
        └── pages/
            ├── Home.js                ← Landing / dashboard
            ├── Login.js               ← Login form
            ├── Register.js            ← Registration form
            ├── Courses.js             ← Browse all courses
            ├── CourseDetail.js        ← Single course + lessons + progress
            ├── MyCourses.js           ← Student's enrolled courses
            ├── TeacherDashboard.js    ← Teacher course & lesson management
            └── Leaderboard.js         ← XP rankings
```

---

## 6. Authentication & Authorization Flow

```
┌─────────┐  ① POST /auth/login           ┌─────────┐
│  Client │  { email, password }          │  Server │
│         │ ─────────────────────────────► │         │
│         │                                │ Verify  │
│         │  ② Response:                   │ password│
│         │  { accessToken (15min),        │ (bcrypt)│
│         │    refreshToken (7d),          │         │
│         │    user }                      │         │
│         │ ◄───────────────────────────── │         │
│         │                                │         │
│         │  ③ Save tokens to             │         │
│         │     localStorage              │         │
│         │                                │         │
│         │  ④ Every API request:         │         │
│         │  Authorization: Bearer <token> │         │
│         │ ─────────────────────────────► │         │
│         │                                │ Verify  │
│         │                                │ JWT sig │
│         │                                │ & expiry│
│         │                                │         │
│         │  ⑤ Access token expires:      │         │
│         │  POST /auth/refresh            │         │
│         │  { refreshToken }              │         │
│         │ ─────────────────────────────► │         │
│         │                                │ Verify  │
│         │  ⑥ New tokens returned        │ refresh │
│         │ ◄───────────────────────────── │ token   │
│         │                                │ matches │
│         │  ⑦ Retry failed request       │ DB copy │
│         │     with new access token     │         │
└─────────┘                                └─────────┘

Role-Based Access:
  ┌──────────┐   requireRole("teacher")    ┌──────────────┐
  │  Route   │ ──────────────────────────► │  Teacher     │
  │ POST     │   ✓ teacher → allowed       │  Dashboard   │
  │ /courses │   ✗ student → 403 Forbidden │              │
  └──────────┘                             └──────────────┘
```

### Security Details
- **Passwords** are hashed with bcrypt (10 salt rounds) — never stored in plain text.
- **Access tokens** expire after 15 minutes. They contain `{ id, email, role }`.
- **Refresh tokens** expire after 7 days. They are stored in the database and rotated on each use (old token is invalidated).
- The **Axios interceptor** automatically catches 401 errors, refreshes the token, and retries the original request — transparent to the developer.
- **Role guards** (`requireRole`) run after `verifyToken`. If the user's role doesn't match, a 403 is returned immediately.

---

## 7. Environment Variables

### Backend (`.env`)
```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=learntm_db
DB_USER=learntm_user
DB_PASS=your_password_here

JWT_ACCESS_SECRET=generate_with_crypto_randomBytes
JWT_REFRESH_SECRET=generate_with_crypto_randomBytes
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

OPENAI_API_KEY=sk-your-key-here
CLIENT_URL=http://localhost:3000
```

### Frontend (`.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 8. Step-by-Step Installation & Run

### Option A: Local Development (without Docker)

#### Prerequisites
- Node.js 18+ (`node --version`)
- PostgreSQL 15+ installed and running
- An OpenAI API key (optional — AI summarization won't work without it)

#### Step 1: Clone the project
```bash
git clone <your-repo-url>
cd learntm
```

#### Step 2: Set up the Database
```bash
# Open psql and run:
psql -U postgres
CREATE USER learntm_user WITH PASSWORD 'learntm_pass';
CREATE DATABASE learntm_db OWNER learntm_user;
\q
```

#### Step 3: Configure the Backend
```bash
cd backend
cp .env.example .env
# Edit .env — fill in your DB password, generate JWT secrets:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
npm install
npm run db:sync     # creates all tables
npm run dev         # starts backend on port 5000
```

#### Step 4: Configure the Frontend (new terminal)
```bash
cd ../frontend
cp .env.example .env
npm install
npm run dev         # starts frontend on port 3000
```

#### Step 5: Open the app
```
http://localhost:3000
```

---

### Option B: Docker (Recommended — zero setup)

#### Prerequisites
- Docker Desktop installed

#### Step 1: Set your OpenAI key (optional)
```bash
export OPENAI_API_KEY=sk-your-key-here
```

#### Step 2: Run everything
```bash
cd learntm
docker-compose up --build
```

#### Step 3: Wait for containers to start (~30 seconds), then open:
```
http://localhost:3000
```

All three services (database, backend, frontend) start automatically. The database tables are created on first boot.

---

## 9. Future Improvements & Scalability Ideas

### Short Term
- **Quiz System:** Add multiple-choice quizzes after each lesson for knowledge verification.
- **Course Search & Filters:** Filter by subject, grade level, language.
- **User Avatars:** Allow profile picture uploads.
- **Dark Mode:** Full theming support.

### Medium Term
- **Badges & Achievements:** Beyond XP — unlock badges like "First Course Completed," "5-Day Streak," etc.
- **AI Tutoring Chatbot:** An interactive chatbot per lesson that answers student questions using the lesson content as context (RAG pattern).
- **Notifications:** Email/SMS notifications for course updates, streak reminders.
- **Teacher Analytics Dashboard:** Charts showing student progress, completion rates, and common struggle points.
- **Mobile App:** React Native port for iOS/Android with offline lesson caching.

### Long Term / Scalability
- **Microservices:** Split into separate services (Auth Service, Course Service, AI Service) with a message queue (RabbitMQ/Kafka) for event-driven communication.
- **CDN & Media Storage:** Move lesson media (images, videos) to AWS S3 + CloudFront.
- **Caching Layer:** Add Redis for session management, leaderboard caching, and frequent query results.
- **Horizontal Scaling:** Deploy backend behind a load balancer (e.g., AWS ELB or Nginx) with multiple Node.js instances.
- **Database Migrations:** Replace `sync()` with Sequelize CLI migrations for production-safe schema changes.
- **CI/CD Pipeline:** GitHub Actions → build → test → deploy to AWS (ECS or Vercel + RDS).
- **Internationalization (i18n):** Full Arabic/French/English translation using react-i18next on frontend and locale-aware content on backend.
- **Multi-tenancy:** Support multiple schools/institutions, each with isolated data.
