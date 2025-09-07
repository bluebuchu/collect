import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../../shared/schema.js';

let db = null;

export function getDb() {
  if (!db) {
    const connectionString = process.env.SUPABASE_DATABASE_URL;
    
    if (!connectionString) {
      throw new Error('SUPABASE_DATABASE_URL is not set');
    }
    
    const client = postgres(connectionString, {
      prepare: false,
      connect_timeout: 10,
      idle_timeout: 20,
      max_lifetime: 60 * 30,
    });
    
    db = drizzle(client, { schema });
  }
  
  return db;
}

export { schema };