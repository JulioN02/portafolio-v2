// Vercel serverless entry point (CommonJS)
// Directly re-export the Express app from the ESM dist
import('./dist/index.js').then(mod => {
  module.exports = mod.default;
});
