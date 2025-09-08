const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const session = require("express-session");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
  console.error('Please set these variables in Vercel Dashboard > Settings > Environment Variables');
  if (process.env.VERCEL) {
    console.error('Running on Vercel but environment variables are not configured!');
  }
}

// Import database
const { createClient } = require("@supabase/supabase-js");

// Initialize Supabase with fallback values for development
const supabaseUrl = process.env.SUPABASE_URL || 'https://upemqhahrliikgtqqeor.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZW1xaGFocmxpaWtndHFxZW9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MjMwODUsImV4cCI6MjA3MjE5OTA4NX0.d64QdZZnEcgAg0ncVh2SpiFUBERcRU6_NQrUeLT817s';

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'undefined' || supabaseAnonKey === 'undefined') {
  console.error('⚠️ Supabase configuration is missing or invalid!');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🚀 Server starting with configuration:');
console.log('- Environment:', process.env.NODE_ENV || 'development');
console.log('- Vercel:', process.env.VERCEL ? 'Yes' : 'No');
console.log('- Supabase URL:', supabaseUrl ? '✅ Configured' : '❌ Missing');

// Create Express app
const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Security headers
app.use((req, res, next) => {
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

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

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'sentence-collection-secret-key-2025',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: 'lax'
  },
  name: 'sessionId'
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    vercel: !!process.env.VERCEL,
    supabase: {
      url: process.env.SUPABASE_URL ? 'configured' : 'missing',
      key: process.env.SUPABASE_ANON_KEY ? 'configured' : 'missing'
    }
  };
  
  // Test Supabase connection
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    health.database = error ? `error: ${error.message}` : 'connected';
  } catch (err) {
    health.database = `error: ${err.message}`;
  }
  
  res.json(health);
});

// Environment configuration diagnostic endpoint (development only)
app.get('/api/env-check', (req, res) => {
  if (process.env.NODE_ENV === 'production' && !req.query.debug) {
    return res.status(404).json({ error: 'Not found' });
  }
  
  const envStatus = {
    required: {
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
      SESSION_SECRET: !!process.env.SESSION_SECRET,
    },
    optional: {
      NODE_ENV: process.env.NODE_ENV || 'not set',
      VERCEL: !!process.env.VERCEL,
      VERCEL_URL: process.env.VERCEL_URL || 'not set',
      PORT: process.env.PORT || 'not set'
    },
    message: 'If any required variables are false, set them in Vercel Dashboard > Settings > Environment Variables'
  };
  
  res.json(envStatus);
});

// Auth endpoints
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Check if Supabase is properly configured
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      console.error('Registration failed: Supabase not configured');
      return res.status(503).json({ 
        error: 'Service temporarily unavailable. Database configuration missing.',
        details: 'Please configure environment variables in Vercel Dashboard'
      });
    }
    
    // Create user in database
    const { data, error } = await supabase
      .from('users')
      .insert([{ 
        username, 
        email, 
        password: hashedPassword,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Registration error:', error);
      if (error.code === '23505') {
        return res.status(409).json({ error: 'User already exists' });
      }
      return res.status(500).json({ error: 'Registration failed' });
    }
    
    // Generate token
    const token = jwt.sign(
      { id: data.id, username: data.username },
      process.env.SESSION_SECRET || 'secret',
      { expiresIn: '7d' }
    );
    
    res.json({ 
      user: { id: data.id, username: data.username, email: data.email },
      token 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    // Check if Supabase is properly configured
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      console.error('Login failed: Supabase not configured');
      return res.status(503).json({ 
        error: 'Service temporarily unavailable. Database configuration missing.',
        details: 'Please configure environment variables in Vercel Dashboard'
      });
    }
    
    // Find user
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.SESSION_SECRET || 'secret',
      { expiresIn: '7d' }
    );
    
    res.json({ 
      user: { id: user.id, username: user.username, email: user.email },
      token 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.SESSION_SECRET || 'secret');
    
    // Get user from database
    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, email, profile_image_url')
      .eq('id', decoded.id)
      .single();
    
    if (error || !user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Auth check error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Communities endpoints
app.get('/api/communities/all', async (req, res) => {
  try {
    const { data: communities, error } = await supabase
      .from('communities')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (error) {
      console.error('Communities fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch communities' });
    }
    
    res.json({ 
      communities: communities || [],
      total: communities?.length || 0
    });
  } catch (error) {
    console.error('Communities error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Sentences endpoints
app.get('/api/sentences', async (req, res) => {
  try {
    const { data: sentences, error } = await supabase
      .from('sentences')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) {
      console.error('Sentences fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch sentences' });
    }
    
    res.json({ 
      sentences: sentences || [],
      total: sentences?.length || 0
    });
  } catch (error) {
    console.error('Sentences error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/sentences', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.SESSION_SECRET || 'secret');
    
    const { content, bookTitle, author, page } = req.body;
    
    if (!content || !bookTitle) {
      return res.status(400).json({ error: 'Content and book title are required' });
    }
    
    const { data, error } = await supabase
      .from('sentences')
      .insert([{
        content,
        book_title: bookTitle,
        author,
        page_number: page,
        user_id: decoded.id,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Sentence creation error:', error);
      return res.status(500).json({ error: 'Failed to create sentence' });
    }
    
    res.json(data);
  } catch (error) {
    console.error('Sentence creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Books endpoints
app.get('/api/books/search', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    // For now, return empty results (Aladin API integration needed)
    res.json({ 
      books: [],
      message: 'Book search API integration pending'
    });
  } catch (error) {
    console.error('Book search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
  const publicPath = path.join(__dirname, 'dist', 'public');
  app.use(express.static(publicPath));
  
  app.get('*', (req, res) => {
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