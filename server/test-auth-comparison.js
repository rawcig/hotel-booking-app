// test-auth-comparison.js
// Script to test both authentication systems and provide recommendations

const { supabase } = require('./lib/supabase');
const { loginUser } = require('./simple-auth'); // Import simple auth

console.log('=== Authentication Systems Comparison ===\n');

async function testBothSystems() {
  console.log('1. Testing database connection for main auth system...');
  
  try {
    // Test if we can access users table
    const { data, error } = await supabase
      .from('users')
      .select('id, email, name')
      .limit(1);
    
    if (error) {
      console.log('❌ Main auth system has database issues:', error.message);
      console.log('💡 Recommendation: Use simple auth system for testing\n');
    } else {
      console.log('✅ Main auth system can access database');
      
      if (data && data.length > 0) {
        console.log(`   Found ${data.length} user(s) in database`);
        console.log('   Example user:', data[0]);
      }
    }
  } catch (err) {
    console.log('❌ Main auth system connection failed:', err.message);
  }
  
  console.log('\n2. Testing simple auth system...');
  
  try {
    // Test simple auth system
    const simpleAuthResult = loginUser('admin@example.com', 'any_password');
    
    if (simpleAuthResult.success) {
      console.log('✅ Simple auth system is working');
      console.log('   User:', simpleAuthResult.user);
      console.log('   Token length:', simpleAuthResult.token.length, 'characters\n');
    } else {
      console.log('❌ Simple auth system failed:', simpleAuthResult.message);
    }
  } catch (err) {
    console.log('❌ Simple auth system error:', err.message);
  }
  
  console.log('=== Recommendation ===');
  console.log('For development and testing:');
  console.log('✅ Use simple auth system at /api/simple-auth/login');
  console.log('   - Works without database configuration');
  console.log('   - Pre-configured users available');
  console.log('   - Bypasses RLS issues\n');
  
  console.log('For production:');
  console.log('✅ Configure SUPABASE_SERVICE_ROLE_KEY in your .env file');
  console.log('   - Get this from your Supabase dashboard');
  console.log('   - This allows main auth system to work properly');
  console.log('   - Provides proper password verification');
  
  console.log('\n=== Test Complete ===');
}

// Run the test
testBothSystems().catch(console.error);