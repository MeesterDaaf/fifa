#!/bin/bash
# FIFA 2026 Pool — Deploy script voor eigen server
# Gebruik: ./deploy.sh

set -e

echo "🚀 FIFA 2026 Pool deployen..."

# 1. Laatste code ophalen
git pull origin main

# 2. Dependencies installeren
npm ci

# 3. Prisma client genereren + database migreren (SQLite)
npx prisma generate
npx prisma db push

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
