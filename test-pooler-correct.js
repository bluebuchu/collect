const { Client } = require('pg');
require('dotenv').config();

async function testCorrectPoolerFormat() {
  console.log('Testing Correct Supabase Pooler Format...\n');
  
  const configs = [
    {
      name: "Session Pooler (correct format)",
      config: {
        host: 'aws-0-ap-northeast-2.pooler.supabase.com',
        port: 5432,
        database: 'postgres',
        user: 'postgres.fbvhaeqfylrdhvvdcwzh',
        password: 's3DrvDjukytv2AEB',
        ssl: { rejectUnauthorized: false }
      }
    },
    {
      name: "Transaction Pooler (correct format)",
      config: {
        host: 'aws-0-ap-northeast-2.pooler.supabase.com',
        port: 6543,
        database: 'postgres',
        user: 'postgres.fbvhaeqfylrdhvvdcwzh',
        password: 's3DrvDjukytv2AEB',
        ssl: { rejectUnauthorized: false }
      }
    }
  ];

  for (const item of configs) {
    console.log(`Testing: ${item.name}`);
    console.log(`  Host: ${item.config.host}`);
    console.log(`  Port: ${item.config.port}`);
    console.log(`  User: ${item.config.user}`);
    
    const client = new Client(item.config);

    try {
      await client.connect();
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
        console.log('  No tables found (need to run migrations)');
      }
      
      await client.end();
      
      // Construct connection string
      const connectionString = `postgresql://${item.config.user}:${item.config.password}@${item.config.host}:${item.config.port}/${item.config.database}`;
      console.log('\n✨ Use this connection string in .env:');
      console.log(`SUPABASE_DATABASE_URL=${connectionString}\n`);
      
      return true;
    } catch (error) {
      console.log('❌ FAILED:', error.message, '\n');
      try {
        await client.end();
      } catch (e) {}
    }
  }
  
  console.log('All connection attempts failed.');
  return false;
}

testCorrectPoolerFormat();