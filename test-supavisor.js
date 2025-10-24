const { Client } = require('pg');
require('dotenv').config();

async function testSupavisorConnections() {
  console.log('Testing Supabase Supavisor (2024 Format) Connections...\n');
  
  const projectId = 'fbvhaeqfylrdhvvdcwzh';
  const password = 's3DrvDjukytv2AEB';
  
  // Test different server and region combinations
  const configs = [
    {
      name: "Session Mode - aws-0-ap-northeast-2 (port 5432)",
      connectionString: `postgresql://postgres.${projectId}:${password}@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres`
    },
    {
      name: "Transaction Mode - aws-0-ap-northeast-2 (port 6543)",
      connectionString: `postgresql://postgres.${projectId}:${password}@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres`
    },
    {
      name: "Session Mode - aws-1-ap-northeast-2 (port 5432)",
      connectionString: `postgresql://postgres.${projectId}:${password}@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres`
    },
    {
      name: "Transaction Mode - aws-1-ap-northeast-2 (port 6543)",
      connectionString: `postgresql://postgres.${projectId}:${password}@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres`
    },
    {
      name: "Session Mode - aws-0-us-west-1 (port 5432)",
      connectionString: `postgresql://postgres.${projectId}:${password}@aws-0-us-west-1.pooler.supabase.com:5432/postgres`
    },
    {
      name: "Transaction Mode - aws-0-us-west-1 (port 6543)",
      connectionString: `postgresql://postgres.${projectId}:${password}@aws-0-us-west-1.pooler.supabase.com:6543/postgres`
    }
  ];

  let successfulConnection = null;

  for (const config of configs) {
    console.log(`Testing: ${config.name}`);
    console.log(`URL: ${config.connectionString.replace(/:([^@]+)@/, ':****@')}`);
    
    const client = new Client({
      connectionString: config.connectionString,
      ssl: { rejectUnauthorized: false }
    });

    try {
      await client.connect();
      const result = await client.query('SELECT NOW(), current_database(), current_user');
      console.log('✅ SUCCESS!');
      console.log('  Time:', result.rows[0].now);
      console.log('  Database:', result.rows[0].current_database);
      console.log('  User:', result.rows[0].current_user);
      
      // Try to list tables
      try {
        const tablesResult = await client.query(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          LIMIT 5
        `);
        
        if (tablesResult.rows.length > 0) {
          console.log('  Tables:', tablesResult.rows.map(r => r.table_name).join(', '));
        } else {
          console.log('  No tables found (need to run migrations)');
        }
      } catch (tableError) {
        console.log('  Table query error:', tableError.message);
      }
      
      await client.end();
      
      if (!successfulConnection) {
        successfulConnection = config.connectionString;
      }
      
      console.log('\n✨ WORKING CONNECTION FOUND!\n');
    } catch (error) {
      console.log('❌ FAILED:', error.message, '\n');
      try {
        await client.end();
      } catch (e) {}
    }
  }
  
  if (successfulConnection) {
    console.log('=' .repeat(60));
    console.log('🎉 SUCCESS! Use this connection string in your .env files:');
    console.log('=' .repeat(60));
    console.log(`\nSUPABASE_DATABASE_URL=${successfulConnection}\n`);
    console.log('Update both .env and .env.production files with this URL.');
    console.log('=' .repeat(60));
  } else {
    console.log('❌ All connection attempts failed.');
    console.log('Please check:');
    console.log('1. Project ID is correct: fbvhaeqfylrdhvvdcwzh');
    console.log('2. Password is correct');
    console.log('3. Pooler is enabled in Supabase dashboard');
    console.log('4. Check the Connection String in Supabase dashboard for the exact format');
  }
}

testSupavisorConnections();