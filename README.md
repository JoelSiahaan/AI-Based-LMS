# Student Learning Management System

A comprehensive web-first learning management system designed for school students to access courses, submit assignments, track progress, and communicate with teachers.

## 🚀 Features

- **Student Dashboard** - Course overview, progress tracking, and quick actions
- **Course Management** - Hierarchical content organization with modules and lessons
- **Assignment System** - File upload, submission tracking, and grading
- **Communication Hub** - Direct messaging and course discussions
- **Progress Tracking** - GPA calculation and performance analytics
- **Mobile-First Design** - PWA with offline capabilities
- **Security** - JWT authentication, data encryption, and audit logging

## 🛠 Technology Stack

### Backend
- **Node.js** with Express.js and TypeScript
- **PostgreSQL** with Prisma ORM
- **Redis** for caching and sessions
- **JWT** for authentication
- **Docker** for containerization

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **PWA** with service workers
- **React Query** for state management

## 📋 Prerequisites

- Node.js 18+ 
- Docker and Docker Compose
- PostgreSQL 15+ (if running locally)
- Redis 7+ (if running locally)

## 🚀 Quick Start

### Using Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd student-learning-management
   ```

2. **Install root dependencies**
   ```bash
   npm install
   ```

3. **Start development environment**
   ```bash
   npm run docker:dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Database: localhost:5432

### Local Development Setup

#### Step 1: Install Dependencies

**Install root dependencies:**
```bash
npm install
```

**Install server dependencies:**
```bash
cd server
npm install
cd ..
```

**Install client dependencies:**
```bash
cd client
npm install
cd ..
```

#### Step 2: Environment Configuration

**Set up server environment variables:**
```bash
cp server/.env.example server/.env
```

**Set up client environment variables:**
```bash
cp client/.env.example client/.env
```

**Edit the environment files as needed for your local setup.**

#### Step 3: Database Setup

**Start PostgreSQL and Redis (using Docker):**
```bash
npm run docker:dev  # This starts only the databases
```

**Generate Prisma client:**
```bash
cd server
npx prisma generate
```

**Run database migrations:**
```bash
npx prisma migrate dev
```

**Seed the database (optional):**
```bash
npx prisma db seed
cd ..
```

#### Step 4: Start Development Servers

**Start both frontend and backend:**
```bash
npm run dev
```

**Or start them separately:**
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend  
cd client
npm run dev
```

#### Step 5: Verify Installation

**Check backend health:**
```bash
curl http://localhost:3001/health
```

**Access frontend:**
Open http://localhost:3000 in your browser

## 📚 API Documentation

The API follows RESTful conventions with the following main endpoints:

### Authentication
- `POST /api/auth/register/student` - Student registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Students
- `GET /api/students/profile` - Get student profile
- `PUT /api/students/profile` - Update student profile

### Courses
- `GET /api/courses` - List enrolled courses
- `GET /api/courses/:id` - Get course details
- `GET /api/courses/:id/materials` - Get course materials
- `GET /api/courses/:id/progress` - Get course progress

### Assignments
- `GET /api/assignments` - List assignments
- `GET /api/assignments/:id` - Get assignment details
- `POST /api/assignments/:id/submit` - Submit assignment
- `GET /api/assignments/:id/submissions` - Get submission history

### Grades
- `GET /api/grades` - Get all grades
- `GET /api/grades/gpa` - Calculate current GPA
- `GET /api/courses/:id/grades` - Get course-specific grades

## 🧪 Testing

### Backend Tests
```bash
cd server
npm test                # Run all tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage
```

### Frontend Tests
```bash
cd client
npm test                # Run all tests
npm run test:ui         # Run tests with UI
npm run test:coverage   # Run tests with coverage
```

### Property-Based Testing
The system includes property-based tests using fast-check to validate correctness properties:

```bash
# Run property-based tests
cd server
npm test -- --testNamePattern="Property"
```

## 🐳 Docker Commands

```bash
# Development environment (databases only)
npm run docker:dev

# Full production build
npm run docker:build
npm run docker:up

# Stop all services
npm run docker:down
```

## 📁 Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API services
│   │   ├── utils/          # Utility functions
│   │   └── types/          # TypeScript types
│   ├── public/             # Static assets
│   └── dist/               # Built application
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utility functions
│   │   └── types/          # TypeScript types
│   ├── prisma/             # Database schema and migrations
│   └── dist/               # Built application
├── docker-compose.yml      # Production Docker setup
├── docker-compose.dev.yml  # Development Docker setup
└── nginx.conf              # Nginx configuration
```

## 🔒 Security Features

- **Authentication**: JWT tokens with refresh token rotation
- **Authorization**: Role-based access control
- **Data Encryption**: All sensitive data encrypted at rest and in transit
- **Rate Limiting**: API rate limiting to prevent abuse
- **Audit Logging**: Comprehensive audit trail for all user actions
- **Input Validation**: Strict validation of all user inputs
- **CORS Protection**: Configured CORS policies
- **Security Headers**: Helmet.js security headers

## 🚀 Deployment

### Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy with Docker**
   ```bash
   docker-compose up -d
   ```

3. **Set up SSL/TLS** (recommended)
   - Configure reverse proxy (nginx/Apache)
   - Set up SSL certificates (Let's Encrypt)

### Environment Variables

Make sure to set production environment variables:

- `NODE_ENV=production`
- `JWT_SECRET` - Strong secret key
- `JWT_REFRESH_SECRET` - Strong refresh secret
- `DATABASE_URL` - Production database URL
- `REDIS_URL` - Production Redis URL

## 📊 Monitoring

The application includes:

- **Health Checks**: `/health` endpoint for monitoring
- **Logging**: Structured logging with Winston
- **Error Tracking**: Comprehensive error handling
- **Performance Monitoring**: Request/response timing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the documentation in `/docs`
- Review the API documentation at `/api/docs` (when running)

## 🗺 Roadmap

- [ ] Real-time notifications with WebSockets
- [ ] Advanced analytics and reporting
- [ ] Mobile app (React Native)
- [ ] Integration with external LMS systems
- [ ] AI-powered learning recommendations
- [ ] Video conferencing integration