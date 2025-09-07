import { testConnection, db } from './server/db.ts';
import { users } from './shared/schema.ts';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🔍 Testing Supabase connection...');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('Database URL configured:', process.env.SUPABASE_DATABASE_URL ? '✅' : '❌');

// Test basic connection
testConnection().then(async (connected) => {
  if (connected) {
    console.log('\n📊 Testing Drizzle ORM query...');
    try {
      // Test a simple query
      const userCount = await db.select().from(users).limit(1);
      console.log('✅ Drizzle ORM is working!');
      console.log('Sample query result:', userCount);
    } catch (error) {
      console.error('❌ Drizzle ORM query failed:', error.message);
      console.log('\n💡 This might be because tables don\'t exist yet.');
      console.log('Run "npm run db:push" to create tables in Supabase.');
    }
  }
  process.exit(0);
});