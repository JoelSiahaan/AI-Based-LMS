@echo off
REM Student LMS Installation Script for Windows
REM This script automates the installation process

echo 🚀 Starting Student LMS Installation...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    echo    Download from: https://nodejs.org/
    pause
    exit /b 1
)

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker first.
    echo    Download from: https://www.docker.com/get-started/
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed

REM Install root dependencies
echo 📦 Installing root dependencies...
npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install root dependencies
    pause
    exit /b 1
)

REM Install server dependencies
echo 📦 Installing server dependencies...
cd server
npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install server dependencies
    pause
    exit /b 1
)
cd ..

REM Install client dependencies
echo 📦 Installing client dependencies...
cd client
npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install client dependencies
    pause
    exit /b 1
)
cd ..

REM Copy environment files
echo ⚙️ Setting up environment files...
if not exist server\.env (
    copy server\.env.example server\.env
    echo ✅ Created server/.env
) else (
    echo ℹ️ server/.env already exists
)

if not exist client\.env (
    copy client\.env.example client\.env
    echo ✅ Created client/.env
) else (
    echo ℹ️ client/.env already exists
)

REM Start database containers
echo 🐳 Starting database containers...
start /b npm run docker:dev

REM Wait for databases to be ready
echo ⏳ Waiting for databases to start...
timeout /t 15 /nobreak >nul

REM Generate Prisma client
echo 🔧 Generating Prisma client...
cd server
npx prisma generate
if %errorlevel% neq 0 (
    echo ❌ Failed to generate Prisma client
    pause
    exit /b 1
)

REM Run database migrations
echo 🗄️ Running database migrations...
npx prisma migrate dev --name init
if %errorlevel% neq 0 (
    echo ❌ Failed to run database migrations
    pause
    exit /b 1
)

cd ..

echo ✅ Installation completed successfully!
echo.
echo 🎉 Next steps:
echo    1. Start development servers: npm run dev
echo    2. Open http://localhost:3000 in your browser
echo    3. Check API health: curl http://localhost:3001/health
echo.
echo 📚 For more information, see:
echo    - README.md for general usage
echo    - INSTALLATION.md for detailed setup guide
echo    - tasks.md for implementation roadmap

pause