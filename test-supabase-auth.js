// test-supabase-auth.js
// Simple test script to check Supabase authentication

const fetch = require('node-fetch');

async function testSupabaseAuth() {
  try {
    console.log('Testing Supabase authentication...');
    
    // Test login with default user
    console.log('\n1. Testing login with admin@example.com');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'anything' // Password isn't checked in current implementation
      })
    });
    
    console.log('Login response status:', loginResponse.status);
    
    if (loginResponse.status === 404) {
      console.log('❌ Auth endpoint not found. Make sure the server is running.');
      return;
    }
    
    const loginResult = await loginResponse.json();
    console.log('Login response:', JSON.stringify(loginResult, null, 2));
    
    if (loginResponse.ok && loginResult.success) {
      console.log('✅ Login successful!');
      console.log('Token:', loginResult.token);
      
      // Test accessing protected endpoint with token
      console.log('\n2. Testing access to protected endpoint...');
      const protectedResponse = await fetch('http://localhost:3000/api/admin/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${loginResult.token}`
        }
      });
      
      console.log('Protected endpoint status:', protectedResponse.status);
      const protectedResult = await protectedResponse.json();
      console.log('Protected endpoint response:', JSON.stringify(protectedResult, null, 2));
      
      if (protectedResponse.ok) {
        console.log('✅ Access to protected endpoint successful!');
      } else {
        console.log('❌ Failed to access protected endpoint.');
      }
    } else {
      console.log('❌ Login failed:', loginResult.message);
      
      // Test registration as fallback
      console.log('\n3. Testing registration...');
      const registerResponse = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        })
      });
      
      console.log('Registration response status:', registerResponse.status);
      const registerResult = await registerResponse.json();
      console.log('Registration response:', JSON.stringify(registerResult, null, 2));
      
      if (registerResponse.ok && registerResult.success) {
        console.log('✅ Registration successful!');
      } else {
        console.log('❌ Registration failed:', registerResult.message);
      }
    }
  } catch (error) {
    console.error('Error testing Supabase auth:', error.message);
    console.log('\n💡 Make sure the server is running on http://localhost:3000');
    console.log('   You can start it with: cd server && npm start');
  }
}

// Run the test
testSupabaseAuth();