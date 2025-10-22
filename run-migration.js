const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Direct database connection for migrations
const { Client } = require('pg');

async function runMigration() {
  // Use connection pooling with correct format
  const client = new Client({
    host: 'aws-0-ap-northeast-2.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: 'postgres.khxrgdkgwirkzkfkueka',
    password: 'ETS9kvBGn0DKq3Qz',
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    
    console.log('Reading migration file...');
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'migrations', '0000_spicy_absorbing_man.sql'),
      'utf8'
    );
    
    // Split by statement-breakpoint and filter out empty strings
    const statements = migrationSQL
      .split('--> statement-breakpoint')
      .filter(stmt => stmt.trim().length > 0);
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement) {
        console.log(`Executing statement ${i + 1}/${statements.length}...`);
        await client.query(statement);
      }
    }
    
    console.log('✅ Migration completed successfully!');
    
    // Verify tables were created
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('\nCreated tables:');
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();