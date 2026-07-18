#!/bin/bash
set -e
echo "=== Installing server deps ==="
cd server && npm install && npx tsc && cd ..
echo "=== Installing client deps ==="
cd client && npm install && npx vite build && cd ..
echo "=== Copying client build ==="
cp -r client/dist server/dist/public
echo "=== Build complete ==="
