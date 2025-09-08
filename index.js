const express = require("express");
const session = require("express-session");
const passport = require("passport");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// CORS configuration
app.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:3000', 
    'http://localhost:5000',
    'https://collect-topaz.vercel.app',
    'https://collect-sigma.vercel.app',
    'https://collect.vercel.app'
  ];
  
  if (process.env.VERCEL_URL) {
    allowedOrigins.push(`https://${process.env.VERCEL_URL}`);
  }
  
  const origin = req.headers.origin;
  
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'sentence-collection-secret-key-2025',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: 'lax'
  },
  name: 'sessionId'
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Import compiled JavaScript files from dist
if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
  // Use pre-built dist files
  const { registerRoutes } = require("./dist/index.js");
  const server = registerRoutes(app);
} else {
  // For development, we'll need tsx or ts-node
  console.log("Development mode - please use 'npm run dev' instead");
}

// Serve uploaded files
app.use('/uploads', express.static('server/uploads'));

// Serve static files from public directory (Vercel standard)
app.use(express.static('public'));

// Serve client build files
if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
  app.use(express.static(path.join(__dirname, 'dist/public')));
  
  // Catch all routes and serve index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/public', 'index.html'));
  });
}

// Error handling middleware
app.use((err, _req, res, _next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  console.error('Express error:', err);
  
  if (!res.headersSent) {
    res.status(status).json({ 
      error: message,
      status: status 
    });
  }
});

// For local development
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Export for Vercel
module.exports = app;