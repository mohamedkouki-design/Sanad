
## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start (Docker — Recommended)](#quick-start-docker--recommended)
3. [Manual Setup (Local Development)](#manual-setup-local-development)
4. [Environment Configuration](#environment-configuration)
5. [Common Commands](#common-commands)
6. [Troubleshooting](#troubleshooting)
7. [Project Structure Overview](#project-structure-overview)

### For Docker Setup:
- **Docker** (v20.10+) — [Download](https://www.docker.com/products/docker-desktop)
- **Docker Compose** (v1.29+) — Usually comes with Docker Desktop

### For Local Setup:
- **Node.js** (v16+) — [Download](https://nodejs.org/)
- **PostgreSQL** (v14+) — [Download](https://www.postgresql.org/download/)
- **Git** — [Download](https://git-scm.com/)

---

## Quick Start (Docker — Recommended)

The easiest way to get the application running is with Docker Compose. This brings up all services (database, backend, frontend) with one command.

### Steps:

1. **Navigate to the project directory:**
   ```bash
   cd LearnTn_Full_Stack_Project/learntm
   ```

2. **Build and start all services:**
   ```bash
   docker-compose up --build
   ```

   This will:
   - Create and start a PostgreSQL database (`learntm-db`)
   - Build and start the backend API (`learntm-backend`)
   - Build and start the frontend dev server (`learntm-frontend`)

3. **Wait for services to be healthy:**
   - Backend will be ready when you see: `Server running on port 5000`
   - Frontend will be ready when you see: `VITE v5.x.x ready in XXXms`

4. **Access the application:**
   - **Frontend:** http://localhost:5173 (or the port shown in terminal)
   - **Backend API:** http://localhost:5000
   - **Database:** `localhost:5432` (if you need direct access)

5. **To stop all services:**
   ```bash
   docker-compose down
   ```

   To stop and remove all data (including database):
   ```bash
   docker-compose down -v
   ```

---

## Manual Setup (Local Development)

If you prefer running services individually without Docker, follow these steps:

### 1. Clone or Extract the Project

```bash
cd LearnTn_Full_Stack_Project/learntm
```

### 2. Set Up the Database

#### Option A: Using PostgreSQL directly

1. Start your PostgreSQL service
2. Create the database and user:
   ```sql
   CREATE USER learntm_user WITH PASSWORD 'learntm_pass';
   CREATE DATABASE learntm_db OWNER learntm_user;
   GRANT ALL PRIVILEGES ON DATABASE learntm_db TO learntm_user;
   ```

#### Option B: Using Docker just for the database

```bash
docker run --name learntm-db -e POSTGRES_USER=learntm_user -e POSTGRES_PASSWORD=learntm_pass -e POSTGRES_DB=learntm_db -p 5432:5432 -d postgres:16
```

### 3. Set Up the Backend

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create a `.env` file** (see [Environment Configuration](#environment-configuration) section)

4. **Sync the database** (create tables):
   ```bash
   npm run db:sync
   ```

5. **Start the backend server:**
   ```bash
   npm run dev
   ```

   You should see: `Server running on port 5000`

### 4. Set Up the Frontend

1. **Open a new terminal and navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the dev server:**
   ```bash
   npm run dev
   ```

   You should see: `VITE v5.x.x ready in XXXms`

4. **Access the app:** Open http://localhost:5173 in your browser

---

## Environment Configuration

### Backend `.env` File

Create a file `backend/.env` with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost        # or 'db' if using Docker
DB_PORT=5432
DB_NAME=learntm_db
DB_USER=learntm_user
DB_PASS=learntm_pass

# JWT Secrets (change these in production!)
JWT_ACCESS_SECRET=your_super_secret_access_key_change_this
JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_this

# OpenAI Configuration (for lesson summarization)
OPENAI_API_KEY=your_openai_api_key_here

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

**⚠️ Important:** Never commit `.env` files. Add `backend/.env` to `.gitignore`.

### Frontend Configuration

The frontend uses `vite.config.js` which is already configured. By default, it connects to:
- API: `http://localhost:5000`

If you need to change this, edit `frontend/src/api/client.js`.

---

## Common Commands

### Backend Commands

```bash
cd backend

# Development (with hot reload)
npm run dev

# Production build and run
npm start

# Sync database (create/update tables)
npm run db:sync
```

### Frontend Commands

```bash
cd frontend

# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

### Docker Commands

```bash
# Start all services
docker-compose up --build

# Start in background
docker-compose up -d --build

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db

# Stop all services
docker-compose down

# Stop and remove all data
docker-compose down -v

# Rebuild a specific service
docker-compose up --build backend
```

---

## Troubleshooting

### Issue: Port Already in Use

**Error:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solution:** Either:
- Kill the process using that port
- Change the port in `.env` (backend) or `vite.config.js` (frontend)

### Issue: Database Connection Failed

**Error:** `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Solution:**
1. Ensure PostgreSQL is running
2. Check your `DB_*` environment variables in `.env`
3. Verify the database user and password are correct

### Issue: Docker Build Fails

**Error:** `failed to solve with frontend dockerfile.v0`

**Solution:**
```bash
# Clean up Docker
docker system prune -a

# Rebuild
docker-compose up --build
```

### Issue: Frontend Can't Connect to Backend

**Error:** `GET http://localhost:5000/... 404 or Connection Refused`

**Solution:**
1. Ensure backend is running: `npm run dev` in `backend/` directory
2. Check the API base URL in `frontend/src/api/client.js`
3. Ensure CORS is enabled in `backend/src/server.js`

### Issue: Database Tables Don't Exist

**Error:** `relation "users" does not exist`

**Solution:**
```bash
cd backend
npm run db:sync
```

### Issue: Tests or Dependencies Won't Install

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## Project Structure Overview

```
learntm/
├── backend/
│   ├── src/
│   │   ├── server.js              # Express app entry point
│   │   ├── controllers/           # Business logic
│   │   ├── routes/                # API endpoints
│   │   ├── models/                # Database models (Sequelize)
│   │   ├── middleware/            # Auth, CORS, etc.
│   │   └── utils/                 # Database sync, JWT helpers
│   ├── .env                       # Environment variables (create this)
│   ├── package.json
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── main.js                # React entry point
│   │   ├── App.js                 # Main app component
│   │   ├── pages/                 # Page components
│   │   ├── components/            # Reusable components
│   │   ├── hooks/                 # React hooks (e.g., AuthContext)
│   │   ├── api/                   # API client and services
│   │   └── styles/                # CSS/Tailwind styles
│   ├── vite.config.js
│   ├── package.json
│   ├── index.html                 # HTML template
│   └── Dockerfile
│
├── docs/
│   ├── PROJECT_DOCUMENTATION.md   # Full technical docs
│   └── TEAMMATE_GUIDE.md          # This file
│
└── docker-compose.yml             # Docker orchestration
```

---

## First-Time Setup Checklist

- [ ] Clone/extract the repository
- [ ] Install Docker (or Node.js + PostgreSQL for local setup)
- [ ] Run `docker-compose up --build` (or follow manual setup)
- [ ] Access http://localhost:5173 in your browser
- [ ] Create a test account (Register page)
- [ ] Log in and browse the courses
- [ ] Read `PROJECT_DOCUMENTATION.md` for full technical details

---

## Need Help?

- **Check the logs:** `docker-compose logs -f` or look at terminal output
- **Review `PROJECT_DOCUMENTATION.md`** for architecture and API details
- **Check `.env` configuration** — most issues stem from missing/incorrect env variables
- **Restart services:** Stop and restart with `docker-compose down && docker-compose up --build`

---

## Next Steps

Once the application is running:

1. **Explore the codebase** — Check out `backend/src/controllers/` and `frontend/src/pages/`
2. **Run the database sync** — Ensure all tables are created
3. **Create test data** — Register as a student/teacher and explore features
4. **Read the API docs** — Check `backend/src/routes/` for available endpoints
5. **Make your first feature** — Follow the patterns in existing code

---

**Happy coding! 🚀**
