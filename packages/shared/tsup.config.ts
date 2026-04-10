import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['zod', 'react', 'react-dom', 'react-router-dom'],
  outDir: 'dist',
  mainFields: ['module', 'main'],
  platform: 'neutral',
  loader: {
    '.css': 'css',
  },
});
