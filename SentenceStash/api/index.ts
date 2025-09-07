import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import passport from "passport";
import dotenv from "dotenv";
import { registerRoutes } from "../server/routes";
import { initializeGoogleOAuth } from "../server/auth";

// Load environment variables
dotenv.config();

const app = express();

// CORS configuration for production
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // In production, allow your actual domain
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
    'https://your-domain.vercel.app',
    'https://your-custom-domain.com'
  ];
  
  if (origin && (allowedOrigins.includes(origin) || allowedOrigins.includes('*'))) {
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
  secret: process.env.SESSION_SECRET || 'fallback-secret-change-this',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true, // Always true in production
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

// Register API routes
registerRoutes(app);

// Serve static files from the build directory
app.use(express.static('dist/public'));

// Catch-all route for client-side routing
app.get('*', (req, res) => {
  res.sendFile('index.html', { root: 'dist/public' });
});

// Error handling
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Server error:', err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ error: message });
});

// Export for Vercel
export default app;