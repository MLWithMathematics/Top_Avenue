import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const mockRooms = [
  { name: 'Ocean View Suite',       price: 499,  description: 'Panoramic views with premium amenities.',                  capacity: 2, quantity: 5,  status: 'vacant' },
  { name: 'Deluxe King Room',       price: 299,  description: 'Spacious room with a king-size bed.',                       capacity: 2, quantity: 10, status: 'vacant' },
  { name: 'Standard Double',        price: 199,  description: 'Comfortable stay with city views.',                         capacity: 4, quantity: 15, status: 'vacant' },
  { name: 'Presidential Penthouse', price: 1299, description: 'The ultimate luxury experience with a private pool.',       capacity: 6, quantity: 2,  status: 'vacant' },
];

async function seed() {
  const { data, error } = await supabase.from('rooms').insert(mockRooms).select();
  if (error) {
    console.error('Error inserting rooms:', error.message);
  } else {
    console.log('Successfully seeded rooms:', data.length);
  }
}

seed();
