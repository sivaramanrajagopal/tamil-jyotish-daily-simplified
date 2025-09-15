#!/bin/bash

# Tamil Panchangam Calendar Sync - Production Deployment Script
echo "🚀 Deploying Tamil Panchangam Calendar Sync to Production..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if git is clean
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Warning: You have uncommitted changes. Please commit them first."
    echo "Run: git add . && git commit -m 'Your commit message'"
    exit 1
fi

echo "✅ Git repository is clean"

# Build the application
echo "🔨 Building the application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi

echo "✅ Build successful"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    echo "🎉 Deployment successful!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Set environment variables in Vercel dashboard:"
    echo "   - NEXT_PUBLIC_SUPABASE_URL=https://svrtefferaxnmmejwfdv.supabase.co"
    echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    echo "   - NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app"
    echo ""
    echo "2. Test your deployment:"
    echo "   - Visit your Vercel URL"
    echo "   - Test calendar sync functionality"
    echo "   - Check admin dashboard"
    echo ""
    echo "3. Update your domain (if you have a custom domain)"
    echo ""
    echo "🎊 Your Tamil Panchangam Calendar Sync is now live!"
else
    echo "❌ Deployment failed. Please check the errors above."
    exit 1
fi
