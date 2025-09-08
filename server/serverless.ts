import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import passport from "passport";
import dotenv from "dotenv";
import { registerRoutes } from "./routes";
import { serveStatic } from "./vite";
import { initializeGoogleOAuth } from "./auth";

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
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null
  ].filter(Boolean);
  
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

// Initialize Google OAuth
initializeGoogleOAuth();

// Register API routes (synchronously for serverless)
const server = registerRoutes(app);

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Always send JSON response for errors
  if (!res.headersSent) {
    res.status(status).json({ 
      error: message,
      status: status 
    });
  }
  console.error('Express error:', err);
});

// Serve static files in production
if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
  serveStatic(app);
}

// Export the Express app for serverless
export default app;