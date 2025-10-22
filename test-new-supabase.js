const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://khxrgdkgwirkzkfkueka.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoeHJnZGtnd2lya3prZmt1ZWthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNTUxNTcsImV4cCI6MjA3NjYzMTE1N30.XQMki6Pg68JKRZc0ZZywJnT_tIc97Ic4aj11w2le5oo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Testing new Supabase connection...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error && error.code === '42P01') {
      console.log('✓ Successfully connected to new Supabase project!');
      console.log('⚠ Tables not created yet. Please run the migration SQL.');
      return;
    }
    
    if (error) {
      console.error('Connection error:', error);
      return;
    }
    
    console.log('✓ Successfully connected to new Supabase project!');
    console.log('✓ Tables exist in database');
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testConnection();