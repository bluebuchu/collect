import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

console.log('Testing Supabase Client Connection...');
console.log('URL:', supabaseUrl);
console.log('Has Key:', !!supabaseAnonKey);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test with a simple query
async function testSupabase() {
  try {
    // Try to fetch from users table
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Supabase query error:', error);
      
      // Try creating the table if it doesn't exist
      if (error.code === '42P01') {
        console.log('💡 Table "users" does not exist. You may need to run migrations.');
      }
    } else {
      console.log('✅ Supabase client connected successfully!');
      console.log('Query result:', data);
    }

    // Test auth health
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (!sessionError) {
      console.log('✅ Supabase Auth is working');
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

testSupabase();