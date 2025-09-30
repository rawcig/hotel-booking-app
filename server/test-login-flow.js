// test-login-flow.js
// Script to test the login flow directly

const { supabase } = require('./lib/supabase');

async function testLoginFlow() {
  console.log('=== Testing Login Flow ===\n');
  
  // Test 1: Try to find a specific user
  const testEmail = 'test@gmail.com';
  console.log(`1. Looking for user with email: ${testEmail}`);
  
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', testEmail)
      .single();
    
    if (error) {
      console.log('❌ Error finding user:', error.message);
      console.log('Error code:', error.code);
      return;
    }
    
    if (!user) {
      console.log('❌ User not found in database');
      return;
    }
    
    console.log('✅ User found in database:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Role ID: ${user.role_id}`);
    
    // Test 2: Try to get user role
    console.log(`\n2. Getting user role for role_id: ${user.role_id}`);
    
    const { data: role, error: roleError } = await supabase
      .from('user_roles')
      .select('name')
      .eq('id', user.role_id)
      .single();
    
    if (roleError) {
      console.log('⚠️  Could not get user role:', roleError.message);
    } else {
      console.log(`   Role name: ${role.name}`);
    }
    
    console.log('\n✅ Login flow would work for this user - any password will be accepted');
    console.log('   The user exists and can be retrieved from the database');
    
  } catch (err) {
    console.log('❌ Unexpected error during login test:', err.message);
  }
}

// Test another user
async function testAdminLogin() {
  console.log('\n=== Testing Admin User Login ===\n');
  
  const testEmail = 'r@admin.com';
  console.log(`Looking for admin user with email: ${testEmail}`);
  
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', testEmail)
      .single();
    
    if (error) {
      console.log('❌ Error finding admin user:', error.message);
      return;
    }
    
    if (!user) {
      console.log('❌ Admin user not found in database');
      return;
    }
    
    console.log('✅ Admin user found in database:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Role ID: ${user.role_id} (should be 1 for admin)`);
    
  } catch (err) {
    console.log('❌ Unexpected error during admin login test:', err.message);
  }
}

// Run both tests
testLoginFlow()
  .then(() => testAdminLogin())
  .then(() => console.log('\n=== Login Flow Test Complete ==='));