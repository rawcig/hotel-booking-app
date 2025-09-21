// quick-login-test.js
// Quick test to verify login functionality

const fetch = require('node-fetch');

async function testLogin() {
  try {
    console.log('Testing login functionality...');
    
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'anything'
      })
    });
    
    console.log('Login response status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Login successful!');
      console.log('User:', result.user.name);
      console.log('Token:', result.token ? 'Received' : 'Not received');
    } else {
      const error = await response.text();
      console.log('❌ Login failed:', error);
    }
  } catch (error) {
    console.log('Error testing login:', error.message);
    console.log('💡 Make sure the server is running on http://localhost:3000');
  }
}

testLogin();