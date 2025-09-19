// check-rls-status.js
// Script to check RLS status and try to work around it

const { supabase } = require('./lib/supabase');

async function checkRLSStatus() {
  console.log('=== Checking RLS Status ===\n');
  
  try {
    // Check if we can read from tables
    console.log('1. Testing read access to users table...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (usersError) {
      console.log('❌ Cannot read users table:', usersError.message);
    } else {
      console.log('✅ Can read users table');
    }
    
    // Check if we can read from user_roles table
    console.log('\n2. Testing read access to user_roles table...');
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*')
      .limit(1);
    
    if (rolesError) {
      console.log('❌ Cannot read user_roles table:', rolesError.message);
    } else {
      console.log('✅ Can read user_roles table');
      console.log(`   Found ${roles.length} roles`);
      roles.forEach(role => {
        console.log(`   - ${role.id}: ${role.name} (${role.description})`);
      });
    }
    
    // Try to authenticate as admin user
    console.log('\n3. Testing authentication as admin...');
    
    // Since we can't directly insert, let's try to use the existing auth system
    // but we'll need to work around the RLS policies
    
    console.log('\n=== Workaround Approach ===');
    console.log('Since RLS is enabled, we need to:');
    console.log('1. Use the service role key (which should bypass RLS)');
    console.log('2. Or temporarily disable RLS for administrative tasks');
    console.log('3. Or use the existing simple auth system for testing');
    
    // Test simple auth system
    console.log('\n4. Testing simple auth system...');
    const { loginUser } = require('./simple-auth');
    const loginResult = loginUser('admin@example.com', 'anything');
    console.log('Simple auth login result:', loginResult.success ? 'SUCCESS' : 'FAILED');
    if (loginResult.success) {
      console.log('✅ Simple auth works - you can use this for testing');
      console.log('Token:', loginResult.token.substring(0, 30) + '...');
    } else {
      console.log('❌ Simple auth failed');
    }
    
  } catch (error) {
    console.error('Error checking RLS status:', error);
  }
}

// Run the script if executed directly
if (require.main === module) {
  checkRLSStatus();
}

module.exports = { checkRLSStatus };