1// Detailed test script to check login functionality
const fetch = require('node-fetch');

async function testLogin() {
  try {
    console.log('Testing login API...');
    
    // Test with default admin user
    const email = 'admin@example.com';
    const password = 'anything'; // Password isn't actually checked in simple-auth
    
    console.log('Attempting login for:', email);
    
    const response = await fetch('http://localhost:3000/api/simple-auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', [...response.headers.entries()]);
    
    const result = await response.json();
    console.log('Response data:', JSON.stringify(result, null, 2));
    
    if (response.ok && result.success) {
      console.log('Login successful!');
      console.log('Token:', result.token);
    } else {
      console.log('Login failed:', result.message);
    }
  } catch (error) {
    console.error('Error testing login:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Also test if the server is running
async function testServer() {
  try {
    console.log('Testing if server is running...');
    const response = await fetch('http://localhost:3000/api/health');
    console.log('Health check status:', response.status);
    const result = await response.json();
    console.log('Health check result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Server is not running or not accessible:', error.message);
  }
}

async function runTests() {
  await testServer();
  console.log('---');
  await testLogin();
}

runTests();