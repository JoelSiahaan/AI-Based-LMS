#!/bin/bash

# Student LMS Installation Script
# This script automates the installation process

set -e  # Exit on any error

echo "🚀 Starting Student LMS Installation..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Download from: https://www.docker.com/get-started/"
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server
npm install
cd ..

# Install client dependencies  
echo "📦 Installing client dependencies..."
cd client
npm install
cd ..

# Copy environment files
echo "⚙️  Setting up environment files..."
if [ ! -f server/.env ]; then
    cp server/.env.example server/.env
    echo "✅ Created server/.env"
else
    echo "ℹ️  server/.env already exists"
fi

if [ ! -f client/.env ]; then
    cp client/.env.example client/.env
    echo "✅ Created client/.env"
else
    echo "ℹ️  client/.env already exists"
fi

# Start database containers
echo "🐳 Starting database containers..."
npm run docker:dev &
DOCKER_PID=$!

# Wait for databases to be ready
echo "⏳ Waiting for databases to start..."
sleep 10

# Generate Prisma client
echo "🔧 Generating Prisma client..."
cd server
npx prisma generate

# Run database migrations
echo "🗄️  Running database migrations..."
npx prisma migrate dev --name init

echo "✅ Installation completed successfully!"
echo ""
echo "🎉 Next steps:"
echo "   1. Start development servers: npm run dev"
echo "   2. Open http://localhost:3000 in your browser"
echo "   3. Check API health: curl http://localhost:3001/health"
echo ""
echo "📚 For more information, see:"
echo "   - README.md for general usage"
echo "   - INSTALLATION.md for detailed setup guide"
echo "   - tasks.md for implementation roadmap"