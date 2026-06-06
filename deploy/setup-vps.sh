#!/usr/bin/env bash
set -euo pipefail

DOMAIN="punto-zero.mx"
APP_DIR="/opt/punto-zero"
REPO="https://github.com/YOUR_ORG/punto-zero.git"

echo "=== Provisioning VPS for punto-zero ==="

# 1. Install dependencies
sudo apt-get update
sudo apt-get install -y docker.io docker-compose-v2 nginx certbot python3-certbot-nginx

# 2. Enable Docker
sudo systemctl enable --now docker

# 3. Clone app
sudo mkdir -p "$APP_DIR"
sudo git clone "$REPO" "$APP_DIR"

# 4. Create .env from template
sudo cp "$APP_DIR/.env.example" "$APP_DIR/server/.env"
sudo nano "$APP_DIR/server/.env"   # manual: fill secrets

# 5. Set up SSL with Let's Encrypt
sudo certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos -m admin@"$DOMAIN"

# 6. Copy site config
sudo cp "$APP_DIR/deploy/nginx/punto-zero.mx.conf" /etc/nginx/sites-available/
sudo ln -sf /etc/nginx/sites-available/punto-zero.mx.conf /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

# 7. Start application
cd "$APP_DIR"
sudo docker compose up -d --build

echo "=== Provisioning complete ==="
echo "App should be available at https://$DOMAIN"
