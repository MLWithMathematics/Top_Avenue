import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('Testing Supabase connection to:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  const { data, error } = await supabase.from('rooms').select('*').limit(1);
  if (error) {
    console.error('Error connecting to Supabase or fetching rooms:', error.message);
  } else {
    console.log('Successfully connected! Rooms found:', data);
  }
}

testConnection();
