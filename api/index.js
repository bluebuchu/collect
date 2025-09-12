// Direct server import for Vercel - avoiding Vite issues
const path = require('path');

// Set NODE_ENV for production
process.env.NODE_ENV = 'production';

// Import the built server
const app = require('../dist/index.js');

// Export for Vercel
module.exports = app;