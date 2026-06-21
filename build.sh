#!/bin/bash
set -e
echo "==> Installing client dependencies..."
npm install --prefix client
echo "==> Building client..."
npm run build --prefix client
echo "==> Installing server dependencies..."
npm install --prefix server
echo "==> Building server..."
npm run build --prefix server
echo "==> Build complete!"
