// Build script for Vercel deployment
// Bundles the API with esbuild, resolving @jsoft/shared via symlink
import { build } from 'esbuild';
import { execSync } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// Step 1: Build shared package
console.log('🔧 Building @jsoft/shared...');
execSync('cd packages/shared && pnpm build', { cwd: root, stdio: 'inherit' });

// Step 2: Generate Prisma Client
console.log('🔧 Generating Prisma Client...');
execSync('cd api && npx prisma generate', { cwd: root, stdio: 'inherit' });

// Step 3: Bundle API with esbuild
console.log('🔧 Bundling API with esbuild...');

const sharedPath = resolve(root, 'packages/shared/src/server.ts');

if (!existsSync(sharedPath)) {
  console.error('❌ shared/src/server.ts not found at', sharedPath);
  process.exit(1);
}

const result = await build({
  entryPoints: [resolve(root, 'api/src/index.ts')],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'cjs',
  outfile: resolve(root, 'api/dist/index.cjs'),
  sourcemap: true,
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  alias: {
    '@jsoft/shared': sharedPath,
  },
  external: [
    '@prisma/client',
    '@prisma/client/*',
    'bcrypt',
    'mock-aws-s3',
    'aws-sdk',
    'nock',
  ],
  logLevel: 'info',
  loader: {
    '.html': 'text',
  },
});

console.log('✅ API bundled successfully!');
console.log('   Output: api/dist/index.cjs');
