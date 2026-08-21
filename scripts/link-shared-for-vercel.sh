#!/bin/bash
# Copy shared source to api/node_modules and point to server-only entry
set -e

rm -rf api/node_modules/@jsoft/shared
mkdir -p api/node_modules/@jsoft/shared
cp -r packages/shared/src api/node_modules/@jsoft/shared/src

# Create minimal package.json pointing to server entry
cat > api/node_modules/@jsoft/shared/package.json << 'PKGJSON'
{
  "name": "@jsoft/shared",
  "version": "0.0.0",
  "main": "./src/server.ts",
  "module": "./src/server.ts",
  "type": "module",
  "dependencies": {
    "zod": "*"
  }
}
PKGJSON

echo "✅ @jsoft/shared server entry linked for Vercel build"
