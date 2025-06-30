#!/bin/bash

# StateMint Next.js Deployment Script
echo "🚀 Starting StateMint deployment..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js (if not already installed)
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Nginx (if not already installed)
echo "📦 Installing Nginx..."
sudo apt install nginx -y

# Install dependencies and build the app
echo "🔨 Installing dependencies and building app..."
npm ci
npm run build

# Copy Nginx configuration
echo "⚙️  Setting up Nginx configuration..."
sudo cp nginx.conf /etc/nginx/sites-available/statemint
sudo ln -sf /etc/nginx/sites-available/statemint /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
echo "🧪 Testing Nginx configuration..."
sudo nginx -t

# Copy systemd service file
echo "⚙️  Setting up systemd service..."
sudo cp statemint-app.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable statemint-app

# Start services
echo "🚀 Starting services..."
sudo systemctl start statemint-app
sudo systemctl reload nginx

# Show status
echo "📊 Service Status:"
sudo systemctl status statemint-app --no-pager
sudo systemctl status nginx --no-pager

echo "✅ Deployment complete!"
echo "🌐 Your app should now be available on port 80"
echo "📝 Don't forget to:"
echo "   1. Update the domain in nginx.conf"
echo "   2. Update the WorkingDirectory in statemint-app.service"
echo "   3. Configure SSL certificate for HTTPS" 