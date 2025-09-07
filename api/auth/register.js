import { getDb, schema } from '../lib/db.js';
import { hashPassword, generateToken } from '../lib/auth.js';
import { setCorsHeaders } from '../lib/cors.js';
import { eq } from 'drizzle-orm';

export default async function handler(req, res) {
  setCorsHeaders(req, res);
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { email, password, username } = req.body;
    
    if (!email || !password || !username) {
      return res.status(400).json({ error: 'Email, password, and username are required' });
    }
    
    const db = getDb();
    
    // Check if user already exists
    const [existingUser] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email));
    
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    
    const [newUser] = await db
      .insert(schema.users)
      .values({
        email,
        password: hashedPassword,
        username,
        role: 'user',
      })
      .returning();
    
    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
      role: newUser.role,
    });
    
    res.status(201).json({
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        role: newUser.role,
      },
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}