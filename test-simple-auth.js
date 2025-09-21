// test-simple-auth.js
// Test script to verify simple-auth functionality

async function testSimpleAuth() {
  try {
    console.log('Testing simple-auth functionality...');
    
    // Test login with default admin user
    console.log('\n1. Testing login with admin@example.com');
    const loginResponse = await fetch('http://localhost:3000/api/simple-auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'anything' // Password isn't validated in simple-auth
      })
    });
    
    console.log('Login response status:', loginResponse.status);
    
    if (loginResponse.ok) {
      const loginResult = await loginResponse.json();
      console.log('✅ Login successful!');
      console.log('User:', loginResult.user.name);
      console.log('Token:', loginResult.token ? 'Received' : 'Not received');
      
      // Test token verification
      console.log('\n2. Testing token verification...');
      const verifyResponse = await fetch('http://localhost:3000/api/simple-auth/verify', {
        headers: {
          'Authorization': `Bearer ${loginResult.token}`
        }
      });
      
      console.log('Verify response status:', verifyResponse.status);
      
      if (verifyResponse.ok) {
        const verifyResult = await verifyResponse.json();
        console.log('✅ Token verification successful!');
        console.log('Verified user:', verifyResult.user.name);
      } else {
        const verifyError = await verifyResponse.text();
        console.log('❌ Token verification failed:', verifyError);
      }
    } else {
      const loginError = await loginResponse.text();
      console.log('❌ Login failed:', loginError);
    }
    
    // Test login with regular user
    console.log('\n3. Testing login with user@example.com');
    const userLoginResponse = await fetch('http://localhost:3000/api/simple-auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'user@example.com',
        password: 'anything' // Password isn't validated in simple-auth
      })
    });
    
    console.log('User login response status:', userLoginResponse.status);
    
    if (userLoginResponse.ok) {
      const userLoginResult = await userLoginResponse.json();
      console.log('✅ User login successful!');
      console.log('User:', userLoginResult.user.name);
      console.log('Token:', userLoginResult.token ? 'Received' : 'Not received');
    } else {
      const userLoginError = await userLoginResponse.text();
      console.log('❌ User login failed:', userLoginError);
    }
    
  } catch (error) {
    console.error('Error testing simple auth:', error.message);
    console.log('\n💡 Make sure the server is running on http://localhost:3000');
  }
}

// Run the test
testSimpleAuth();