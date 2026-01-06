# Installation Guide

This guide provides detailed instructions for setting up the Student Learning Management System.

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Docker & Docker Compose** - [Download here](https://www.docker.com/get-started/)
- **Git** - [Download here](https://git-scm.com/)

## Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd student-learning-management
```

### 2. Install Dependencies

**Install root-level dependencies:**
```bash
npm install
```

**Install server dependencies:**
```bash
cd server
npm install
```

**Install client dependencies:**
```bash
cd ../client
npm install
cd ..
```

### 3. Environment Configuration

**Copy environment files:**
```bash
# Server environment
cp server/.env.example server/.env

# Client environment  
cp client/.env.example client/.env
```

**Edit server/.env if needed:**
```bash
# Default values should work for local development
DATABASE_URL="postgresql://lms_user:lms_password@localhost:5432/student_lms_dev"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="dev-jwt-secret-change-in-production"
# ... other settings
```

### 4. Database Setup

**Start PostgreSQL and Redis containers:**
```bash
npm run docker:dev
```

**Generate Prisma client:**
```bash
cd server
npx prisma generate
```

**Run database migrations:**
```bash
npx prisma migrate dev --name init
```

**Seed database with sample data (optional):**
```bash
npx prisma db seed
cd ..
```

### 5. Start Development Servers

**Option A: Start both servers together**
```bash
npm run dev
```

**Option B: Start servers separately**
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client  
npm run dev
```

### 6. Verify Installation

**Check backend health:**
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-06T...",
  "uptime": 1.234,
  "environment": "development"
}
```

**Access frontend:**
Open http://localhost:3000 in your browser

## Required Node Modules

### Server Dependencies
```json
{
  "@prisma/client": "^5.7.1",
  "express": "^4.18.2",
  "cors": "^2.8.5",
  "helmet": "^7.1.0",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.2",
  "joi": "^17.11.0",
  "multer": "^1.4.5-lts.1",
  "redis": "^4.6.12",
  "winston": "^3.11.0",
  "express-rate-limit": "^7.1.5",
  "compression": "^1.7.4",
  "dotenv": "^16.3.1"
}
```

### Client Dependencies
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.20.1",
  "axios": "^1.6.2",
  "react-query": "^3.39.3",
  "@headlessui/react": "^1.7.17",
  "@heroicons/react": "^2.0.18",
  "react-hook-form": "^7.48.2",
  "@hookform/resolvers": "^3.3.2",
  "yup": "^1.4.0",
  "react-hot-toast": "^2.4.1"
}
```

## Troubleshooting

### Common Issues

**1. Port already in use:**
```bash
# Kill processes on ports 3000 and 3001
npx kill-port 3000 3001
```

**2. Database connection issues:**
```bash
# Restart Docker containers
npm run docker:down
npm run docker:dev
```

**3. Prisma client not generated:**
```bash
cd server
npx prisma generate
npx prisma db push
```

**4. Node modules not found:**
```bash
# Clean install all dependencies
rm -rf node_modules server/node_modules client/node_modules
npm install
cd server && npm install
cd ../client && npm install
```

### Verification Commands

**Check if all services are running:**
```bash
# Check backend
curl http://localhost:3001/health

# Check frontend
curl http://localhost:3000

# Check database
docker ps | grep postgres

# Check Redis
docker ps | grep redis
```

## Next Steps

After successful installation:

1. **Register a test student account** via the API or frontend
2. **Explore the API endpoints** at http://localhost:3001/api
3. **Start implementing features** following the task list in `tasks.md`
4. **Run tests** with `npm test` in server and client directories

## Development Workflow

1. **Make changes** to server or client code
2. **Hot reload** will automatically restart the servers
3. **Run tests** to ensure everything works
4. **Commit changes** following the project conventions

For more detailed information, see the main [README.md](README.md) file.