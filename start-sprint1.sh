#!/bin/bash

echo "🚀 Starting Sprint 1: Authentication Feature"
echo "=========================================="

# Check if dependencies are installed
if [ ! -d "server/node_modules" ]; then
    echo "📦 Installing server dependencies..."
    cd server && npm install && cd ..
fi

if [ ! -d "client/node_modules" ]; then
    echo "📦 Installing client dependencies..."
    cd client && npm install && cd ..
fi

# Start databases
echo "🐳 Starting databases..."
npm run docker:dev &
DOCKER_PID=$!

# Wait for databases
echo "⏳ Waiting for databases to start..."
sleep 15

# Generate Prisma client and run migrations
echo "🔧 Setting up database..."
cd server
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
cd ..

echo "✅ Sprint 1 Setup Complete!"
echo ""
echo "🎯 Sprint 1 Features Ready to Test:"
echo "   ✅ Student Registration"
echo "   ✅ Student Login/Logout"
echo "   ✅ JWT Authentication"
echo "   ✅ Basic Dashboard"
echo "   ✅ Profile Management"
echo ""
echo "🧪 Test Accounts:"
echo "   📧 Student: student@example.com / Student123!"
echo "   📧 Teacher: teacher@example.com / Teacher123!"
echo ""
echo "🌐 URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:3001"
echo "   Health Check: http://localhost:3001/health"
echo ""
echo "▶️  To start the application:"
echo "   npm run dev"
echo ""
echo "🔍 To test the API directly:"
echo "   curl http://localhost:3001/health"
echo "   curl -X POST http://localhost:3001/api/auth/login \\"
echo "        -H 'Content-Type: application/json' \\"
echo "        -d '{\"email\":\"student@example.com\",\"password\":\"Student123!\"}'"