#!/bin/bash
set -euo pipefail

APP_ROOT="$(pwd)"

echo "Deploying StateMint with PM2 + Nginx..."

# Update system
apt update
apt upgrade -y

# Install runtime dependencies
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs nginx

# Install PM2 for process management
npm install -g pm2

# Build application (prebuild + build + postbuild)
npm ci
npm run build

# Restart PM2 process
pm2 stop all || true
pm2 delete all || true
pm2 start ecosystem.config.js --update-env
pm2 save
pm2 startup

# Configure Nginx as reverse proxy and static asset server
NGINX_TEMPLATE="$APP_ROOT/scripts/nginx-statemint.conf.template"
if [ -f "$NGINX_TEMPLATE" ]; then
  sed "s|__APP_ROOT__|$APP_ROOT|g" "$NGINX_TEMPLATE" > /etc/nginx/sites-available/statemint
  ln -sfn /etc/nginx/sites-available/statemint /etc/nginx/sites-enabled/statemint
  rm -f /etc/nginx/sites-enabled/default
  nginx -t
  systemctl enable nginx
  systemctl restart nginx
else
  echo "Nginx template not found at $NGINX_TEMPLATE. Skipping Nginx setup."
fi

echo "Deployment complete."
echo "App process: pm2 status"
echo "Nginx status: systemctl status nginx"
