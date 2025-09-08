const express = require("express");
const path = require("path");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Test endpoint for communities
app.get('/api/communities/all', (req, res) => {
  // Return mock data for now to test deployment
  res.json({
    communities: [],
    total: 0,
    message: "Database connection not configured in this simplified version"
  });
});

// Test endpoint for sentences
app.get('/api/sentences', (req, res) => {
  res.json({
    sentences: [],
    total: 0,
    message: "Database connection not configured in this simplified version"
  });
});

// Auth endpoints
app.post('/api/auth/login', (req, res) => {
  res.status(503).json({ 
    error: "Authentication service temporarily unavailable",
    message: "Please use the full application with database connection"
  });
});

app.get('/api/auth/me', (req, res) => {
  res.status(401).json({ 
    error: "Not authenticated",
    message: "Authentication requires database connection"
  });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
  // Serve client build files
  const publicPath = path.join(__dirname, 'dist', 'public');
  app.use(express.static(publicPath));
  
  // Catch all routes and serve index.html for client-side routing
  app.get('*', (req, res) => {
    // Skip API routes
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    
    const indexPath = path.join(publicPath, 'index.html');
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error('Error serving index.html:', err);
        res.status(500).send('Error loading application');
      }
    });
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
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

// For local development only
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Export for Vercel
module.exports = app;