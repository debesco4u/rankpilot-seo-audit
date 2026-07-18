#!/bin/bash
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
echo "=== Installing server deps ==="
cd "$DIR/server" && npm install && npx tsc
echo "=== Installing client deps ==="
cd "$DIR/client" && npm install && npx vite build
echo "=== Copying client build ==="
cp -r "$DIR/client/dist" "$DIR/server/dist/public"
echo "=== Build complete ==="
