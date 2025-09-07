import { getDb, schema } from '../lib/db.js';
import { setCorsHeaders } from '../lib/cors.js';
import { eq, desc } from 'drizzle-orm';

export default async function handler(req, res) {
  setCorsHeaders(req, res);
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const db = getDb();
    
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
    
    res.status(200).json(sentences);
  } catch (error) {
    console.error('Error fetching sentences:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}