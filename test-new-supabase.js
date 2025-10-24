const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fbvhaeqfylrdhvvdcwzh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZidmhhZXFmeWxyZGh2dmRjd3poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyOTA0OTcsImV4cCI6MjA3Njg2NjQ5N30.VOY-V-BG-9OS3n-R-S95kWxIeAGfnPzdPM_62lUJThE';

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