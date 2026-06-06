// Vercel serverless entry point (CommonJS)
// Dynamically import the ESM Express app
let app;

async function init() {
  if (!app) {
    const mod = await import('./dist/index.js');
    app = mod.default;
  }
  return app;
}

// Vercel Lambda handler
module.exports = async (req, res) => {
  const expressApp = await init();
  expressApp(req, res);
};
