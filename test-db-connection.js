const { Pool } = require('pg');
require('dotenv').config();

async function testDatabaseConnection() {
  console.log('Testing database connection with updated Pooler URL...\n');
  
  const databaseUrl = process.env.SUPABASE_DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ SUPABASE_DATABASE_URL not found in environment variables');
    return false;
  }
  
  console.log('URL:', databaseUrl.replace(/:([^@]+)@/, ':****@'));
  
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW(), current_database()');
    
    console.log('\n✅ Database connected successfully!');
    console.log('  Time:', result.rows[0].now);
    console.log('  Database:', result.rows[0].current_database);
    
    // Check tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
      LIMIT 10
    `);
    
    if (tablesResult.rows.length > 0) {
      console.log('\nExisting tables:');
      tablesResult.rows.forEach(row => {
        console.log(`  - ${row.table_name}`);
      });
    } else {
      console.log('\n⚠️  No tables found. Run migrations with: npm run db:push');
    }
    
    client.release();
    await pool.end();
    return true;
  } catch (error) {
    console.error('\n❌ Database connection failed:', error.message);
    await pool.end();
    return false;
  }
}

testDatabaseConnection();