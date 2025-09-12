// Direct server import for Vercel - avoiding Vite issues
const path = require('path');

// Set NODE_ENV for production
process.env.NODE_ENV = 'production';

// Import the production server build (without Vite)
const app = require('../dist/index.prod.js');

// Export for Vercel
module.exports = app;