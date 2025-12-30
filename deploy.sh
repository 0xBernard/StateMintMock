#!/bin/bash

# StateMint PM2 Deployment Script
echo "🚀 Deploying StateMint with PM2..."

# Update system
echo "📦 Updating system..."
apt update && apt upgrade -y

# Install Node.js 18 (if not installed)
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Install PM2 for process management
echo "📦 Installing PM2..."
npm install -g pm2

# Install dependencies and build
# This now automatically:
# 1. Runs prebuild (optimize-images.js) - generates optimized images
# 2. Runs next build
# 3. Runs postbuild (copy-standalone-assets.js) - copies to standalone
echo "🔨 Building application..."
npm ci
npm run build

# Stop any existing PM2 processes
echo "🔄 Stopping existing processes..."
pm2 stop all || true
pm2 delete all || true

# Start the application with PM2 (uses standalone server for better memory efficiency)
echo "🚀 Starting application..."
pm2 start ecosystem.config.js

# Save PM2 configuration and setup startup
echo "⚙️  Setting up auto-start..."
pm2 save
pm2 startup

echo "✅ Deployment complete!"
echo "🌐 Your app is now running on port 3000"
echo "📊 Use these commands to manage your app:"
echo "   pm2 status          - Check app status"
echo "   pm2 logs            - View logs"
echo "   pm2 restart all     - Restart app"
echo "   pm2 stop all        - Stop app"
echo ""
echo "💡 Memory management:"
echo "   pm2 monit           - Monitor memory usage"
echo "   Server uses max 384MB heap, restarts at 512MB total" 