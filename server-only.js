// Server-only entry point for Vercel
const express = require('express');
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'dev-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: 'lax',
    domain: process.env.NODE_ENV === 'production' ? '.vercel.app' : 'localhost'
  },
  store: new MemoryStore({
    checkPeriod: 86400000 // prune expired entries every 24h
  })
};

app.use(session(sessionConfig));

// CORS configuration
app.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5000',
    'https://collect-topaz.vercel.app'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Import routes
const routes = require('./dist/routes.js');
app.use(routes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist/public')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/public', 'index.html'));
  });
}

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Only start server if not in serverless environment
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;