// Simple test script to check login functionality
const fetch = require('node-fetch');

async function testLogin() {
  try {
    console.log('Testing login API...');
    
    // Test with default admin user
    const response = await fetch('http://localhost:3000/api/simple-auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'anything' // Password isn't actually checked in simple-auth
      })
    });
    
    const result = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(result, null, 2));
    
    if (response.ok && result.success) {
      console.log('Login successful!');
      console.log('Token:', result.token);
    } else {
      console.log('Login failed:', result.message);
    }
  } catch (error) {
    console.error('Error testing login:', error.message);
  }
}

testLogin();