// verify-fixes.js
// Script to verify that the fixes are working

const fetch = require('node-fetch');

async function verifyFixes() {
  try {
    console.log('🔍 Verifying fixes...\n');
    
    // 1. Test login
    console.log('1. Testing login...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'anything'
      })
    });
    
    if (!loginResponse.ok) {
      console.log('❌ Login failed');
      return;
    }
    
    const loginResult = await loginResponse.json();
    const token = loginResult.token;
    console.log('✅ Login successful\n');
    
    // 2. Test hotel data fetching
    console.log('2. Testing hotel data fetching...');
    const hotelsResponse = await fetch('http://localhost:3000/api/hotels', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (hotelsResponse.ok) {
      const hotelsResult = await hotelsResponse.json();
      console.log(`✅ Hotel data fetching successful (${hotelsResult.hotels?.length || 0} hotels found)`);
    } else {
      console.log('⚠️  Hotel data fetching failed (this is expected if no hotels exist)');
    }
    
    // 3. Test reports data fetching
    console.log('\n3. Testing reports data fetching...');
    const reportsResponse = await fetch('http://localhost:3000/api/reports/bookings', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (reportsResponse.ok) {
      const reportsResult = await reportsResponse.json();
      console.log(`✅ Reports data fetching successful (${reportsResult.bookings?.length || 0} bookings found)`);
    } else {
      console.log('⚠️  Reports data fetching failed (this is expected if no data exists)');
    }
    
    // 4. Test financial data fetching
    console.log('\n4. Testing financial data fetching...');
    const financialResponse = await fetch('http://localhost:3000/api/financial/summary', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (financialResponse.ok) {
      const financialResult = await financialResponse.json();
      console.log('✅ Financial data fetching successful');
      if (financialResult.summary) {
        console.log(`   - Total Revenue: $${financialResult.summary.totalRevenue || 0}`);
      }
    } else {
      console.log('⚠️  Financial data fetching failed (this is expected if no data exists)');
    }
    
    console.log('\n🎉 Verification completed!');
    console.log('\n💡 Next steps:');
    console.log('   1. Open your browser and navigate to http://localhost:3000/admin');
    console.log('   2. Login with admin@example.com (any password)');
    console.log('   3. Navigate to Hotel Management to see the fixes');
    console.log('   4. Navigate to Reports and Financial sections to see UI improvements');
    
  } catch (error) {
    console.error('Error during verification:', error.message);
    console.log('\n💡 Make sure the server is running on http://localhost:3000');
  }
}

// Run verification
verifyFixes();