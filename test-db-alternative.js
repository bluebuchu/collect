import pg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pg;

// Load environment variables
dotenv.config();

// Try different connection string formats
const configs = [
  {
    name: "Direct connection (port 5432)",
    url: `postgresql://postgres.khxrgdkgwirkzkfkueka:s3DrvDjukytv2AEB@db.khxrgdkgwirkzkfkueka.supabase.co:5432/postgres`
  },
  {
    name: "Pooler connection (port 6543)",
    url: `postgresql://postgres.khxrgdkgwirkzkfkueka:s3DrvDjukytv2AEB@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres`
  },
  {
    name: "Transaction pooler (port 6543)",
    url: `postgresql://postgres.khxrgdkgwirkzkfkueka:s3DrvDjukytv2AEB@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true`
  },
  {
    name: "Session pooler (port 5432)",
    url: `postgresql://postgres.khxrgdkgwirkzkfkueka:s3DrvDjukytv2AEB@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres`
  }
];

async function testConnection(config) {
  console.log(`\nTesting: ${config.name}`);
  console.log(`URL: ${config.url.replace(/:[^@]+@/, ':****@')}`);
  
  const pool = new Pool({
    connectionString: config.url,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ SUCCESS! Connected at:', result.rows[0].now);
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Failed:', error.message);
    return false;
  } finally {
    await pool.end();
  }
}

async function testAll() {
  console.log('Testing different Supabase connection formats...');
  
  for (const config of configs) {
    const success = await testConnection(config);
    if (success) {
      console.log('\n🎉 Found working connection!');
      console.log('Use this format in your .env file:');
      console.log(`SUPABASE_DATABASE_URL=${config.url}`);
      break;
    }
  }
}

testAll();