// add-sample-user.js
// Script to add a sample user directly to the database

// Import the Supabase client correctly
const { createClient } = require('@supabase/supabase-js');

// Get Supabase configuration from environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function addSampleUser() {
  try {
    console.log('Adding sample user to database...');
    
    // Insert user directly into database
    // Note: Supabase should auto-generate the ID
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          email: 'admin@example.com',
          name: 'Admin User',
          phone: '+1234567890',
          role_id: 1 // Admin role
        }
      ])
      .select()
      .single();
    
    if (error) {
      console.error('Error inserting user:', error);
      return;
    }
    
    console.log('✅ Sample user added successfully!');
    console.log('User ID:', data.id);
    console.log('User email:', data.email);
    
    // Test login
    console.log('');
    console.log('Testing login...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'anything' // Password isn't validated in simple-auth
      })
    });
    
    if (loginResponse.ok) {
      const loginResult = await loginResponse.json();
      console.log('✅ Login successful!');
      console.log('Token:', loginResult.token ? 'Received' : 'Not received');
    } else {
      const loginError = await loginResponse.text();
      console.log('❌ Login failed:', loginError);
    }
    
  } catch (error) {
    console.error('Error adding sample user:', error.message);
    console.log('💡 Make sure the server is running and database is accessible');
  }
}

// Load environment variables
require('dotenv').config({ path: './server/.env' });

// Run the function
addSampleUser();
