#!/bin/bash

echo "🚀 Setting up Article Craft Dashboard..."

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

echo "✅ Setup complete!"
echo ""
echo "🎯 To start the application, run:"
echo "   npm run dev:full"
echo ""
echo "This will start both frontend and backend servers together."
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:3001"
