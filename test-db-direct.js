import pg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pg;

// Load environment variables
dotenv.config();

const databaseUrl = process.env.SUPABASE_DATABASE_URL;

console.log('Testing Direct Database Connection...');
console.log('Database URL:', databaseUrl?.replace(/:[^@]+@/, ':****@')); // Hide password

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false
  }
});

async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ Database connected successfully!');
    console.log('Server time:', result.rows[0].now);
    client.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('\nFull error:', error);
  } finally {
    await pool.end();
  }
}

testConnection();