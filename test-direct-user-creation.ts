// test-direct-user-creation.ts
// Direct database user creation for testing purposes

import { supabase } from '@/lib/supabase';

async function createDirectUser() {
  console.log('=== Direct User Creation Test ===');
  
  try {
    // Test data
    const userData = {
      id: `test-user-${Date.now()}`,
      name: 'test',
      email: 'test@example.com',
      phone: '+1234567890',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('Creating user directly in database...');
    console.log('User data:', userData);
    
    // Try to insert user directly into users table
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();
    
    if (error) {
      console.error('Direct user creation failed:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      return { success: false, error };
    }
    
    console.log('Direct user creation successful:', data);
    return { success: true, data };
    
  } catch (error) {
    console.error('Error in direct user creation:', error);
    return { success: false, error };
  }
}

// Run the test
createDirectUser().then(result => {
  console.log('Final result:', result);
}).catch(console.error);