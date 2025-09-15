@echo off
echo 🚀 Setting up Tamil Panchangam Calendar Sync...

echo 📝 Creating .env.local file...
(
echo NEXT_PUBLIC_SUPABASE_URL=https://svrtefferaxnmmejwfdv.supabase.co
echo NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2cnRlZmZlcmF4bm1tZWp3ZmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNzg5NjQsImV4cCI6MjA2NDc1NDk2NH0.w3m5Vo_q_-QASqzL-k-iWWGYZWG0maqiNzsLHL9aJ7Y
echo NEXT_PUBLIC_SITE_URL=http://localhost:3000
) > .env.local

echo ✅ .env.local file created!

if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
) else (
    echo ✅ Dependencies already installed
)

if exist ".env.local" (
    echo ✅ Environment variables set up successfully!
    echo 📋 Contents of .env.local:
    type .env.local
) else (
    echo ❌ Failed to create .env.local file
    pause
    exit /b 1
)

echo.
echo 🎉 Setup complete! Now you can run:
echo    npm run dev
echo.
echo Then open: http://localhost:3000
echo.
echo 📅 Calendar Sync features will be available at:
echo    - Main page: http://localhost:3000
echo    - Test page: http://localhost:3000/calendar-test
echo    - Sample ICS: http://localhost:3000/api/calendar/test-sample
pause
