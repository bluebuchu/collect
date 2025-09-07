import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import passport from "passport";
import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../shared/schema";
import bcrypt from "bcrypt";
import { eq, and, desc, sql, or } from "drizzle-orm";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

// Load environment variables
dotenv.config();

const app = express();

// Database connection
const connectionString = process.env.SUPABASE_DATABASE_URL;
if (!connectionString) {
  console.error("SUPABASE_DATABASE_URL is not set");
}

const client = postgres(connectionString || "", {
  prepare: false,
  connect_timeout: 10,
  idle_timeout: 20,
  max_lifetime: 60 * 30,
});

const db = drizzle(client, { schema });

// CORS configuration
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Allow Vercel domains and configured origins
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
  
  // Always allow Vercel preview and production domains
  const isVercelDomain = origin && (
    origin.includes('.vercel.app') || 
    origin.includes('.vercel.sh') ||
    origin === 'http://localhost:5173' ||
    origin === 'http://localhost:3000'
  );
  
  if (origin && (allowedOrigins.includes(origin) || allowedOrigins.includes('*') || isVercelDomain)) {
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

// Session configuration - simplified for serverless
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret-change-this',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  },
  name: 'sessionId'
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Passport serialization
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const [user] = await db
      .select({
        id: schema.users.id,
        email: schema.users.email,
        username: schema.users.username,
        role: schema.users.role,
      })
      .from(schema.users)
      .where(eq(schema.users.id, id));
    
    done(null, user || null);
  } catch (error) {
    done(error, null);
  }
});

// Local Strategy
passport.use(new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    try {
      const [user] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, email));

      if (!user) {
        return done(null, false, { message: 'Invalid email or password' });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return done(null, false, { message: 'Invalid email or password' });
      }

      return done(null, {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      });
    } catch (error) {
      return done(error);
    }
  }
));

// Google OAuth Strategy (if configured)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_REDIRECT_URI || "/api/auth/google/callback",
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;
      if (!email) {
        return done(new Error('No email found in Google profile'));
      }

      let [user] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, email));

      if (!user) {
        // Create new user
        const [newUser] = await db
          .insert(schema.users)
          .values({
            email,
            username: profile.displayName || email.split('@')[0],
            password: '', // OAuth users don't have passwords
            role: 'user',
            googleId: profile.id,
          })
          .returning();
        user = newUser;
      }

      return done(null, {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      });
    } catch (error) {
      return done(error as Error);
    }
  }));
}

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;

    // Check if user exists
    const [existingUser] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email));

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const [newUser] = await db
      .insert(schema.users)
      .values({
        email,
        password: hashedPassword,
        username,
        role: 'user',
      })
      .returning();

    // Log in the user
    req.login({
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
      role: newUser.role,
    }, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to log in after registration' });
      }
      res.json({ 
        user: {
          id: newUser.id,
          email: newUser.email,
          username: newUser.username,
          role: newUser.role,
        }
      });
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

app.post('/api/auth/login', (req, res, next) => {
  passport.authenticate('local', (err: any, user: any, info: any) => {
    if (err) {
      return res.status(500).json({ error: 'Authentication error' });
    }
    if (!user) {
      return res.status(401).json({ error: info?.message || 'Invalid credentials' });
    }
    req.login(user, (loginErr) => {
      if (loginErr) {
        return res.status(500).json({ error: 'Login failed' });
      }
      res.json({ user });
    });
  })(req, res, next);
});

app.post('/api/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

app.get('/api/auth/me', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json({ user: req.user });
});

// Sentences Routes
app.get('/api/sentences', async (req, res) => {
  try {
    const sentences = await db
      .select({
        id: schema.sentences.id,
        content: schema.sentences.content,
        translation: schema.sentences.translation,
        bookTitle: schema.sentences.bookTitle,
        bookAuthor: schema.sentences.bookAuthor,
        pageNumber: schema.sentences.pageNumber,
        createdAt: schema.sentences.createdAt,
        userId: schema.sentences.userId,
        username: schema.users.username,
      })
      .from(schema.sentences)
      .leftJoin(schema.users, eq(schema.sentences.userId, schema.users.id))
      .orderBy(desc(schema.sentences.createdAt));

    res.json(sentences);
  } catch (error) {
    console.error('Error fetching sentences:', error);
    res.status(500).json({ error: 'Failed to fetch sentences' });
  }
});

app.post('/api/sentences', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const { content, translation, bookTitle, bookAuthor, pageNumber } = req.body;
    const userId = (req.user as any).id;

    const [sentence] = await db
      .insert(schema.sentences)
      .values({
        content,
        translation,
        bookTitle,
        bookAuthor,
        pageNumber,
        userId,
      })
      .returning();

    res.json(sentence);
  } catch (error) {
    console.error('Error creating sentence:', error);
    res.status(500).json({ error: 'Failed to create sentence' });
  }
});

app.put('/api/sentences/:id', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const { id } = req.params;
    const { content, translation, bookTitle, bookAuthor, pageNumber } = req.body;
    const userId = (req.user as any).id;

    // Check ownership
    const [existing] = await db
      .select()
      .from(schema.sentences)
      .where(eq(schema.sentences.id, id));

    if (!existing || existing.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const [updated] = await db
      .update(schema.sentences)
      .set({
        content,
        translation,
        bookTitle,
        bookAuthor,
        pageNumber,
        updatedAt: new Date(),
      })
      .where(eq(schema.sentences.id, id))
      .returning();

    res.json(updated);
  } catch (error) {
    console.error('Error updating sentence:', error);
    res.status(500).json({ error: 'Failed to update sentence' });
  }
});

app.delete('/api/sentences/:id', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const { id } = req.params;
    const userId = (req.user as any).id;
    const userRole = (req.user as any).role;

    // Check ownership or admin
    const [existing] = await db
      .select()
      .from(schema.sentences)
      .where(eq(schema.sentences.id, id));

    if (!existing || (existing.userId !== userId && userRole !== 'admin')) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await db
      .delete(schema.sentences)
      .where(eq(schema.sentences.id, id));

    res.json({ message: 'Sentence deleted' });
  } catch (error) {
    console.error('Error deleting sentence:', error);
    res.status(500).json({ error: 'Failed to delete sentence' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Server error:', err);
  console.error('Error stack:', err.stack);
  console.error('Request URL:', req.url);
  console.error('Request method:', req.method);
  
  const status = err.status || err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? "Internal Server Error" 
    : err.message || "Internal Server Error";
    
  res.status(status).json({ error: message });
});

// Export for Vercel
export default app;