import pg from 'pg';
import dotenv from 'dotenv';
import dns from 'dns';
import { promisify } from 'util';

const { Pool } = pg;
const resolve4 = promisify(dns.resolve4);

// Load environment variables
dotenv.config();

console.log('Testing Direct Database Connection with IPv4...');

async function getIPv4Address(hostname) {
  try {
    const addresses = await resolve4(hostname);
    return addresses[0];
  } catch (error) {
    console.error('DNS resolution failed:', error);
    return null;
  }
}

async function testConnection() {
  const hostname = 'db.fbvhaeqfylrdhvvdcwzh.supabase.co';
  const ipv4 = await getIPv4Address(hostname);
  
  if (!ipv4) {
    console.error('Could not resolve hostname to IPv4');
    return;
  }
  
  console.log(`Resolved ${hostname} to ${ipv4}`);
  
  // Use IPv4 address instead of hostname
  const databaseUrl = `postgresql://postgres:s3DrvDjukytv2AEB@${ipv4}:5432/postgres`;
  console.log('Connection URL:', databaseUrl.replace(/:[^@]+@/, ':****@'));
  
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false,
      servername: hostname // Important for SSL certificate validation
    }
  });

  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ Database connected successfully!');
    console.log('Server time:', result.rows[0].now);
    
    // Test table access
    try {
      const tableResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        LIMIT 5
      `);
      console.log('✅ Available tables:', tableResult.rows.map(r => r.table_name).join(', '));
    } catch (tableError) {
      console.log('⚠️ Could not list tables:', tableError.message);
    }
    
    client.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('\nFull error:', error);
  } finally {
    await pool.end();
  }
}

testConnection();