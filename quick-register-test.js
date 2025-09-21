// quick-register-test.js
// Quick test to register and then login

const fetch = require('node-fetch');

async function testRegisterAndLogin() {
  try {
    console.log('Testing registration...');
    
    // Register a new user
    const registerResponse = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123'
      })
    });
    
    console.log('Register response status:', registerResponse.status);
    
    if (registerResponse.ok) {
      const registerResult = await registerResponse.json();
      console.log('✅ Registration successful!');
      console.log('User:', registerResult.user.name);
    } else {
      const registerError = await registerResponse.text();
      console.log('Registration failed (might already exist):', registerError);
    }
    
    // Now try to login
    console.log('\nTesting login...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'password123'
      })
    });
    
    console.log('Login response status:', loginResponse.status);
    
    if (loginResponse.ok) {
      const loginResult = await loginResponse.json();
      console.log('✅ Login successful!');
      console.log('User:', loginResult.user.name);
      console.log('Token:', loginResult.token ? 'Received' : 'Not received');
    } else {
      const loginError = await loginResponse.text();
      console.log('❌ Login failed:', loginError);
    }
  } catch (error) {
    console.log('Error testing registration/login:', error.message);
    console.log('💡 Make sure the server is running on http://localhost:3000');
  }
}

testRegisterAndLogin();