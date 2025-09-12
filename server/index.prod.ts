import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import passport from "passport";
import dotenv from "dotenv";
import { registerRoutes } from "./routes";
import { initializeGoogleOAuth } from "./auth";
import { storage } from "./storage";
import path from "path";
import MemoryStore from "memorystore";

// Load environment variables from .env file
dotenv.config();

const app = express();
const MemoryStoreConstructor = MemoryStore(session);

// CORS configuration
app.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:3000', 
    'http://localhost:5000',
    'https://collect-topaz.vercel.app'
  ];
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

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
const sessionConfig: session.SessionOptions = {
  secret: process.env.SESSION_SECRET || 'dev-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Allow cookies over HTTP for now
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    // Remove domain setting to let browser handle it automatically
  },
  store: new MemoryStoreConstructor({
    checkPeriod: 86400000 // prune expired entries every 24h
  })
};

app.use(session(sessionConfig));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Initialize Google OAuth
initializeGoogleOAuth();

// Storage is already initialized in storage.ts
console.log("Using storage instance from storage.ts");

// Register API routes
registerRoutes(app);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const publicPath = path.join(__dirname, 'public');
  app.use(express.static(publicPath));
  
  // Catch-all route for client-side routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
  });
}

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;

// Only start server if not in Vercel environment
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;