# 🧪 Sprint 1 Testing Guide

## Sprint 1: Authentication Feature

This sprint implements the complete authentication system with both backend and frontend integration.

### ✅ Features Implemented

1. **Backend Authentication API**
   - Student registration endpoint
   - Login/logout with JWT tokens
   - Token refresh mechanism
   - Protected routes with middleware
   - Input validation and error handling

2. **Frontend Authentication UI**
   - Registration form with validation
   - Login form with validation
   - Authentication context and state management
   - Protected routing
   - Dashboard with user info

3. **Database Integration**
   - Prisma ORM setup
   - Student and related models
   - Database migrations
   - Seed data for testing

### 🚀 How to Test

#### 1. Start the Application

```bash
# Option 1: Use the setup script
chmod +x start-sprint1.sh
./start-sprint1.sh

# Then start the dev servers
npm run dev
```

#### 2. Manual Testing Steps

**Test Registration:**
1. Go to http://localhost:3000
2. Click "create a new account"
3. Fill out the registration form:
   - First Name: John
   - Last Name: Doe
   - Email: john.doe@example.com
   - Student ID: STU123456
   - Password: MyPassword123!
   - Confirm Password: MyPassword123!
4. Click "Create account"
5. Should automatically log in and redirect to dashboard

**Test Login:**
1. Go to http://localhost:3000/login
2. Use test account:
   - Email: student@example.com
   - Password: Student123!
3. Click "Sign in"
4. Should redirect to dashboard

**Test Dashboard:**
1. After login, should see:
   - Welcome message with student name
   - Student ID display
   - Current GPA (0.00 for new students)
   - Enrolled courses count
   - Course list (if any)

**Test Logout:**
1. Click "Logout" button in header
2. Should redirect to login page
3. Try accessing /dashboard directly - should redirect to login

#### 3. API Testing

**Health Check:**
```bash
curl http://localhost:3001/health
```

**Register New Student:**
```bash
curl -X POST http://localhost:3001/api/auth/register/student \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "firstName": "Test",
    "lastName": "User",
    "studentId": "TEST001"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "Student123!"
  }'
```

**Get Profile (with token):**
```bash
# Replace TOKEN with the accessToken from login response
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3001/api/students/profile
```

### 🔍 What to Look For

#### ✅ Success Indicators
- Registration creates new student account
- Login returns JWT tokens
- Dashboard shows student information
- Protected routes require authentication
- Logout clears tokens and redirects
- Form validation works correctly
- Error messages display properly
- Responsive design works on mobile

#### ❌ Common Issues
- Database connection errors (check Docker containers)
- CORS issues (check server logs)
- Token expiration (tokens expire in 15 minutes)
- Validation errors (check form inputs)
- Port conflicts (3000 for frontend, 3001 for backend)

### 📊 Test Coverage

**Backend Endpoints Tested:**
- ✅ POST /api/auth/register/student
- ✅ POST /api/auth/login
- ✅ POST /api/auth/logout
- ✅ GET /api/auth/me
- ✅ GET /api/students/profile
- ✅ GET /health

**Frontend Components Tested:**
- ✅ Registration page
- ✅ Login page
- ✅ Dashboard page
- ✅ Authentication context
- ✅ Protected routing
- ✅ Form validation
- ✅ Error handling

### 🎯 Next Sprint Preview

After Sprint 1 is tested and working, Sprint 2 will add:
- Course browsing and enrollment
- Course content viewing
- Progress tracking
- Student dashboard enhancements

### 🐛 Troubleshooting

**Database Issues:**
```bash
# Reset database
cd server
npx prisma migrate reset
npx prisma db seed
```

**Port Issues:**
```bash
# Kill processes on ports
npx kill-port 3000 3001
```

**Clear Browser Data:**
- Clear localStorage
- Clear cookies
- Hard refresh (Ctrl+Shift+R)

**Check Logs:**
- Browser console for frontend errors
- Terminal for backend errors
- Docker logs for database issues