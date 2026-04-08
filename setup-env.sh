#!/usr/bin/env bash

# CampusFinds Development & Production Setup Script
# Run this script to quickly set up environment variables

echo "🚀 CampusFinds Environment Setup"
echo "=================================="
echo ""

# Check if frontend/.env exists
if [ ! -f "frontend/.env.local" ]; then
    echo "📝 Creating frontend/.env.local for local development..."
    cat > "frontend/.env.local" << EOF
# Local Development
VITE_API_URL=http://localhost:5000
EOF
    echo "✓ frontend/.env.local created"
else
    echo "✓ frontend/.env.local already exists"
fi

echo ""
echo "📋 Environment Setup Summary:"
echo "──────────────────────────────"
echo ""
echo "✓ Local Development:"
echo "  - Frontend runs on: http://localhost:3000"
echo "  - Backend on: http://localhost:5000"
echo "  - API calls use: VITE_API_URL=http://localhost:5000"
echo ""
echo "✓ Production (Vercel):"
echo "  - Frontend on: https://campusfinds.vercel.app"
echo "  - Backend on: https://campusfinds-major.onrender.com"
echo "  - Set in Vercel: VITE_API_URL=https://campusfinds-major.onrender.com"
echo ""
echo "📖 Next Steps:"
echo "──────────────"
echo "1. Start backend:   cd backend && npm run dev"
echo "2. Start frontend:  cd frontend && npm run dev"
echo "3. Open browser:    http://localhost:3000"
echo ""
echo "For Vercel deployment, see: VERCEL_DEPLOYMENT_GUIDE.md"
echo ""
