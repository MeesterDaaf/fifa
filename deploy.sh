#!/bin/bash
# FIFA 2026 Pool — Deploy script voor eigen server
# Gebruik: ./deploy.sh

set -e

echo "🚀 FIFA 2026 Pool deployen..."

# Lokale prisma binary (vermijdt conflicten met globaal geïnstalleerde versies)
PRISMA="./node_modules/.bin/prisma"

# 1. Laatste code ophalen
git pull origin main

# 2. Dependencies installeren zonder postinstall (vermijdt conflict met globale Prisma 7)
npm ci --ignore-scripts

# Prisma client genereren met lokale versie
./node_modules/.bin/prisma generate

# 3. Database schema bijwerken (SQLite)
$PRISMA db push

# 4. App bouwen
npm run build

# 5. PM2 herstarten (of opstarten als het de eerste keer is)
if pm2 list | grep -q "fifa-pool"; then
  pm2 restart fifa-pool
else
  pm2 start npm --name "fifa-pool" -- start
  pm2 save
fi

echo "✅ Deploy klaar!"
