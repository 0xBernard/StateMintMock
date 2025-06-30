#!/bin/bash

# Simple DigitalOcean Deployment for StateMint
echo "🚀 Deploying StateMint to DigitalOcean..."

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
echo "🔨 Building application..."
npm ci
npm run build

# Create PM2 ecosystem file
echo "⚙️  Setting up PM2 configuration..."
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'statemint-app',
    script: 'npm',
    args: 'run start:production',
    cwd: process.cwd(),
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 80
    }
  }]
}
EOF

# Stop any existing PM2 processes
echo "🔄 Stopping existing processes..."
pm2 stop all || true
pm2 delete all || true

# Start the application with PM2
echo "🚀 Starting application..."
pm2 start ecosystem.config.js

# Save PM2 configuration and setup startup
echo "⚙️  Setting up auto-start..."
pm2 save
pm2 startup

echo "✅ Deployment complete!"
echo "🌐 Your app is now running on port 80"
echo "📊 Use these commands to manage your app:"
echo "   pm2 status          - Check app status"
echo "   pm2 logs            - View logs"
echo "   pm2 restart all     - Restart app"
echo "   pm2 stop all        - Stop app" 