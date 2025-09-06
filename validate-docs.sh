#!/bin/bash

# BookMory API Documentation Validation Script
# This script starts the development server and validates the Swagger documentation

echo "🚀 Starting BookMory API Documentation Validation"
echo "================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ to continue."
    exit 1
fi

# Check if we're in the server directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the server directory"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if Prisma client is generated
if [ ! -d "node_modules/.prisma" ]; then
    echo "🔧 Generating Prisma client..."
    npx prisma generate
fi

echo ""
echo "✅ Environment checks passed"
echo ""

# Start the development server
echo "🔥 Starting development server..."
echo "📝 Swagger documentation will be available at: http://localhost:3000/api/docs"
echo "🏥 Health check endpoint: http://localhost:3000/api"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm run start:dev
