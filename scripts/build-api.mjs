import { build } from 'esbuild';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

await build({
  entryPoints: [resolve(__dirname, '../api/src/index.ts')],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  outfile: resolve(__dirname, '../api/dist/index.mjs'),
  sourcemap: true,
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  alias: {
    '@jsoft/shared': resolve(__dirname, '../packages/shared/src/server.ts'),
  },
  external: [
    '@prisma/client',
    '@prisma/client/*',
  ],
  logLevel: 'info',
});

console.log('✅ API bundled successfully to api/dist/index.mjs');
