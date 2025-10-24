const { Client } = require('pg');

// Test different connection configurations
const configs = [
  {
    name: "Direct Connection",
    connectionString: 'postgresql://postgres:s3DrvDjukytv2AEB@db.fbvhaeqfylrdhvvdcwzh.supabase.co:5432/postgres'
  },
  {
    name: "Pooler Connection (5432)",
    connectionString: 'postgresql://postgres.fbvhaeqfylrdhvvdcwzh:s3DrvDjukytv2AEB@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres'
  },
  {
    name: "Pooler Connection (6543)",  
    connectionString: 'postgresql://postgres.fbvhaeqfylrdhvvdcwzh:s3DrvDjukytv2AEB@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres'
  },
  {
    name: "Transaction Pooler (6543)",
    connectionString: 'postgresql://postgres.fbvhaeqfylrdhvvdcwzh:s3DrvDjukytv2AEB@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true'
  }
];

async function testConnection(config) {
  const client = new Client({
    connectionString: config.connectionString,
    ssl: { rejectUnauthorized: false }
  });

  console.log(`\nTesting: ${config.name}`);
  console.log(`URL: ${config.connectionString.replace(/:[^@]+@/, ':****@')}`);
  
  try {
    await client.connect();
    const result = await client.query('SELECT NOW(), current_database(), current_user');
    console.log('✅ SUCCESS');
    console.log('Database:', result.rows[0].current_database);
    console.log('User:', result.rows[0].current_user);
    console.log('Time:', result.rows[0].now);
    
    // Test table access
    const tableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      LIMIT 5
    `);
    console.log('Tables found:', tableCheck.rows.map(r => r.table_name).join(', '));
    
    await client.end();
    return true;
  } catch (error) {
    console.log('❌ FAILED');
    console.log('Error:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('Testing database connections to new Supabase project...');
  
  for (const config of configs) {
    await testConnection(config);
  }
  
  console.log('\n\n=== SUMMARY ===');
  console.log('Production should use the Pooler Connection that works.');
  console.log('Make sure to set SSL in production environment.');
}

runTests();