// Vercel serverless function handler
export default async function handler(req, res) {
  // Dynamic import to avoid build issues
  const { default: app } = await import('../dist/index.js');
  
  // Handle the request with Express app
  return app(req, res);
}