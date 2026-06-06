// Vercel serverless entry point
// CommonJS wrapper for the ESM Express app
async function createHandler() {
  const { default: app } = await import('./dist/index.js');
  return app;
}

const appPromise = createHandler();

// Vercel serverless handler
module.exports = async (req, res) => {
  const app = await appPromise;
  return app(req, res);
};
