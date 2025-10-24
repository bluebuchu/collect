const { Pool } = require('pg');
require('dotenv').config();

async function testPoolerConnection() {
  console.log('Testing Supabase Pooler Connection with IPv4...\n');
  
  // Extract password from env
  const dbUrl = process.env.SUPABASE_DATABASE_URL;
  const password = dbUrl ? dbUrl.match(/:([^@]+)@/)?.[1] : 's3DrvDjukytv2AEB';
  
  const configs = [
    {
      name: "Session Pooler (port 5432)",
      connectionString: `postgresql://postgres.fbvhaeqfylrdhvvdcwzh:${password}@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres`
    },
    {
      name: "Transaction Pooler (port 6543)",  
      connectionString: `postgresql://postgres.fbvhaeqfylrdhvvdcwzh:${password}@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres`
    },
    {
      name: "Transaction Pooler with PgBouncer",
      connectionString: `postgresql://postgres.fbvhaeqfylrdhvvdcwzh:${password}@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true`
    }
  ];

  for (const config of configs) {
    console.log(`Testing: ${config.name}`);
    console.log(`URL: ${config.connectionString.replace(/:([^@]+)@/, ':****@')}`);
    
    const pool = new Pool({
      connectionString: config.connectionString,
      ssl: { rejectUnauthorized: false }
    });

    try {
      const client = await pool.connect();
      const result = await client.query('SELECT NOW(), current_database()');
      console.log('✅ SUCCESS!');
      console.log('  Time:', result.rows[0].now);
      console.log('  Database:', result.rows[0].current_database);
      
      // Try to list tables
      const tablesResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        LIMIT 5
      `);
      
      if (tablesResult.rows.length > 0) {
        console.log('  Tables:', tablesResult.rows.map(r => r.table_name).join(', '));
      } else {
        console.log('  No tables found (run migrations)');
      }
      
      client.release();
      console.log('\n✨ Found working connection! Use this in .env:');
      console.log(`SUPABASE_DATABASE_URL=${config.connectionString}\n`);
      await pool.end();
      return true;
    } catch (error) {
      console.log('❌ FAILED:', error.message, '\n');
      await pool.end();
    }
  }
  
  console.log('All connection attempts failed.');
  return false;
}

testPoolerConnection();